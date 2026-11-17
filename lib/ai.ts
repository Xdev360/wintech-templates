import Anthropic, { APIConnectionError, APIError, RateLimitError } from "@anthropic-ai/sdk";
import { CONTENT_GUIDE, type SiteContent } from "./site-model";
import { KINDS, TEMPLATES, type TemplateDef } from "./templates";

/* ──────────────────────────────────────────────────────────────
   Wintech AI's brain, shared by the dashboard chat and "build my site".

   Claude returns structured JSON. Content changes come back as a JSON
   patch in a string, which the server parses and cleans with
   sanitizeContent() before anything is shown or saved. Claude never
   writes to the database; the owner approves every change.
   ────────────────────────────────────────────────────────────── */

const client = new Anthropic();

/* SDK 0.71's beta typings predate `fallbacks` and `output_config.format`,
   though the API accepts both. Passing them as variables rather than
   inline literals gets past the excess-property check without a cast, so
   the rest of each request stays type-checked. */
const FALLBACKS = { fallbacks: "default" };

export class AiUnavailable extends Error {
  constructor(public code: "busy" | "unreachable" | "ai_error") { super(code); }
}


async function structured<T>(system: string, messages: Anthropic.MessageParam[], schema: object): Promise<T | "refused"> {
  const outputConfig = { effort: "low", format: { type: "json_schema", schema } } as const;
  let text = "";
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 16000,
      // If Opus 5 declines, Anthropic re-runs the request on its
      // recommended fallback model instead of returning a refusal.
      betas: ["server-side-fallback-2026-07-01"],
      ...FALLBACKS,
      output_config: outputConfig,
      system,
      messages,
    });
    if (response.stop_reason === "refusal") return "refused";
    for (const block of response.content) if (block.type === "text") text += block.text;
  } catch (err) {
    if (err instanceof RateLimitError) throw new AiUnavailable("busy");
    if (err instanceof APIConnectionError) throw new AiUnavailable("unreachable");
    if (err instanceof APIError) {
      console.error("[wintech-ai] Anthropic error", err.status, err.message);
      throw new AiUnavailable("ai_error");
    }
    throw err;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiUnavailable("ai_error");
  }
}

/* A one-word round trip, so a developer can check the key and the request
   shape without spending a credit or touching a site. */
export async function aiCheck(): Promise<{ ok: true; model: string } | { ok: false; code: string; detail: string }> {
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, code: "no_key", detail: "ANTHROPIC_API_KEY is not set in platform/.env.local" };
  try {
    const out = await structured<{ word?: string }>(
      "Reply with the single word ok.",
      [{ role: "user", content: "Say ok." }],
      { type: "object", additionalProperties: false, required: ["word"], properties: { word: { type: "string" } } },
    );
    if (out === "refused") return { ok: false, code: "refused", detail: "The model declined a trivial prompt." };
    return { ok: true, model: "claude-opus-5" };
  } catch (err) {
    if (err instanceof AiUnavailable) return { ok: false, code: err.code, detail: "See the server log for the Anthropic error." };
    return { ok: false, code: "unknown", detail: err instanceof Error ? err.message : String(err) };
  }
}

function parsePatch(json: unknown): unknown {
  if (typeof json !== "string" || !json.trim()) return {};
  try { return JSON.parse(json); } catch { return {}; }
}

/* ── The dashboard chat ───────────────────────────────────────── */

