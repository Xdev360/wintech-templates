import type { SectionKey, SiteContent } from "./site-model";

/* A readable list of what changed between two versions of a site, for
   the before-and-after card that Wintech AI shows. */

export type Change = { label: string; before: string; after: string; swatch?: boolean };

const SECTION_NAMES: Record<SectionKey, string> = {
  stats: "Figures", items: "List", about: "About", testimonials: "Testimonials", faq: "Questions", contact: "Call to action",
};

const short = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const joined = (xs: string[]) => short(xs.filter(Boolean).join(", "), 120) || "(none)";

export function diffContent(a: SiteContent, b: SiteContent, itemsLabel = "List"): Change[] {
  const out: Change[] = [];
  const field = (label: string, x: string, y: string) => { if (x !== y) out.push({ label, before: short(x), after: short(y) }); };

  if (a.theme.accent !== b.theme.accent) out.push({ label: "Brand colour", before: a.theme.accent, after: b.theme.accent, swatch: true });
  field("Business name", a.brand.name, b.brand.name);
  field("Email", a.brand.email, b.brand.email);
  field("Phone", a.brand.phone, b.brand.phone);
  field("Menu links", a.nav.join(" · "), b.nav.join(" · "));
  field("Small line", a.hero.eyebrow, b.hero.eyebrow);
  field("Headline", a.hero.headline, b.hero.headline);
  field("Under the headline", a.hero.sub, b.hero.sub);
  field("Button text", a.hero.cta, b.hero.cta);
  field("Button link", a.hero.ctaHref, b.hero.ctaHref);
  field(`${itemsLabel} title`, a.items.title, b.items.title);
  const items = (c: SiteContent) => c.items.list.map((i) => (i.price ? `${i.title} ${i.price}` : i.title));
  field(itemsLabel, joined(items(a)), joined(items(b)));
  field(`${itemsLabel} note`, a.items.note, b.items.note);
  field("Figures", joined(a.stats.map((s) => `${s.value} ${s.label}`)), joined(b.stats.map((s) => `${s.value} ${s.label}`)));
  field("About title", a.about.title, b.about.title);
  field("About", a.about.body, b.about.body);
  field("Testimonials", joined(a.testimonials.map((t) => t.name)), joined(b.testimonials.map((t) => t.name)));
  field("Questions", joined(a.faq.map((f) => f.q)), joined(b.faq.map((f) => f.q)));
  field("Call to action", a.contact.title, b.contact.title);
  field("Call to action line", a.contact.line, b.contact.line);
  const order = (c: SiteContent) => c.sections.map((k) => (k === "items" ? itemsLabel : SECTION_NAMES[k])).join(" → ");
  field("Page order", order(a), order(b));
  return out;
}
