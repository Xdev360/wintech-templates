import type { TemplateDef } from "./templates";

/* ──────────────────────────────────────────────────────────────
   What the gallery filters on.

   Every tag here is read off the template's own design, never typed by
   hand, so a tag can never drift from the thing it describes. Add a
   template and it files itself.
   ────────────────────────────────────────────────────────────── */

export const STYLE_TAGS = ["Dark", "Light", "Bold", "Serif", "Colourful", "Minimal", "Rounded"] as const;
export type StyleTag = (typeof STYLE_TAGS)[number];

function rgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) || 0);
}

/** 0 is black, 1 is white. Perceived, not arithmetic. */
function lightness(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 0 is grey, 1 is a pure hue. */
function saturation(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const l = (max + min) / 2;
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

export function styleTags(t: TemplateDef): StyleTag[] {
  const th = t.theme;
  const tags: StyleTag[] = [lightness(th.bg) < 0.32 ? "Dark" : "Light"];
  if (th.display === "serif") tags.push("Serif");
  if (th.displayWeight >= 700) tags.push("Bold");
  if (th.radius >= 14) tags.push("Rounded");

  // Measured across the four hues the artwork is drawn from, so one
  // muted accent on a loud template does not read as quiet.
  const colour = th.hues.reduce((n, h) => n + saturation(h), saturation(th.accent)) / (th.hues.length + 1);
  tags.push(colour >= 0.42 ? "Colourful" : "Minimal");
  return tags;
}

/* ── Price ────────────────────────────────────────────────────
   Naira, whole numbers. A template with no price is free, which is
   every template today. The gallery hides the price filter entirely
   until at least one costs something, because a menu with one option
   is furniture. */

export function priceOf(t: TemplateDef & { price?: number }): number {
  return typeof t.price === "number" && t.price > 0 ? t.price : 0;
}

export function priceLabel(t: TemplateDef & { price?: number }): string {
  const n = priceOf(t);
  return n === 0 ? "Free" : `₦${n.toLocaleString("en-NG")}`;
}