export async function askAboutSite(opts: {
  def: TemplateDef;
  siteName: string;
  slug: string;
  published: boolean;
  content: SiteContent;
  messages: Anthropic.MessageParam[];
}): Promise<{ reply: string; patch: unknown } | "refused"> {
  const { def, content } = opts;
  const system = `You are Wintech AI, the assistant inside a Wintech Templates dashboard. You help one business owner run and restructure their own website.

The site: "${opts.siteName}", a ${KINDS.find((k) => k.id === def.kind)?.label.toLowerCase()} on the "${def.name}" template, at ${opts.slug}.wintechstudio.com${opts.published ? "" : " (hidden, not published yet)"}.

${CONTENT_GUIDE}

How to answer
- Reply in plain, friendly English, one to three sentences. No markdown.
- When the owner asks for a change, return it in "patch_json": a JSON object with ONLY the top-level keys you are changing, each with its complete new value. To edit one product, send the whole "items" object with the full list.
- You may restructure the page: add, remove, reorder, or rewrite items, FAQs, and figures; reorder or hide sections.
- When they only ask a question, answer it and set "patch_json" to "".
- Never invent contact details, prices, or testimonials. If they ask for testimonials, use only words they give you.
- Write for their customers: concrete, short, no hype, no exclamation marks.
- Nothing is saved until they press Apply, so say briefly what you changed.`;

  const last = opts.messages[opts.messages.length - 1];
  const messages: Anthropic.MessageParam[] = [
    ...opts.messages.slice(0, -1),
    { role: "user", content: `Current content:\n${JSON.stringify(content)}\n\nThe owner says:\n${last.content as string}` },
  ];

  const out = await structured<{ reply?: string; patch_json?: string }>(system, messages, {
    type: "object",
    additionalProperties: false,
    required: ["reply", "patch_json"],
    properties: { reply: { type: "string" }, patch_json: { type: "string" } },
  });
  if (out === "refused") return out;
  return { reply: (out.reply || "Done.").trim(), patch: parsePatch(out.patch_json) };
}

/* ── Build a site from a description ──────────────────────────── */

export async function buildFromBrief(brief: string): Promise<{ template: string; name: string; slug: string; reply: string; patch: unknown } | "refused"> {
  const catalogue = TEMPLATES.map((t) => `- ${t.id}: ${t.name} (${t.kind}). ${t.blurb}`).join("\n");
  const system = `You are Wintech AI. From a short description of a business, you choose the best Wintech template and write the whole website for it.

Templates:
${catalogue}

${CONTENT_GUIDE}

Rules
- Pick the one template that fits the business best.
- Write real, specific content for this business: headline, products or services with the prices they gave you, about, FAQ answers from what they told you.
- If they did not give prices, leave "price" empty rather than inventing one. Never invent contact details or testimonials: set "testimonials" to [] unless they gave you quotes.
- Nigerian context by default: naira prices written like ₦12,000, Lagos place names, bank transfer payments.
- Plain, concrete English. No hype, no exclamation marks.
- "content_json" is the full content object as a JSON string. "slug" is a short lowercase web name (letters, numbers, hyphens).`;

  const out = await structured<{ template?: string; business_name?: string; slug?: string; reply?: string; content_json?: string }>(
    system,
    [{ role: "user", content: brief.slice(0, 3000) }],
    {
      type: "object",
      additionalProperties: false,
      required: ["template", "business_name", "slug", "reply", "content_json"],
      properties: {
        template: { type: "string", enum: TEMPLATES.map((t) => t.id) },
        business_name: { type: "string" },
        slug: { type: "string" },
        reply: { type: "string" },
        content_json: { type: "string" },
      },
    },
  );
  if (out === "refused") return out;
  return {
    template: out.template || "landing-business",
    name: (out.business_name || "").trim(),
    slug: (out.slug || "").trim(),
    reply: (out.reply || "").trim(),
    patch: parsePatch(out.content_json),
  };
}

/* A reply to one enquiry from the site's form (Figma page 24, IN2):
   an email and a short WhatsApp version. Uses only what the site says,
   so it never invents prices or delivery terms. Free to the owner. */
export async function draftReply(opts: {
  siteName: string;
  ownerName: string;
  siteFacts: string;
  customer: string;
  message: string;
}): Promise<{ email: string; whatsapp: string } | "refused"> {
  const system =
    "You draft replies for a small Nigerian business owner answering a customer who wrote through their website. " +
    "Write warm, plain, short Nigerian-English replies. Use ONLY facts in SITE FACTS for prices, delivery, timings and links; " +
    "if the answer is not in the facts, say the owner will confirm and keep it honest. Never invent numbers. No em dashes. " +
    "Sign the email with the owner's first name and the business name.";
  const user =
    `SITE: ${opts.siteName}\nOWNER: ${opts.ownerName}\nSITE FACTS:\n${opts.siteFacts}\n\nCUSTOMER: ${opts.customer}\nMESSAGE:\n${opts.message}`;
  return structured<{ email: string; whatsapp: string }>(system, [{ role: "user", content: user }], {
    type: "object",
    properties: {
      email: { type: "string", description: "The email reply, 40 to 120 words, with greeting and sign-off." },
      whatsapp: { type: "string", description: "A short WhatsApp version, under 45 words, no sign-off." },
    },
    required: ["email", "whatsapp"],
    additionalProperties: false,
  });
}
