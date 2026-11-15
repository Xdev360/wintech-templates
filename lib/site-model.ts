import { isHex } from "./color";
import { getTemplate, type TemplateDef } from "./templates";

/* ──────────────────────────────────────────────────────────────
   What a site is made of.

   One shape for templates and for customer sites. A template is a
   design (its theme and artwork, in lib/templates.ts) plus default
   content in this shape; a customer's site is the same design with
   their own content. So "use this template" really applies it, and
   Wintech AI or Claude can restructure a site by editing this object:
   adding a product, rewriting the FAQ, moving a section, hiding one.

   The hero always comes first. Everything after it is in `sections`,
   in order, and a section that is not listed is hidden.
   ────────────────────────────────────────────────────────────── */

export type SectionKey = "stats" | "items" | "about" | "testimonials" | "faq" | "contact";
export const SECTION_KEYS: SectionKey[] = ["stats", "items", "about", "testimonials", "faq", "contact"];

/* A product, service, project, or point. `category` groups a shop's grid
   behind filter buttons. `stock` is a count that orders take from; blank
   means always available, which is right for services and made-to-order. */
export type SiteItem = { title: string; meta: string; price: string; image: string; category?: string; stock?: number | null };

export type SiteContent = {
  v: 2;
  theme: { accent: string; accent2: string };
  brand: { name: string; logoUrl: string; email: string; phone: string };
  nav: string[];
  hero: { eyebrow: string; headline: string; sub: string; cta: string; ctaHref: string; image: string };
  stats: { value: string; label: string }[];
  items: { title: string; list: SiteItem[]; note: string };
  about: { title: string; body: string };
  testimonials: { quote: string; name: string; role: string }[];
  faq: { q: string; a: string }[];
  contact: { title: string; line: string };
  sections: SectionKey[];
};

export const FALLBACK_TEMPLATE = "landing-business";

/* The content shape in words, for Wintech AI and for Claude connectors. */
export const CONTENT_GUIDE = `The site's content is one JSON object:
{
  "theme": { "accent": "#RRGGBB", "accent2": "#RRGGBB" },   two brand colours: the main one for buttons, the second for highlights
  "brand": { "name", "email", "phone" },                    business name and contact details
  "nav": ["Shop", "About", "Contact"],                      up to 5 short menu words
  "hero": { "eyebrow", "headline", "sub", "cta", "ctaHref" } top of the page; ctaHref is https://, mailto:, tel:, or ""
  "stats": [{ "value", "label" }],                          up to 4 figures
  "items": { "title", "note", "list": [{ "title", "meta", "price", "category", "stock" }] }   up to 12; "category" groups a shop behind filter buttons; "stock" is a count or null for always available — never invent a stock count
  "about": { "title", "body" },
  "testimonials": [{ "quote", "name", "role" }],            up to 6
  "faq": [{ "q", "a" }],                                    up to 10
  "contact": { "title", "line" },                           the call to action near the bottom
  "sections": ["items", "about", "testimonials", "faq", "contact"]   order after the hero; any of stats, items, about, testimonials, faq, contact; leave one out to hide it
}
Images (logo, main photo, product photos) are uploaded by the owner in the editor. You cannot add or change them.
Bank details are not part of the content and cannot be set here. The owner enters them in Site settings.`;


export function templateFor(id: string): TemplateDef {
  return getTemplate(id) ?? getTemplate(FALLBACK_TEMPLATE)!;
}

/* Sample voices for template previews. They are sample content in a
   template, the way every site builder ships one, and are replaced by
   the owner's own. */
const SAMPLE_QUOTES: Record<TemplateDef["kind"], SiteContent["testimonials"]> = {
  portfolio: [
    { quote: "Clear from the first call, and the work shipped when promised.", name: "Chioma E.", role: "Founder, fintech startup" },
    { quote: "Our sign-ups went up the week the new flow went live.", name: "Daniel O.", role: "Head of product" },
    { quote: "Easy to work with and serious about the details.", name: "Aisha B.", role: "Marketing lead" },
  ],
  landing: [
    { quote: "Setting up took a day and the team noticed the difference that week.", name: "Tunde A.", role: "Operations manager" },
    { quote: "Straightforward, fast, and they answer the phone.", name: "Grace N.", role: "Business owner" },
    { quote: "Exactly what they said it would be.", name: "Ifeanyi K.", role: "Customer" },
  ],
  store: [
    { quote: "Arrived in two days and my skin has never felt calmer.", name: "Funke A.", role: "Customer, Lekki" },
    { quote: "Ordering was simple and the packaging felt like a gift.", name: "Bisi O.", role: "Customer, Ikeja" },
    { quote: "Third order this year. That says enough.", name: "Kemi T.", role: "Customer, Yaba" },
  ],
  booking: [
    { quote: "Booked in a minute, seen on time, and I walked out happy.", name: "Nneka U.", role: "Client" },
    { quote: "No back-and-forth on WhatsApp. I just picked a time.", name: "Seyi M.", role: "Client" },
    { quote: "They remembered exactly what I wanted from last time.", name: "Ada C.", role: "Regular" },
  ],
};

