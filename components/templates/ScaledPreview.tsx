"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/* Renders a site at desktop width, then scales it to fit its card.
   CSS cannot divide a width by a width to get a scale, so this measures
   the card once and on resize.

   It is visible from the first paint at `initial`, the scale the card
   usually has, and only corrects itself after measuring. Hiding it until
   JavaScript runs would leave blank cards on a slow connection. */

const CANVAS = 1280;

export function ScaledPreview({
  children,
  ratio = 16 / 10,
  initial = 0.27,
  /** The width the content is drawn at before scaling. A whole site wants
   *  a desktop width; one section in a small tile reads better drawn
   *  narrower, so it is not shrunk to a sliver. */
  canvas = CANVAS,
}: {
  children: ReactNode;
  ratio?: number;
  initial?: number;
  canvas?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initial);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / canvas);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [canvas]);

  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ aspectRatio: ratio }}>
      <div
        inert
        aria-hidden="true"
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: canvas, transform: `scale(${scale})`, pointerEvents: "none" }}
      >
        {children}
      </div>
    </div>
  );
}
