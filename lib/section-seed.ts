import { defaultContent, type SectionKey, type SiteContent } from "./site-model";
import type { TemplateDef } from "./templates";

/* ──────────────────────────────────────────────────────────────
   Adding a section that has nothing in it would put an invisible block
   on the page. So a new section arrives with something to edit: the
   template's own sample first, and a plain starter if the template has
   no sample for it. The picker previews the very same thing, so the
   tile shows what you are about to get.
   ────────────────────────────────────────────────────────────── */

const STARTER = {
  stats: [
    { value: "5 yrs", label: "In business" },
    { value: "200+", label: "Customers served" },
    { value: "48h", label: "Typical reply" },
  ],
  testimonials: [
    { quote: "Say what a customer told you here.", name: "A customer", role: "Lagos" },
  ],
  faq: [
    { q: "How do I pay?", a: "Say which ways you take payment." },
    { q: "How long does it take?", a: "Say how long the usual job takes." },
  ],
  about: { title: "About us", body: "Two or three lines about who you are and who you do this for." },
  contact: { title: "Ready when you are.", line: "Send a message and we reply the same day." },
};

function isEmpty(c: SiteContent, k: SectionKey) {
  if (k === "stats") return !c.stats.length;
  if (k === "items") return !c.items.list.length;
  if (k === "about") return !c.about.body.trim();
  if (k === "testimonials") return !c.testimonials.length;
  if (k === "faq") return !c.faq.length;
  return !c.contact.title.trim();
}

/** The content a section should start with, or nothing if it has some already. */
export function sectionSeed(c: SiteContent, def: TemplateDef, k: SectionKey): Partial<SiteContent> {
  if (!isEmpty(c, k)) return {};
  const sample = defaultContent(def);
  if (k === "stats") return { stats: sample.stats.length ? sample.stats : STARTER.stats };
  if (k === "items") return { items: sample.items.list.length ? sample.items : { ...c.items, list: [{ title: "First item", meta: "", price: "", image: "" }] } };
  if (k === "about") return { about: sample.about.body ? sample.about : STARTER.about };
  if (k === "testimonials") return { testimonials: sample.testimonials.length ? sample.testimonials : STARTER.testimonials };
  if (k === "faq") return { faq: sample.faq.length ? sample.faq : STARTER.faq };
  return { contact: sample.contact.title ? sample.contact : STARTER.contact };
}

/** The site as it would look with that section added. Used by the picker. */
export function withSection(c: SiteContent, def: TemplateDef, k: SectionKey): SiteContent {
  return { ...c, ...sectionSeed(c, def, k), sections: [k] };
}