const SAMPLE_FAQ: Record<TemplateDef["kind"], SiteContent["faq"]> = {
  portfolio: [
    { q: "How do projects start?", a: "A short call, then a written plan with a price before any work begins." },
    { q: "How long does a project take?", a: "Most take three to six weeks. You see progress every week." },
    { q: "Do you work remotely?", a: "Yes, with clients in Nigeria and abroad." },
  ],
  landing: [
    { q: "How do I get started?", a: "Send a message with what you need and we reply the same day." },
    { q: "Where do you operate?", a: "Across Lagos, with partners in other cities." },
    { q: "How do payments work?", a: "By bank transfer, with an invoice for every job." },
  ],
  store: [
    { q: "How long does delivery take?", a: "Lagos in one to two days. Other states in three to five." },
    { q: "How do I pay?", a: "By bank transfer at checkout. We confirm and dispatch the same day." },
    { q: "Can I return something?", a: "Unopened items within seven days. Message us and we sort it." },
  ],
  booking: [
    { q: "Do I need to pay a deposit?", a: "A small deposit by bank transfer holds your slot." },
    { q: "Can I reschedule?", a: "Yes, up to 24 hours before. Just send a message." },
    { q: "What if I am running late?", a: "Tell us. We hold your slot for fifteen minutes." },
  ],
};

const DEFAULT_ORDER: Record<TemplateDef["kind"], SectionKey[]> = {
  portfolio: ["stats", "items", "about", "testimonials", "contact"],
  landing: ["stats", "items", "about", "faq", "contact"],
  store: ["items", "about", "testimonials", "faq", "contact"],
  booking: ["items", "about", "testimonials", "faq", "contact"],
};

/** A template's sample content, in the shared shape. */
export function defaultContent(def: TemplateDef): SiteContent {
  const s = def.site;
  return {
    v: 2,
    theme: { accent: def.theme.accent, accent2: def.theme.hues[1] },
    brand: { name: s.brand, logoUrl: "", email: "", phone: "" },
    nav: s.nav,
    hero: { eyebrow: s.eyebrow, headline: s.headline, sub: s.sub, cta: s.cta, ctaHref: "", image: "" },
    stats: (s.stats || []).map(([value, label]) => ({ value, label })),
    items: {
      title: s.itemsTitle,
      list: s.items.map((it) => ({ title: it.title, meta: it.meta || "", price: it.price || "", image: "", category: it.category || "", stock: null })),
      note: s.note || "",
    },
    about: { title: s.aboutTitle, body: s.about },
    testimonials: SAMPLE_QUOTES[def.kind],
    faq: SAMPLE_FAQ[def.kind],
    contact: { title: s.contactTitle, line: s.contactLine },
    sections: DEFAULT_ORDER[def.kind].filter((k) => k !== "stats" || (s.stats && s.stats.length)),
  };
}

/* Sites made before this model stored a few flat fields. Read them into
   the new shape, showing only what the owner actually wrote, so no
   sample content appears on a site that was already live. */
function fromV1(raw: Record<string, unknown>, def: TemplateDef, name: string): SiteContent {
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : "");
  const base = defaultContent(def);
  return {
    ...base,
    theme: { accent: isHex(raw.accent) ? (raw.accent as string) : def.theme.accent, accent2: def.theme.hues[1] },
    brand: { name: str("businessName") || name, logoUrl: str("logoUrl"), email: str("email"), phone: str("phone") },
    nav: ["Contact"],
    hero: { eyebrow: "", headline: str("tagline") || name, sub: str("about"), cta: str("ctaLabel") || "Get in touch", ctaHref: str("ctaHref"), image: str("heroImageUrl") },
    stats: [],
    items: { title: "", list: [], note: "" },
    about: { title: "", body: "" },
    testimonials: [],
    faq: [],
    contact: { title: "Get in touch", line: str("email") ? `Email ${str("email")} or use the button.` : "Send a message and we will reply." },
    sections: ["contact"],
  };
}

/* ── Keeping content safe and sane ─────────────────────────────── */

