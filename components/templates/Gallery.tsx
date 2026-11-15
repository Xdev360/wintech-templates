"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { priceOf, styleTags, STYLE_TAGS, type StyleTag } from "@/lib/template-meta";
import { KINDS, type TemplateDef } from "@/lib/templates";
import { MarketCard } from "./TemplateCard";

/* ──────────────────────────────────────────────────────────────
   The library.

   One bar of controls, then nothing but work. Filtering happens here
   in the browser rather than on the server: twelve templates today,
   a hundred later, and either way the answer should arrive before a
   finger leaves the screen.

   A menu that can only say one thing is not a menu, so the price
   filter appears only once something actually costs money.
   ────────────────────────────────────────────────────────────── */

type Sort = "picked" | "new";
type Price = "all" | "free" | "paid";

export function Gallery({ templates }: { templates: TemplateDef[] }) {
  const [sort, setSort] = useState<Sort>("picked");
  const [kind, setKind] = useState<string>("all");
  const [price, setPrice] = useState<Price>("all");
  const [style, setStyle] = useState<string>("all");
  const [query, setQuery] = useState("");

  const tagged = useMemo(
    () => templates.map((t) => ({ t, tags: styleTags(t), price: priceOf(t) })),
    [templates],
  );
  const anyPaid = tagged.some((x) => x.price > 0);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = tagged.filter(({ t, tags, price: p }) => {
      if (kind !== "all" && t.kind !== kind) return false;
      if (price === "free" && p > 0) return false;
      if (price === "paid" && p === 0) return false;
      if (style !== "all" && !tags.includes(style as StyleTag)) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.blurb.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q))
      );
    });
    // "Newest" is the reverse of the order they were added in, which is
    // the order they sit in the library.
    return sort === "new" ? [...list].reverse() : list;
  }, [tagged, kind, price, style, query, sort]);

  const dirty = kind !== "all" || price !== "all" || style !== "all" || query.trim() !== "";
  const clear = () => { setKind("all"); setPrice("all"); setStyle("all"); setQuery(""); };

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 border-b border-line pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <SortTab on={sort === "picked"} onClick={() => setSort("picked")}>Recommended</SortTab>
          <SortTab on={sort === "new"} onClick={() => setSort("new")}>Newest</SortTab>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative flex h-9 min-w-0 flex-1 items-center md:w-[190px] md:flex-none">
            <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-mute-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates"
              aria-label="Search templates"
              className="h-9 w-full rounded-[10px] bg-soft pl-8 pr-3 text-[13px] text-ink outline-none placeholder:text-mute-2 focus-visible:ring-2 focus-visible:ring-accent-2"
            />
          </label>

          <Menu
            label="Category"
            value={kind}
            onChange={setKind}
            options={[
              { id: "all", label: "Every kind", count: templates.length },
              ...KINDS.map((k) => ({
                id: k.id,
                label: k.plural,
                count: templates.filter((t) => t.kind === k.id).length,
              })),
            ]}
          />

          {anyPaid ? (
            <Menu
              label="Price"
              value={price}
              onChange={(v) => setPrice(v as Price)}
              options={[
                { id: "all", label: "Any price", count: tagged.length },
                { id: "free", label: "Free", count: tagged.filter((x) => x.price === 0).length },
                { id: "paid", label: "Premium", count: tagged.filter((x) => x.price > 0).length },
              ]}
            />
          ) : null}

          <Menu
            label="Style"
            value={style}
            onChange={setStyle}
            options={[
              { id: "all", label: "Any style", count: tagged.length },
              ...STYLE_TAGS.map((s) => ({
                id: s,
                label: s,
                count: tagged.filter((x) => x.tags.includes(s)).length,
              })).filter((o) => o.count > 0),
            ]}
          />

          {dirty ? (
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] px-2.5 text-[13px] text-mute transition hover:text-ink"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          ) : null}
        </div>
      </div>

      {shown.length ? (
        <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map(({ t }) => (
            <MarketCard key={t.id} t={t} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-[15px] font-medium">Nothing matches that yet</p>
          <p className="mx-auto mt-1.5 max-w-[42ch] text-[13px] leading-[1.6] text-mute">
            Tell us what you were looking for and it goes to the top of the list of what to build next.
          </p>
          <button type="button" onClick={clear} className="btn-soft mt-4">Clear the filters</button>
        </div>
      )}

      <p className="mt-10 text-[12.5px] text-mute-2">
        {shown.length} of {templates.length} templates
      </p>
    </>
  );
}

function SortTab({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`text-[14px] font-medium transition ${on ? "text-ink" : "text-mute-2 hover:text-mute"}`}
    >
      {children}
    </button>
  );
}

/* ── One dropdown ─────────────────────────────────────────────── */

type Option = { id: string; label: string; count: number };

function Menu({
  label, value, options, onChange,
}: {
  label: string; value: string; options: Option[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();
  const picked = options.find((o) => o.id === value);
  const on = value !== "all";

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium transition ${
          on ? "bg-ink text-page" : "bg-soft text-ink hover:bg-line"
        }`}
      >
        {on ? picked?.label : label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-labelledby={id}
          className="absolute right-0 z-50 mt-1.5 min-w-[190px] overflow-hidden rounded-[12px] bg-page p-1 shadow-[0_0_0_1px_var(--line),0_18px_40px_-24px_rgba(0,0,0,0.5)]"
        >
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="menuitemradio"
              aria-checked={o.id === value}
              onClick={() => { onChange(o.id); setOpen(false); }}
              className="flex w-full items-center justify-between gap-3 rounded-[8px] px-2.5 py-2 text-left text-[13px] transition hover:bg-soft"
            >
              <span className="flex items-center gap-2">
                <Check className={`h-3.5 w-3.5 ${o.id === value ? "opacity-100" : "opacity-0"}`} />
                {o.label}
              </span>
              <span className="text-[11.5px] tabular-nums text-mute-2">{o.count}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
