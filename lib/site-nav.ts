import type { SectionKey } from "./site-model";

/* ──────────────────────────────────────────────────────────────
   Where a menu word should take you.

   A Wintech site is one page with sections, so the menu jumps rather
   than loads. The owner writes their own words — "Skin quiz",
   "Stylists", "From the grill" — so the match is by meaning, not by a
   fixed list, and anything unrecognised goes to the part of the page
   that can answer a question: the contact form.

   A word never points at a section the owner has hidden. A menu item
   that scrolls nowhere is worse than one that is not there.
   ────────────────────────────────────────────────────────────── */

const MEANINGS: [SectionKey, RegExp][] = [
  ["items", /shop|store|product|menu|cake|new in|men|women|bespoke|service|package|session|treatment|work|project|gallery|galleries|portfolio|speaker|stack|grill|dish|bestseller|price|catalogue|catalog/i],
  ["about", /about|story|who we are|why|how it works|coverage|stylist|team|chef|venue|find us|delivery|private dining|schedule/i],
  ["testimonials", /review|testimonial|what people say|clients|customers say/i],
  ["faq", /faq|question|help|ask/i],
  ["contact", /contact|book|reserve|order|enquir|inquir|get in touch|quote|call|hire|join|waitlist|sign up|start/i],
  ["stats", /figures|numbers|results|impact/i],
];

/** The id on the page a menu word should jump to. */
export function sectionFor(word: string, shown: SectionKey[]): string {
  const hit = MEANINGS.find(([key, test]) => test.test(word) && shown.includes(key));
  if (hit) return `#${hit[0]}`;

  // Nothing matched, or what matched is hidden. Send them somewhere that
  // can take a question, then to whatever the page does show.
  if (shown.includes("contact")) return "#contact";
  return shown.length ? `#${shown[0]}` : "#top";
}
