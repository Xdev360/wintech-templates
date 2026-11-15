"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { matchTemplates } from "@/lib/match";
import { KINDS, type Kind, type TemplateDef } from "@/lib/templates";

/* ──────────────────────────────────────────────────────────────
   The hero box. Say what you do, and the row below reorders to the
   templates that fit. No AI and no account: everything here is
   public, so anyone can look before deciding to sign up.

   The cards are rendered on the server and handed in by id, so the
   template renderer never ships to the browser twice.
   ────────────────────────────────────────────────────────────── */

type Lite = Pick<TemplateDef, "id" | "name" | "kind" | "keywords">;

const EXAMPLES = [
  "I sell skincare in Lagos and want people to order online",
  "A booking site for my hair salon",
  "A portfolio for my design work",
  "A page for our tech event in November",
  "My bakery needs a menu people can order from",
  "Clients should be able to book coaching sessions",
];

export function TemplateFinder({ list, cards }: { list: Lite[]; cards: Record<string, ReactNode> }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind | null>(null);
  const [example, setExample] = useState(0);
  const [focused, setFocused] = useState(false);
  const row = useRef<HTMLDivElement>(null);

  /* Rotate the example prompt while the box is empty and idle. */
  useEffect(() => {
    if (query || focused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setExample((i) => (i + 1) % EXAMPLES.length), 3200);
    return () => clearInterval(t);
  }, [query, focused]);

  const { ids, status } = useMemo(() => {
    const pool = kind ? list.filter((t) => t.kind === kind) : list;
    const kindName = kind ? KINDS.find((k) => k.id === kind)!.plural.toLowerCase() : "templates";
    if (query.trim().length < 2) {
      return { ids: pool.map((t) => t.id), status: kind ? `All ${kindName}` : "Popular templates" };
    }
    const hits = matchTemplates(query, pool);
    if (hits.length === 0) {
      return {
        ids: pool.map((t) => t.id),
        status: "Nothing in the library fits that yet. Here is everything, or tell us on the call what you need.",
      };
    }
    return {
      ids: hits.map((h) => h.id),
      status: hits.length === 1 ? "Best match" : `${hits.length} templates fit`,
    };
  }, [query, kind, list]);

  useEffect(() => {
    row.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [ids]);

  const nudge = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(220, el.clientWidth * 0.75), behavior: "smooth" });
  };

  return (
    <div className="glass mx-auto w-full max-w-[864px] p-[10px] text-left">
      <form
        className="rounded-[13px] bg-card p-4 shadow-[0_6px_10px_-6px_rgba(0,0,0,0.09)]"
        onSubmit={(e) => {
          e.preventDefault();
          row.current?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
        }}
      >
        <label htmlFor="need" className="sr-only">What do you need a website for?</label>
        <textarea
          id="need"
          rows={2}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={EXAMPLES[example]}
          className="block w-full resize-none bg-transparent px-1 text-[17px] leading-[1.5] text-ink outline-none placeholder:text-mute md:text-[18px]"
        />
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by kind">
            <Chip on={kind === null} onClick={() => setKind(null)}>All</Chip>
            {KINDS.map((k) => (
              <Chip key={k.id} on={kind === k.id} onClick={() => setKind(kind === k.id ? null : k.id)}>
                {k.label}
              </Chip>
            ))}
          </div>
          <button
            type="submit"
            aria-label="Show matching templates"
            disabled={!query.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white shadow-[0_6px_12px_-5px_rgba(59,91,255,0.5)] transition disabled:opacity-40 disabled:shadow-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </form>

      <div className="mx-[6px] mt-[10px] h-px bg-black/[0.07] dark:bg-white/10" />

      <p className="px-2 pt-3 text-[13px] text-mute" aria-live="polite">{status}</p>

      <div ref={row} className="snap-row flex gap-3 overflow-x-auto px-2 py-3" role="list">
        {ids.map((id) => (
          <div key={id} role="listitem">{cards[id]}</div>
        ))}
      </div>

      <div className="flex items-center justify-between px-2 pb-1 pt-1">
        <Link href="/templates" className="btn-soft">View all templates</Link>
        <div className="flex gap-2">
          <Arrow dir={-1} onClick={() => nudge(-1)} />
          <Arrow dir={1} onClick={() => nudge(1)} />
        </div>
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`h-9 shrink-0 rounded-[11px] px-3 text-[13px] font-medium transition ${
        on ? "bg-ink text-page" : "bg-soft text-mute hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Arrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 1 ? "Next templates" : "Previous templates"}
      className="btn-soft !h-10 !w-10 !rounded-full !p-0"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === 1 ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
      </svg>
    </button>
  );
}
