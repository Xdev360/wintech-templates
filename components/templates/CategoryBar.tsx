"use client";

import { useRef, useState } from "react";

/* ──────────────────────────────────────────────────────────────
   Category buttons above a shop's grid: All · Cakes · Bread · Drinks.

   The grid itself is drawn by the template; this only shows and hides
   what is already there, so it works in a preview and on a live site
   alike, and adds nothing to what the page has to load.
   ────────────────────────────────────────────────────────────── */

export function CategoryBar({ categories }: { categories: string[] }) {
  const [active, setActive] = useState("");
  const self = useRef<HTMLDivElement>(null);
  if (categories.length < 2) return null;

  function pick(cat: string) {
    setActive(cat);
    const grid = self.current?.parentElement?.querySelector<HTMLElement>("[data-catalogue]");
    grid?.querySelectorAll<HTMLElement>("[data-category]").forEach((el) => {
      el.hidden = Boolean(cat) && el.dataset.category !== cat;
    });
  }

  return (
    <div ref={self} className="tpl-cats" role="tablist" aria-label="Categories">
      {["", ...categories].map((cat) => (
        <button
          key={cat || "all"}
          type="button"
          role="tab"
          aria-selected={active === cat}
          className={`tpl-cat${active === cat ? " is-on" : ""}`}
          onClick={() => pick(cat)}
        >
          {cat || "All"}
        </button>
      ))}
    </div>
  );
}
