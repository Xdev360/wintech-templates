"use client";

/* ──────────────────────────────────────────────────────────────
   A shopping bag that survives leaving the page.

   Kept in the browser, per site, so one person's bag on one shop is
   never mixed with another's. The browser only remembers WHAT was
   chosen; what it costs is decided by the server when the order is
   placed, from the shop's own prices.

   The reference of a placed order is kept too, so someone who wanders
   off mid-transfer comes back to "waiting for payment" rather than to
   an empty page.
   ────────────────────────────────────────────────────────────── */

export type CartLine = { title: string; qty: number };

const bagKey = (slug: string) => `wt-bag:${slug}`;
const orderKey = (slug: string) => `wt-order:${slug}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("wt-bag"));
  } catch {
    // A private window refuses storage. The bag then lasts one page,
    // which is worse but still works.
  }
}

export function getBag(slug: string): CartLine[] {
  const lines = read<CartLine[]>(bagKey(slug), []);
  return Array.isArray(lines) ? lines.filter((l) => l && typeof l.title === "string") : [];
}

export function addToBag(slug: string, title: string) {
  const bag = getBag(slug);
  const found = bag.find((l) => l.title === title);
  if (found) found.qty = Math.min(99, found.qty + 1);
  else bag.push({ title, qty: 1 });
  write(bagKey(slug), bag);
}

export function setQty(slug: string, title: string, qty: number) {
  const bag = getBag(slug).map((l) => (l.title === title ? { ...l, qty } : l)).filter((l) => l.qty > 0);
  write(bagKey(slug), bag);
}

export function clearBag(slug: string) {
  write(bagKey(slug), []);
}

export function countBag(slug: string) {
  return getBag(slug).reduce((n, l) => n + l.qty, 0);
}

/** The order this visitor is in the middle of paying for, if any. */
export function getOpenOrder(slug: string): string {
  return read<string>(orderKey(slug), "");
}

export function setOpenOrder(slug: string, reference: string) {
  write(orderKey(slug), reference);
}

export function clearOpenOrder(slug: string) {
  write(orderKey(slug), "");
}

/** Anything that changes the bag fires this, so the badge keeps up. */
export function onBagChange(fn: () => void) {
  window.addEventListener("wt-bag", fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener("wt-bag", fn);
    window.removeEventListener("storage", fn);
  };
}
