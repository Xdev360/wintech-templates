"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Globe, Search } from "lucide-react";
import { normalizeSlug, slugError } from "@/lib/slugs";
import { createClient } from "@/lib/supabase/client";

const S = 1.5;

/* Domain search (Figma "Desktop / Domains"). The free name.wintechstudio.com
   address is checked for real. Paid domains show the sample prices from the
   domains design until the registrar is wired; buying sends people to sign up. */

type Free = "checking" | "free" | "taken" | "unknown" | "bad";

const PAID: [string, string, string?][] = [
  [".com", "$12 first year", "Best match"],
  [".ng", "₦9,000 a year", "Nigeria"],
  [".com.ng", "₦4,500 a year", "Nigeria"],
];

export function DomainSearch({ initial = "glowskin" }: { initial?: string }) {
  const [raw, setRaw] = useState(initial);
  const [freeState, setFreeState] = useState<{ name: string; s: Free } | null>(null);
  const name = normalizeSlug(raw.replace(/\.(com|ng|com\.ng|co)$/i, "").replace(/\.wintechstudio$/i, "")) || "";
  const bad = name ? slugError(name) : null;

  useEffect(() => {
    if (!name || bad) return;
    let live = true;
    const t = setTimeout(async () => {
      let s: Free = "unknown";
      try {
        const { data, error } = await createClient().rpc("slug_available", { p_slug: name });
        s = error ? "unknown" : data ? "free" : "taken";
      } catch {}
      if (live) setFreeState({ name, s });
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [name, bad]);

  const free: Free = !name ? "unknown" : bad ? "bad" : freeState?.name === name ? freeState.s : "checking";

  return (
    <div className="wrap pb-[96px]">
      <form className="mx-auto flex max-w-[760px] gap-2" onSubmit={(e) => e.preventDefault()}>
        <label className="input flex flex-1 items-center gap-2 !h-11">
          <Search className="h-4 w-4 text-[var(--v4-m62)]" strokeWidth={S} />
          <span className="sr-only">Search for a web address</span>
          <input value={raw} onChange={(e) => setRaw(e.target.value)} className="w-full bg-transparent text-[16px] outline-none" autoComplete="off" spellCheck={false} />
        </label>
        <button type="submit" className="btn btn-primary !h-11">Search</button>
      </form>
      <p className="mt-3 text-center text-[12px] text-[var(--v4-m62)]">Short, easy to say on the phone, no hyphens.</p>

      {name && (
        <div className="hair mx-auto mt-10 max-w-[760px]" aria-live="polite">
          {PAID.map(([tld, price, tag]) => (
            <Row key={tld} name={`${name}${tld}`} tag={tag && <span className={`tag tag-sm ${tag === "Best match" ? "tag-blue" : ""}`}>{tag}</span>} price={price} action={<Link href={`/signup?domain=${name}${tld}`} className="btn btn-secondary btn-sm !h-8 !px-3">Add</Link>} />
          ))}
          <Row name={`${name}lagos.com`} tag={<span className="tag tag-sm">Includes your city</span>} price="$12 first year" action={<Link href={`/signup?domain=${name}lagos.com`} className="btn btn-secondary btn-sm !h-8 !px-3">Add</Link>} />
          <Row
            name={`${name}.wintechstudio.com`}
            tag={<span className="tag tag-sm tag-blue">Free address</span>}
            price={free === "taken" ? "" : "Free"}
            action={
              <span className="text-[13px] text-[var(--v4-m62)]">
                {free === "checking" ? "Checking" : free === "taken" ? "Taken" : free === "bad" ? bad : free === "free" ? "Available" : "Included"}
              </span>
            }
            last
            dim={free === "taken"}
          />
        </div>
      )}
      <p className="mt-4 text-center text-[12px] text-[var(--v4-m62)]">
        The free address is checked live. Paid domain prices are samples; final prices show at checkout.
      </p>
    </div>
  );
}

function Row({ name, tag, price, action, last, dim }: { name: string; tag?: React.ReactNode; price: string; action: React.ReactNode; last?: boolean; dim?: boolean }) {
  return (
    <div className={`flex min-h-[58px] items-center gap-3 px-4 py-2 ${last ? "" : "border-b border-[var(--v4-line)]"} ${dim ? "opacity-50" : ""}`}>
      <Globe className="h-4 w-4 shrink-0" strokeWidth={S} />
      <span className="truncate text-[15px] font-medium">{name}</span>
      <span className="max-sm:hidden">{tag}</span>
      <span className="ml-auto whitespace-nowrap text-[13px] text-[var(--v4-m75)] max-sm:hidden">{price}</span>
      {action}
    </div>
  );
}
