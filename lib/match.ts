import type { Kind, TemplateDef } from "./templates";

/* ──────────────────────────────────────────────────────────────
   "I sell skincare in Lagos" → the skincare store, then other stores.

   No AI. Whole-word matching against each template's keywords, so a
   short keyword cannot hide inside a longer word ('bar' is not in
   'barber', 'ai' is not in 'again'). Keywords of four letters or more
   also match as a prefix, so 'braid' still finds "braiding".
   ────────────────────────────────────────────────────────────── */

/* Words that say which kind of site someone needs, whatever they sell. */
const KIND_WORDS: Record<Kind, string[]> = {
  portfolio: ["portfolio", "my work", "freelance", "freelancer", "hire me", "cv", "resume"],
  landing: ["landing", "landing page", "one page", "information", "info", "promote", "launch"],
  store: ["store", "shop", "sell", "selling", "sales", "ecommerce", "e-commerce", "online store", "order", "orders", "products", "deliver", "delivery"],
  booking: ["booking", "book", "bookings", "appointment", "appointments", "schedule", "reservation", "reserve", "slots", "calendar"],
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function score(query: string, words: string[]) {
  let total = 0;
  for (const w of words) {
    const e = esc(w);
    if (new RegExp(`\\b${e}\\b`, "i").test(query)) total += w.length + 2;
    else if (w.length >= 4 && new RegExp(`\\b${e}`, "i").test(query)) total += w.length;
  }
  return total;
}

export type Match = { id: string; score: number };

/** Ranked ids. Empty when nothing in the query points anywhere. */
export function matchTemplates(query: string, templates: Pick<TemplateDef, "id" | "kind" | "keywords" | "name">[]): Match[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const kindBoost: Partial<Record<Kind, number>> = {};
  (Object.keys(KIND_WORDS) as Kind[]).forEach((k) => {
    const s = score(q, KIND_WORDS[k]);
    if (s) kindBoost[k] = s;
  });

  return templates
    .map((t) => ({
      id: t.id,
      // A direct hit on what they do outweighs a hint about the kind of site.
      score: score(q, t.keywords) * 2 + score(q, [t.name.toLowerCase()]) + (kindBoost[t.kind] ?? 0),
    }))
    .filter((m) => m.score >= 4)
    .sort((a, b) => b.score - a.score);
}
