import { AiUnavailable, draftReply } from "@/lib/ai";
import { withDefaults } from "@/lib/dashboard";
import type { SiteRow } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

/* Draft a reply to one enquiry (Figma page 24, IN2). Free: reply drafts
   cost no credits. RLS keeps owners to their own enquiries. */

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "signed_out" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "not_configured" }, { status: 503 });

  let id = "";
  try { id = String((await request.json()).id || ""); } catch {}
  const { data: enquiry } = await supabase.from("enquiries").select("id, site_id, name, message").eq("id", id).maybeSingle();
  if (!enquiry) return Response.json({ error: "not_found" }, { status: 404 });
  const { data: row } = await supabase.from("sites").select("*").eq("id", enquiry.site_id).eq("user_id", user.id).maybeSingle();
  if (!row) return Response.json({ error: "not_found" }, { status: 404 });

  const site = withDefaults(row as SiteRow);
  const c = site.content;
  const facts = [
    `Headline: ${c.hero.headline}`,
    c.hero.sub ? `About: ${c.hero.sub}` : "",
    c.items.list.length ? `Items and prices: ${c.items.list.slice(0, 30).map((i) => `${i.title}${i.price ? ` (${i.price})` : ""}`).join("; ")}` : "",
    c.brand.phone ? `Phone: ${c.brand.phone}` : "",
    c.brand.email ? `Email: ${c.brand.email}` : "",
    `Website: https://${site.slug}.wintechstudio.com`,
  ].filter(Boolean).join("\n");

  try {
    const out = await draftReply({
      siteName: site.name,
      ownerName: String(user.user_metadata?.full_name || "").split(" ")[0] || site.name,
      siteFacts: facts,
      customer: enquiry.name,
      message: enquiry.message,
    });
    if (out === "refused") return Response.json({ error: "refused" }, { status: 422 });
    return Response.json(out);
  } catch (err) {
    if (err instanceof AiUnavailable) return Response.json({ error: err.code }, { status: err.code === "busy" ? 429 : 502 });
    throw err;
  }
}
