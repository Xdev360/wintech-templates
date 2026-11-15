/* ──────────────────────────────────────────────────────────────
   One brand colour drives the whole site and the owner's dashboard.

   The text that sits on that colour has to stay readable whatever
   someone picks, so it is chosen here, by contrast, rather than
   hard-coded as white. A yellow button gets dark text.
   ────────────────────────────────────────────────────────────── */

export const DEFAULT_ACCENT = "#232732";

/* Wintech navy and slate first, then a spread for other brands. */
export const ACCENT_PRESETS = [
  "#232732", "#667897", "#0F766E", "#16A34A",
  "#F97316", "#E11D48", "#9D2B5A", "#7C3AED",
];

export function isHex(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function safeAccent(value: unknown) {
  return isHex(value) ? value.toUpperCase() : DEFAULT_ACCENT;
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const WHITE = 1;
const BLACK = luminance("#0A0A0A");

/** White or near-black, whichever reads better on the accent. */
export function inkFor(hex: string) {
  const l = luminance(safeAccent(hex));
  return contrast(l, WHITE) >= contrast(l, BLACK) ? "#FFFFFF" : "#0A0A0A";
}

function toRgb(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
function toHex(rgb: number[]) {
  return "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/* ──────────────────────────────────────────────────────────────
   A button people can read, whatever colour the owner picked.

   Picking "white or black, whichever scores higher" is not enough: black
   on a saturated orange scores well and still looks wrong, and white on
   that same orange is what every designer would choose — but at 3.7:1
   it fails the reading test. So the rule is:

     · white text if it already passes 4.5:1 on the colour as picked;
     · black text only when the colour is genuinely light (yellows,
       pale greens), where black is clearly the right call;
     · otherwise, keep the hue and darken it just far enough for white
       text to pass. On most colours that is a shade nobody notices;
       it is the difference between a brand colour and a readable one.

   The raw accent still colours everything that is not text on a fill.
   ────────────────────────────────────────────────────────────── */
export function readable(hex: string): { fill: string; ink: string } {
  const a = safeAccent(hex);
  const l = luminance(a);
  if (contrast(l, WHITE) >= 4.5) return { fill: a, ink: "#FFFFFF" };
  if (contrast(l, BLACK) >= 7) return { fill: a, ink: "#0A0A0A" };

  let rgb = toRgb(a);
  for (let i = 0; i < 24; i++) {
    rgb = rgb.map((v) => v * 0.93);
    if (contrast(luminance(toHex(rgb)), WHITE) >= 4.5) break;
  }
  return { fill: toHex(rgb), ink: "#FFFFFF" };
}

/** CSS variables to set on any element whose subtree should wear the brand. */
export function accentVars(hex: string): Record<string, string> {
  const a = safeAccent(hex);
  return { "--accent": a, "--accent-ink": inkFor(a) };
}
