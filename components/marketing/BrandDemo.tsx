"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { defaultContent } from "@/lib/site-model";
import { getTemplate } from "@/lib/templates";

/* Pick a colour, watch a real template recolour. This is the same thing
   the editor does: one brand colour, applied everywhere it belongs. */

const COLOURS = ["#B5654A", "#232732", "#0F766E", "#9D2B5A", "#7C3AED", "#E4572E"];

export function BrandDemo() {
  const template = getTemplate("store-skincare")!;
  const [accent, setAccent] = useState(COLOURS[0]);
  const content = { ...defaultContent(template), theme: { accent , accent2: template.theme.hues[1] } };

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
      <div>
        <p className="text-[14px] leading-relaxed text-mute">
          Choose your colour once. Buttons, highlights, and your call to action all follow, and the text on them switches
          between white and black so it always reads.
        </p>
        <div className="mt-6 flex flex-wrap gap-3" role="radiogroup" aria-label="Try a brand colour">
          {COLOURS.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={accent === c} aria-label={c} onClick={() => setAccent(c)}
              className="grid h-12 w-12 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12),0_8px_18px_-10px_rgba(0,0,0,0.4)] transition hover:scale-105"
              style={{ background: c }}>
              {accent === c ? <Check className="h-5 w-5 text-white mix-blend-difference" strokeWidth={3} /> : null}
            </button>
          ))}
        </div>
        <p className="mt-4 font-mono text-[13px] text-mute">{accent}</p>
      </div>
      <div className="overflow-hidden rounded-[18px] bg-card p-[6px] shadow-[0_0_0_1px_var(--line),0_30px_60px_-40px_rgba(35,39,50,0.5)]">
        <div className="overflow-hidden rounded-[13px]">
          <ScaledPreview initial={0.5}>
            <TemplateSite template={template} content={content} />
          </ScaledPreview>
        </div>
      </div>
    </div>
  );
}
