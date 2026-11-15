"use client";

import { Plus } from "lucide-react";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { type SectionKey, type SiteContent } from "@/lib/site-model";
import { withSection } from "@/lib/section-seed";
import type { TemplateDef } from "@/lib/templates";

/* ──────────────────────────────────────────────────────────────
   Add a section.

   Every section you are not showing yet, drawn as a small live preview
   in your own template, colour, and words. A section you have not
   written yet shows the starter content it would arrive with, so the
   tile is a promise the page keeps.
   ────────────────────────────────────────────────────────────── */

const ABOUT: Record<SectionKey, string> = {
  stats: "Three or four numbers, side by side.",
  items: "The things you sell, with photos and prices.",
  about: "A paragraph about you, with pictures beside it.",
  testimonials: "What your customers said.",
  faq: "The questions people always ask.",
  contact: "A colour block with your button at the end.",
};

export function SectionPicker({
  def,
  content,
  available,
  labels,
  onAdd,
}: {
  def: TemplateDef;
  content: SiteContent;
  available: SectionKey[];
  labels: Record<SectionKey, string>;
  onAdd: (k: SectionKey) => void;
}) {
  if (!available.length) {
    return (
      <p className="rounded-[12px] bg-soft px-3 py-2.5 text-[12px] text-mute">
        Every section is already on your page. Hide one above to take it off.
      </p>
    );
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {available.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onAdd(k)}
          className="group overflow-hidden rounded-[13px] bg-page text-left shadow-[0_0_0_1px_var(--line)] transition-shadow hover:shadow-[0_0_0_1px_var(--line-2),0_14px_30px_-24px_rgba(0,0,0,0.45)]"
        >
          <span className="block border-b border-line">
            <ScaledPreview ratio={320 / 125} canvas={620} initial={0.31}>
              <TemplateSite template={def} content={withSection(content, def, k)} only={k} />
            </ScaledPreview>
          </span>
          <span className="flex items-start justify-between gap-2 p-3">
            <span className="min-w-0">
              <span className="block text-[13px] font-medium">{labels[k]}</span>
              <span className="block text-[12px] leading-[1.45] text-mute">{ABOUT[k]}</span>
            </span>
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-soft text-mute transition-colors group-hover:bg-accent group-hover:text-accent-ink">
              <Plus className="h-3.5 w-3.5" />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
