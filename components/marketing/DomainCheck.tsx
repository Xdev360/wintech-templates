"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Globe, Search, X } from "lucide-react";
import { normalizeSlug, slugError } from "@/lib/slugs";
import { createClient } from "@/lib/supabase/client";

/* Search a name. The free wintechstudio.com address is checked for real
   against the database. Buying your own .com or .ng is shown as what it
   is: coming, not available yet. */

type State = { kind: "idle" } | { kind: "checking" } | { kind: "free" } | { kind: "taken" } | { kind: "bad"; why: string } | { kind: "unknown" };
type Answer = { name: string; kind: "free" | "taken" | "unknown" };

export function DomainCheck() {
  const [raw, setRaw] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const name = normalizeSlug(raw.replace(/\.(com|ng|com\.ng|co)$/i, "").replace(/\.wintechstudio$/i, ""));
  const bad = name ? slugError(name) : null;

  // Empty and invalid are known instantly; only the database answer waits.
  const state: State = !name ? { kind: "idle" }
    : bad ? { kind: "bad", why: bad }
    : answer?.name === name ? { kind: answer.kind }
    : { kind: "checking" };

  useEffect(() => {
    if (!name || bad) return;
    let live = true;
    const t = setTimeout(async () => {
      let kind: Answer["kind"] = "unknown";
      try {
        const { data, error } = await createClient().rpc("slug_available", { p_slug: name });
        kind = error ? "unknown" : data ? "free" : "taken";
      } catch {}
      if (live) setAnswer({ name, kind });
    }, 350);
    return () => { live = false; clearTimeout(t); };
  }, [name, bad]);

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="ring-spin rounded-[18px] p-2 shadow-[0_0_0_1px_var(--line),0_24px_60px_-30px_rgba(35,39,50,0.35)]">
        <label className="flex items-center gap-3 px-3">
          <Search className="h-5 w-5 shrink-0 text-accent-2" />
          <span className="sr-only">Search a name for your site</span>
          <input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="bestluxury"
            className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-mute-2"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="hidden text-[14px] text-mute sm:inline">.wintechstudio.com</span>
        </label>
      </div>

      <ul className="mt-4 flex flex-col gap-2 text-left" aria-live="polite">
        <Row
          icon={<Globe className="h-4 w-4" />}
          name={`${name || "yourname"}.wintechstudio.com`}
          right={
            state.kind === "free" ? <Tag good><Check className="h-3.5 w-3.5" /> Available · Free</Tag>
            : state.kind === "taken" ? <Tag><X className="h-3.5 w-3.5" /> Taken</Tag>
            : state.kind === "checking" ? <Tag>Checking…</Tag>
            : state.kind === "bad" ? <Tag>{state.why}</Tag>
            : state.kind === "unknown" ? <Tag>We check when you sign up</Tag>
            : <Tag>Free with every site</Tag>
          }
        />
        <Row icon={<Globe className="h-4 w-4" />} name={`${name || "yourname"}.com  ·  .ng  ·  .com.ng`} right={<Tag>Buying domains opens soon</Tag>} dim />
      </ul>
      {state.kind === "free" ? (
        <Link href={`/signup?name=${encodeURIComponent(name)}`} className="btn-primary mt-4">Claim {name}.wintechstudio.com</Link>
      ) : null}
    </div>
  );
}

function Row({ icon, name, right, dim }: { icon: React.ReactNode; name: string; right: React.ReactNode; dim?: boolean }) {
  return (
    <li className={`flex items-center gap-3 rounded-[14px] bg-card px-4 py-3 shadow-[0_0_0_1px_var(--line)] ${dim ? "opacity-70" : ""}`}>
      <span className="text-accent-2">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[14px]">{name}</span>
      {right}
    </li>
  );
}

function Tag({ children, good }: { children: React.ReactNode; good?: boolean }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium ${good ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" : "bg-soft text-mute"}`}>
      {children}
    </span>
  );
}
