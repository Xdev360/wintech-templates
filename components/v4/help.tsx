"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CreditCard, Globe, LayoutTemplate, Search, Sparkles, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { GUIDES, POPULAR, TOPICS } from "./guides";

const ICONS = { book: BookOpen, layout: LayoutTemplate, sparkles: Sparkles, card: CreditCard, globe: Globe, user: User };
const href = (to: string) => (to.startsWith("/") ? to : `/help/${to}`);

export function HelpSearch() {
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (n.length < 2) return [];
    const rows: [string, string, string][] = [];
    for (const t of TOPICS) for (const [l, h] of t.items) if (`${l} ${t.title}`.toLowerCase().includes(n)) rows.push([l, t.title, href(h)]);
    for (const g of GUIDES) if (`${g.title} ${g.intro}`.toLowerCase().includes(n) && !rows.some((r) => r[0] === g.title)) rows.push([g.title, g.category, href(g.slug)]);
    return rows.slice(0, 8);
  }, [q]);
  return (
    <div className="relative mx-auto mt-8 w-full max-w-[640px]">
      <label className="input flex !h-12 items-center gap-2">
        <Search className="h-4 w-4 text-[var(--v4-m62)]" strokeWidth={1.5} />
        <span className="sr-only">Search the help center</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search guides, for example "connect a domain"' className="w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--v4-m45)]" />
      </label>
      {q.trim().length >= 2 && (
        <div className="hair absolute inset-x-0 top-[52px] z-10 bg-white text-left shadow-[0_12px_30px_rgba(10,14,23,0.08)]" aria-live="polite">
          {hits.length ? hits.map(([l, c, h]) => (
            <Link key={l + h} href={h} className="flex items-center justify-between gap-3 border-b border-[var(--v4-line)] px-4 py-3 last:border-0 hover:bg-[var(--v4-soft)]">
              <span className="text-[15px] font-medium">{l}</span>
              <span className="text-[12px] text-[var(--v4-m62)]">{c}</span>
            </Link>
          )) : (
            <p className="px-4 py-4 text-[14px] text-[var(--v4-m75)]">No guide for that yet. Ask us on WhatsApp and we will answer.</p>
          )}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[13px]">
        <span className="text-[var(--v4-m62)]">Popular:</span>
        {POPULAR.map(([l, h]) => (
          <Link key={l} href={href(h)} className="hair flex h-8 items-center rounded-[2px] px-3 hover:border-[var(--v4-line-2)]">{l}</Link>
        ))}
      </div>
    </div>
  );
}

export function Topics() {
  return (
    <div className="hair grid sm:grid-cols-2 lg:grid-cols-3">
      {TOPICS.map((t, i) => {
        const I = ICONS[t.icon as keyof typeof ICONS];
        return (
          <div key={t.title} className={`flex flex-col gap-3 border-[var(--v4-line)] p-8 max-md:p-6 ${i % 3 ? "lg:border-l" : ""} ${i >= 3 ? "lg:border-t" : ""} max-lg:border-t max-lg:first:border-t-0 ${i % 2 ? "sm:max-lg:border-l" : ""}`}>
            <span className="hair flex h-9 w-9 items-center justify-center"><I className="h-4 w-4" strokeWidth={1.5} /></span>
            <p className="mt-3 text-[18px] font-semibold">{t.title}</p>
            <ul className="flex flex-col gap-2">
              {t.items.map(([l, h]) => (
                <li key={l}><Link href={href(h)} className="text-[15px] text-[var(--v4-m75)] hover:text-[var(--v4-ink)]">{l}</Link></li>
              ))}
            </ul>
            <Link href={href(t.items[0][1].split("#")[0])} className="link mt-2 !text-[13px]">See all <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} /></Link>
          </div>
        );
      })}
    </div>
  );
}

export function Helpful() {
  const [v, setV] = useState<null | boolean>(null);
  return (
    <div className="flex items-center justify-between gap-4 border-y border-[var(--v4-line)] py-4">
      <p className="text-[14px] text-[var(--v4-m75)]">{v === null ? "Was this guide helpful?" : v ? "Thanks. Glad it helped." : "Thanks. Tell us what was missing on WhatsApp and we will fix it."}</p>
      {v === null && (
        <div className="flex gap-2">
          <button type="button" className="btn btn-outline btn-sm !h-8" onClick={() => setV(true)}><ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.5} /> Yes</button>
          <button type="button" className="btn btn-outline btn-sm !h-8" onClick={() => setV(false)}><ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.5} /> No</button>
        </div>
      )}
    </div>
  );
}
