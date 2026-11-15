import { AiUnavailable, buildFromBrief } from "@/lib/ai";
import { FREE_SITE_LIMIT } from "@/lib/config";
import { AI_BUILD_COST } from "@/lib/credits";
import { readCredits } from "@/lib/dashboard";
import { applyPatch, defaultContent, templateFor } from "@/lib/site-model";
import { normalizeSlug, slugError } from "@/lib/slugs";
import { createClient } from "@/lib/supabase/server";

/* ──────────────────────────────────────────────────────────────
   "Describe your business" → Claude picks a template and writes the
   whole site → it is created hidden, so the owner reviews before
   anyone sees it. Costs AI_BUILD_COST credits, taken only on success.
   ────────────────────────────────────────────────────────────── */

export const maxDuration = 90;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "signed_out" }, { status: 401 });

  let brief = "";
  try { brief = String((await request.json()).brief || "").trim(); } catch {}
  if (brief.length < 12) return Response.json({ error: "too_short" }, { status: 400 });

  // Check everything that could stop the site being created BEFORE paying for the model.
  const { count } = await supabase.from("sites").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count || 0) >= FREE_SITE_LIMIT) return Response.json({ error: "site_limit" }, { status: 409 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "not_configured" }, { status: 503 });
  const balance = await readCredits(supabase);
  if (balance === null) return Response.json({ error: "credits_not_set_up" }, { status: 503 });
  if (balance < AI_BUILD_COST) return Response.json({ error: "no_credits", balance }, { status: 402 });

  let built;
  try {
    built = await buildFromBrief(brief);
  } catch (err) {
    if (err instanceof AiUnavailable) return Response.json({ error: err.code }, { status: err.code === "busy" ? 429 : 502 });
    throw err;
  }
  if (built === "refused") return Response.json({ error: "refused" }, { status: 422 });

  const def = templateFor(built.template);
  const content = applyPatch(defaultContent(def), built.patch);
  const name = (built.name || content.brand.name || "My site").slice(0, 60);
  content.brand.name = name;

  // Find a free link: the suggestion, then suggestion-2, -3 ...
  const base = normalizeSlug(built.slug || name) || "mysite";
  let insertedId: string | null = null;
  let lastError = "";
  for (let n = 0; n < 5 && !insertedId; n++) {
    const slug = n === 0 ? base : `${base.slice(0, 44)}-${n + 1}`;
    if (slugError(slug)) continue;
    const { data, error } = await supabase
      .from("sites")
      .insert({ user_id: user.id, name, slug, template: def.id, published: false, content })
      .select("id")
      .single();
    if (data) insertedId = data.id;
    else if (error?.code !== "23505") { lastError = error?.message || "insert failed"; break; }
  }
  if (!insertedId) return Response.json({ error: "create_failed", detail: lastError }, { status: 500 });

  const { data: after } = await supabase.rpc("spend_credits", { p_amount: AI_BUILD_COST, p_reason: "ai_build", p_ref: insertedId });
  return Response.json({ id: insertedId, reply: built.reply, balance: typeof after === "number" ? after : balance - AI_BUILD_COST });
}
