import type Anthropic from "@anthropic-ai/sdk";
import { AiUnavailable, askAboutSite } from "@/lib/ai";
import { AI_MESSAGE_COST } from "@/lib/credits";
import { readCredits, withDefaults } from "@/lib/dashboard";
import { diffContent } from "@/lib/site-diff";
import { applyPatch, templateFor } from "@/lib/site-model";
import { createClient } from "@/lib/supabase/server";
import type { SiteRow } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────
   Wintech AI inside a customer's dashboard.

   It reads the site, answers, and may propose changes, including
   restructuring the page. It never saves: the dashboard shows a
   before-and-after list and the owner presses Apply.

   Order matters:
     1. who is asking, and do they own this site
     2. do they have a credit
     3. ask Claude
     4. only then take the credit, so a failed call costs nobody
   ────────────────────────────────────────────────────────────── */

export const maxDuration = 60;

const ITEMS = { store: "Products", booking: "Services", portfolio: "Projects", landing: "Points" } as const;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "signed_out" }, { status: 401 });

  let body: { siteId?: unknown; messages?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  const siteId = typeof body.siteId === "string" ? body.siteId : "";
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const messages: Anthropic.MessageParam[] = incoming
    .filter((m): m is { role: "user" | "assistant"; content: string } =>
      !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim() !== "")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!siteId || messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  while (messages[0]?.role !== "user") messages.shift();

  const { data: row } = await supabase.from("sites").select("*").eq("id", siteId).eq("user_id", user.id).maybeSingle();
  if (!row) return Response.json({ error: "not_found" }, { status: 404 });
  const site = withDefaults(row as SiteRow);
  const def = templateFor(site.template);

  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "not_configured" }, { status: 503 });
  const balance = await readCredits(supabase);
  if (balance === null) return Response.json({ error: "credits_not_set_up" }, { status: 503 });
  if (balance < AI_MESSAGE_COST) return Response.json({ error: "no_credits", balance }, { status: 402 });

  let result;
  try {
    result = await askAboutSite({ def, siteName: site.name, slug: site.slug, published: site.published, content: site.content, messages });
  } catch (err) {
    if (err instanceof AiUnavailable) return Response.json({ error: err.code }, { status: err.code === "busy" ? 429 : 502 });
    throw err;
  }
  if (result === "refused") {
    return Response.json({ reply: "I can't help with that one. Ask me about your site's words, layout, colour, or contact details.", changes: [], patch: null, balance });
  }

  // Clean whatever came back, then describe it for the owner.
  const next = applyPatch(site.content, result.patch);
  const label = def.engine === "reservation" ? "Menu" : ITEMS[def.kind];
  const changes = diffContent(site.content, next, label);

  const { data: after, error: spendError } = await supabase.rpc("spend_credits", { p_amount: AI_MESSAGE_COST, p_reason: "ai_message", p_ref: siteId });

  return Response.json({
    reply: result.reply,
    changes,
    patch: changes.length ? result.patch : null,
    balance: spendError ? Math.max(0, balance - AI_MESSAGE_COST) : Number(after),
  });
}