const cut = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
const url = (v: unknown) => {
  const s = cut(v, 500).trim();
  return /^https:\/\//i.test(s) ? s : "";
};
const href = (v: unknown) => {
  const s = cut(v, 300).trim();
  return s === "" || /^(https?:\/\/|mailto:|tel:)/i.test(s) ? s : "";
};
const list = <T,>(v: unknown, max: number, map: (x: Record<string, unknown>) => T): T[] =>
  Array.isArray(v) ? v.slice(0, max).filter((x) => x && typeof x === "object").map((x) => map(x as Record<string, unknown>)) : [];

/** Cleans anything that claims to be site content: from the editor, from
 *  Wintech AI, or from a Claude connector. Unknown keys are dropped, text is
 *  length-limited, links must be web, mail, or phone, images must be https. */
export function sanitizeContent(input: unknown, fallback: SiteContent): SiteContent {
  const c = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const pick = <K extends keyof SiteContent>(k: K) => (c[k] && typeof c[k] === "object" ? (c[k] as Record<string, unknown>) : null);
  const theme = pick("theme"), brand = pick("brand"), hero = pick("hero"), items = pick("items"), about = pick("about"), contact = pick("contact");

  const sections = Array.isArray(c.sections)
    ? (c.sections as unknown[]).filter((k): k is SectionKey => SECTION_KEYS.includes(k as SectionKey)).filter((k, i, a) => a.indexOf(k) === i)
    : fallback.sections;

  return {
    v: 2,
    theme: {
      accent: theme && isHex(theme.accent) ? (theme.accent as string).toUpperCase() : fallback.theme.accent,
      accent2: theme && isHex(theme.accent2) ? (theme.accent2 as string).toUpperCase() : fallback.theme.accent2,
    },
    brand: brand
      ? { name: cut(brand.name, 60) || fallback.brand.name, logoUrl: url(brand.logoUrl), email: cut(brand.email, 120), phone: cut(brand.phone, 40) }
      : fallback.brand,
    nav: Array.isArray(c.nav) ? (c.nav as unknown[]).slice(0, 5).map((n) => cut(n, 24)).filter(Boolean) : fallback.nav,
    hero: hero
      ? { eyebrow: cut(hero.eyebrow, 80), headline: cut(hero.headline, 140), sub: cut(hero.sub, 400), cta: cut(hero.cta, 32), ctaHref: href(hero.ctaHref), image: url(hero.image) }
      : fallback.hero,
    stats: c.stats !== undefined ? list(c.stats, 4, (x) => ({ value: cut(x.value, 16), label: cut(x.label, 40) })) : fallback.stats,
    items: items
      ? {
          title: cut(items.title, 60),
          note: cut(items.note, 160),
          list: list(items.list, 12, (x) => ({
            title: cut(x.title, 60),
            meta: cut(x.meta, 140),
            price: cut(x.price, 24),
            image: url(x.image),
            category: cut(x.category, 30),
            stock: typeof x.stock === "number" && Number.isFinite(x.stock) ? Math.max(0, Math.min(99999, Math.floor(x.stock))) : null,
          })),
        }
      : fallback.items,
    about: about ? { title: cut(about.title, 60), body: cut(about.body, 800) } : fallback.about,
    testimonials: c.testimonials !== undefined ? list(c.testimonials, 6, (x) => ({ quote: cut(x.quote, 240), name: cut(x.name, 40), role: cut(x.role, 60) })) : fallback.testimonials,
    faq: c.faq !== undefined ? list(c.faq, 10, (x) => ({ q: cut(x.q, 120), a: cut(x.a, 400) })) : fallback.faq,
    contact: contact ? { title: cut(contact.title, 80), line: cut(contact.line, 200) } : fallback.contact,
    sections,
  };
}

/** Whatever is stored, returned as current-shape content. */
export function readContent(raw: unknown, templateId: string, name: string): SiteContent {
  const def = templateFor(templateId);
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  if (r.v === 2) return sanitizeContent(r, defaultContent(def));
  return fromV1(r, def, name);
}

/** Merge a partial change (from an editor, Wintech AI, or Claude) into content. */
export function applyPatch(current: SiteContent, patch: unknown): SiteContent {
  const p = (patch && typeof patch === "object" ? patch : {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...current };
  for (const [k, v] of Object.entries(p)) {
    if (!(k in current) || k === "v") continue;
    const cur = (current as Record<string, unknown>)[k];
    merged[k] = cur && typeof cur === "object" && !Array.isArray(cur) && v && typeof v === "object" && !Array.isArray(v)
      ? { ...(cur as object), ...(v as object) }
      : v;
  }
  return sanitizeContent(merged, current);
}
