"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { CATALOG, GROUPS, type Group } from "./catalog";
import { TCard } from "./TCard";
import { Btn } from "./ui";

/* The template library (Figma "Desktop / Templates"): filter by business,
   search, sort. Filtering runs in the browser, so it is instant. */

export function Library({ initialGroup }: { initialGroup?: string }) {
  const start = GROUPS.find((g) => g === initialGroup);
  const [group, setGroup] = useState<Group | "All">(start ?? "All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"Newest" | "A to Z">("Newest");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let l = CATALOG.filter((c) => (group === "All" || c.group === group) && (!needle || `${c.name} ${c.tag} ${c.text} ${c.bestFor}`.toLowerCase().includes(needle)));
    if (sort === "A to Z") l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [group, q, sort]);

  return (
    <section className="wrap pb-[96px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter templates">
          {(["All", ...GROUPS] as const).map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={group === g}
              onClick={() => setGroup(g)}
              className={`h-9 rounded-[2px] border px-3.5 text-[14px] ${group === g ? "border-[var(--v4-ink)] bg-[var(--v4-ink)] text-white" : "border-[var(--v4-line)] hover:border-[var(--v4-line-2)]"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <label className="input flex !h-9 !w-[240px] items-center gap-2 max-sm:!w-full">
          <Search className="h-4 w-4 text-[var(--v4-m62)]" strokeWidth={1.5} />
          <span className="sr-only">Search templates</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates" className="w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--v4-m45)]" />
        </label>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--v4-line)] pt-4 text-[13px] text-[var(--v4-m75)]">
        <span aria-live="polite">{list.length} {list.length === 1 ? "template" : "templates"}</span>
        <label className="relative flex items-center gap-1">
          <span>Sort:</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="cursor-pointer appearance-none bg-transparent pr-5 text-[var(--v4-ink)] outline-none">
            <option>Newest</option>
            <option>A to Z</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 h-3.5 w-3.5" strokeWidth={1.5} />
        </label>
      </div>
      {list.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => <TCard key={c.id} c={c} />)}
        </div>
      ) : (
        <div className="hair mt-6 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-[18px] font-semibold">No template matches “{q}”</p>
          <p className="text-[15px] text-[var(--v4-m75)]">Try another word, or start from the closest one and let the AI assistant change it.</p>
          <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={() => { setQ(""); setGroup("All"); }}>Show all templates</button>
        </div>
      )}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-6 bg-[var(--v4-soft)] p-6">
        <div>
          <p className="text-[18px] font-semibold">Are you a designer?</p>
          <p className="mt-1 text-[15px] text-[var(--v4-m75)]">Sell your templates to Nigerian businesses on Wintech. Every template is reviewed before it goes live.</p>
        </div>
        <Btn href="/sell" kind="outline" size="sm">Sell your templates</Btn>
      </div>
    </section>
  );
}
