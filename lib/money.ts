/* ──────────────────────────────────────────────────────────────
   Money is counted in kobo — whole numbers — and only turned into
   naira for reading. Prices in the editor are text a person typed:
   "₦12,000", "12000", "From ₦5,000", "Free". The digits are the price.
   ────────────────────────────────────────────────────────────── */

export function priceToKobo(price: string): number {
  const digits = (price || "").replace(/[^0-9]/g, "");
  return digits ? Number(digits) * 100 : 0;
}

export function naira(kobo: number): string {
  return `₦${Math.round((kobo || 0) / 100).toLocaleString("en-NG")}`;
}

/** What a shop can sell: a price of nothing cannot be paid for. */
export function isSellable(price: string): boolean {
  return priceToKobo(price) > 0;
}
