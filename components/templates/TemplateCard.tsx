import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { priceLabel } from "@/lib/template-meta";
import { kindLabel, type TemplateDef } from "@/lib/templates";
import { ScaledPreview } from "./ScaledPreview";
import { TemplateSite } from "./TemplateSite";

/* ──────────────────────────────────────────────────────────────
   Template cards.

   Everything sits inside the box: the preview, then one line of name
   and one line of description, cut with an ellipsis rather than
   wrapping into a paragraph nobody reads. The full site is one click
   away, so the card only has to say which one this is.

   Hovering softens the preview and shows an arrow, so it is obvious
   the card opens something.
   ────────────────────────────────────────────────────────────── */

/* Hero row card: the narrow one that scrolls sideways under the search. */
export function HeroCard({ t }: { t: TemplateDef }) {
  return (
    <Link
      href={`/templates/${t.id}`}
      aria-label={`Preview the ${t.name} template`}
      className="tpl-card-ring group block w-[196px] shrink-0 rounded-[13px] bg-white/60 p-[5px] transition-transform duration-300 hover:-translate-y-0.5 dark:bg-white/10"
    >
      <span className="relative block overflow-hidden rounded-[9px]">
        <ScaledPreview ratio={186 / 118} initial={186 / 1280}>
          <TemplateSite template={t} />
        </ScaledPreview>
        <Peek />
      </span>
      <span className="flex items-baseline justify-between gap-2 px-1 pb-0.5 pt-1.5">
        <span className="truncate text-[12px] font-medium text-ink">{t.name}</span>
        <span className="shrink-0 text-[10.5px] text-mute">{kindLabel(t.kind)}</span>
      </span>
    </Link>
  );
}

/* Gallery card: the grid on the home page and in the library. */
export function GalleryCard({ t }: { t: TemplateDef }) {
  return (
    <Link
      href={`/templates/${t.id}`}
      className="tpl-card-ring group block min-w-0 rounded-[14px] bg-card p-[5px] transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span className="relative block overflow-hidden rounded-[10px]">
        <ScaledPreview>
          <TemplateSite template={t} />
        </ScaledPreview>
        <Peek />
      </span>
      <span className="block min-w-0 px-2 pb-1 pt-2">
        <span className="flex min-w-0 items-baseline justify-between gap-2">
          <span className="truncate text-[13px] font-medium tracking-[-0.01em]">{t.name}</span>
          <span className="shrink-0 text-[11px] text-mute-2">{kindLabel(t.kind)}</span>
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-mute">{t.blurb}</span>
      </span>
    </Link>
  );
}

/* Library card: the one in the big grid, with who made it and what it
   costs. The preview carries no frame of its own — in a grid this size,
   a border around every tile reads as noise, and the work should be the
   only thing with edges. */
export function MarketCard({ t }: { t: TemplateDef }) {
  return (
    <Link href={`/templates/${t.id}`} className="group block min-w-0">
      <span className="relative block overflow-hidden rounded-[12px] shadow-[0_0_0_1px_var(--line)] transition-shadow duration-300 group-hover:shadow-[0_0_0_1px_var(--line-2),0_22px_44px_-30px_rgba(0,0,0,0.55)]">
        <ScaledPreview ratio={16 / 10}>
          <TemplateSite template={t} />
        </ScaledPreview>
        <Peek />
      </span>
      <span className="mt-3 flex min-w-0 items-start justify-between gap-3">
        <span className="block min-w-0">
          <span className="block truncate text-[14px] font-medium tracking-[-0.01em]">{t.name}</span>
          <span className="mt-0.5 block truncate text-[12px] text-mute-2">
            Wintech · {kindLabel(t.kind)}
          </span>
        </span>
        <span className="shrink-0 rounded-[8px] bg-soft px-2.5 py-1 text-[12px] font-medium text-mute">
          {priceLabel(t)}
        </span>
      </span>
    </Link>
  );
}

/* The blur and the arrow that appear on hover. */
function Peek() {
  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 backdrop-blur-[3px] transition-opacity duration-300 group-hover:opacity-100">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)]">
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
      </span>
    </span>
  );
}
