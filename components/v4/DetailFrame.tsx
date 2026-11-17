"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Lock, Monitor, Smartphone } from "lucide-react";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { getTemplate } from "@/lib/templates";

/* The browser frame on a template's detail page: the real template,
   scrollable, at desktop or phone width. */
export function DetailFrame({ id, host }: { id: string; host: string }) {
  const [phone, setPhone] = useState(false);
  const t = getTemplate(id);
  if (!t) return null;
  return (
    <div className="hair min-w-0 bg-white">
      <div className="flex h-11 items-center gap-3 border-b border-[var(--v4-line)] px-3">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-[var(--v4-panel)]" />)}
        </span>
        <span className="hair flex h-7 min-w-0 flex-1 items-center gap-2 rounded-[2px] bg-[var(--v4-soft)] px-3 text-[12px] text-[var(--v4-m75)]">
          <Lock className="h-3 w-3 shrink-0" strokeWidth={1.5} /> <span className="truncate">{host}</span>
        </span>
        <div className="flex" role="radiogroup" aria-label="Preview size">
          {([[false, Monitor, "Desktop"], [true, Smartphone, "Phone"]] as const).map(([v, I, l]) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={phone === v}
              aria-label={l}
              onClick={() => setPhone(v)}
              className={`flex h-7 w-8 items-center justify-center rounded-[2px] ${phone === v ? "bg-[var(--v4-panel)]" : "text-[var(--v4-m62)]"}`}
            >
              <I className="h-4 w-4" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
      <div className="h-[760px] overflow-y-auto bg-[var(--v4-panel)] max-md:h-[560px]" tabIndex={0} aria-label={`${t.name} template preview, scroll to see the whole page`}>
        <div className={phone ? "mx-auto w-[300px] py-6" : ""}>
          <div className={phone ? "overflow-hidden rounded-[18px] border-[6px] border-[var(--v4-ink)] bg-white" : ""}>
            <AutoScale key={phone ? "p" : "d"} canvas={phone ? 390 : 1280}>
              <TemplateSite template={t} />
            </AutoScale>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Like ScaledPreview, but the box takes the full height of the scaled page. */
function AutoScale({ canvas, children }: { canvas: number; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState({ s: 0.6, h: 1600 });
  useLayoutEffect(() => {
    const b = box.current, i = inner.current;
    if (!b || !i) return;
    const m = () => setDim({ s: b.clientWidth / canvas, h: i.scrollHeight });
    m();
    const ro = new ResizeObserver(m);
    ro.observe(b);
    ro.observe(i);
    return () => ro.disconnect();
  }, [canvas]);
  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ height: dim.h * dim.s }}>
      <div ref={inner} inert aria-hidden="true" className="absolute left-0 top-0 origin-top-left" style={{ width: canvas, transform: `scale(${dim.s})` }}>
        {children}
      </div>
    </div>
  );
}
