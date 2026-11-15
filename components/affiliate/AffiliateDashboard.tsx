"use client";

import { useEffect, useState } from "react";
import { Banknote, Check, Copy, Users, Wallet } from "lucide-react";
import { ROOT_DOMAIN } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

/* ──────────────────────────────────────────────────────────────
   The affiliate's own dashboard: their link, who joined from it, what
   they have earned, and asking to be paid.

   Every number here is read from the database. Commissions are written
   when a payment clears, so until payments are live these are honest
   zeros rather than a demo.
   ────────────────────────────────────────────────────────────── */

type Overview = {
  joined: boolean;
  code?: string;
  rate: number;
  minimum_kobo?: number;
  signups?: number;
  pending_kobo?: number;
  approved_kobo?: number;
  paid_kobo?: number;
  requested_kobo?: number;
  available_kobo?: number;
  payout_name?: string;
  payout_bank?: string;
  payout_account?: string;
};

const naira = (kobo = 0) => `₦${Math.round(kobo / 100).toLocaleString()}`;

export function AffiliateDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");

  async function load() {
    const { data: d, error: err } = await createClient().rpc("affiliate_overview");
    if (err) throw new Error(err.message);
    setData(d as Overview);
  }

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const { data: d, error: err } = await createClient().rpc("affiliate_overview");
        if (!live) return;
        if (err) throw new Error(err.message);
        setData(d as Overview);
      } catch (err) {
        if (live) setError(err instanceof Error ? err.message : "Could not load your account.");
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  async function join(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const { error: err } = await createClient().rpc("become_affiliate", {
        p_name: String(form.get("name") || ""),
        p_bank: String(form.get("bank") || ""),
        p_account: String(form.get("account") || ""),
      });
      if (err) throw new Error(err.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  }

  async function payout() {
    setBusy(true);
    setError("");
    setNote("");
    try {
      const { error: err } = await createClient().rpc("request_payout");
      if (err) throw new Error(err.message);
      setNote("Asked for. We send payouts once a month.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) {
    return <Shell><p className="text-[13px] text-mute">{error} Run 007_affiliates.sql to switch this on.</p></Shell>;
  }
  if (!data) return <Shell><p className="text-[13px] text-mute">Loading…</p></Shell>;

  if (!data.joined) {
    return (
      <Shell>
        <h1 className="text-[18px] font-semibold tracking-[-0.025em]">Become an affiliate</h1>
        <p className="mt-1 text-[12.5px] text-mute">
          {Math.round(data.rate * 100)}% of every payment, for twelve months. We need your bank
          details now so there is nowhere for the money to get stuck later.
        </p>
        <form onSubmit={join} className="mt-5 flex flex-col gap-3">
          <Field label="Name on your account"><input name="name" required maxLength={80} className={input} placeholder="As it appears at your bank" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Bank"><input name="bank" required maxLength={60} className={input} placeholder="GTBank" /></Field>
            <Field label="Account number"><input name="account" required inputMode="numeric" pattern="[0-9]{10}" className={input} placeholder="0123456789" /></Field>
          </div>
          {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
          <button type="submit" disabled={busy} className="btn-primary mt-1 self-start disabled:opacity-60">
            {busy ? "Joining…" : "Join and get my link"}
          </button>
        </form>
      </Shell>
    );
  }

  const link = `https://app.${ROOT_DOMAIN}/signup?ref=${data.code}`;
  const ready = (data.available_kobo || 0) >= (data.minimum_kobo || 0) && (data.available_kobo || 0) > 0;

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold tracking-[-0.025em]">Affiliate</h1>
          <p className="mt-0.5 text-[12.5px] text-mute">{Math.round(data.rate * 100)}% for twelve months, on every payment.</p>
        </div>
      </div>

      <div className="mt-5 rounded-[12px] bg-soft p-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.075em] text-label">Your link</p>
        <div className="mt-2 flex gap-2">
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className={`${input} font-mono !text-[12px]`} aria-label="Your affiliate link" />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="btn-primary shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Figure icon={Users} label="Joined" value={String(data.signups ?? 0)} note="from your link" />
        <Figure icon={Wallet} label="Waiting" value={naira(data.pending_kobo)} note="until payment clears" />
        <Figure icon={Banknote} label="Ready" value={naira(data.available_kobo)} note={`minimum ${naira(data.minimum_kobo)}`} />
        <Figure icon={Check} label="Paid out" value={naira(data.paid_kobo)} note="all time" />
      </div>

      <div className="mt-4 rounded-[13px] p-4 shadow-[0_0_0_1px_var(--line)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium">Get paid</p>
            <p className="mt-0.5 text-[12px] text-mute">
              To {data.payout_name} · {data.payout_bank} · {data.payout_account}
            </p>
          </div>
          <button type="button" onClick={payout} disabled={busy || !ready} className="btn-primary disabled:opacity-50">
            {busy ? "Working…" : "Ask to be paid"}
          </button>
        </div>
        {(data.requested_kobo || 0) > 0 ? (
          <p className="mt-2 text-[12px] text-mute">{naira(data.requested_kobo)} already asked for, going out with the next run.</p>
        ) : null}
        {!ready ? (
          <p className="mt-2 text-[12px] text-mute-2">
            You can ask once you are above {naira(data.minimum_kobo)}.
          </p>
        ) : null}
        {note ? <p className="mt-2 text-[12px] text-emerald-600">{note}</p> : null}
        {error ? <p className="mt-2 text-[12px] text-red-600">{error}</p> : null}
      </div>

      <p className="mt-4 text-[11.5px] leading-[1.5] text-mute-2">
        Commissions are written when a customer&rsquo;s payment clears. Card payments are being connected
        now, so these stay at zero until that is live.
      </p>
    </Shell>
  );
}

const input =
  "h-9 w-full min-w-0 rounded-[10px] bg-page px-3 text-[13px] shadow-[inset_0_0_0_1px_var(--line-2)] outline-none transition focus:shadow-[inset_0_0_0_1.5px_var(--accent)]";

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[860px]">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[12px] font-medium text-mute">{label}</span>
      {children}
    </label>
  );
}

function Figure({ icon: Icon, label, value, note }: { icon: typeof Users; label: string; value: string; note: string }) {
  return (
    <div className="rounded-[13px] p-3.5 shadow-[0_0_0_1px_var(--line)]">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.075em] text-label">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-1 truncate text-[17px] font-normal tracking-[-0.02em] tabular-nums">{value}</p>
      <p className="truncate text-[11.5px] text-mute">{note}</p>
    </div>
  );
}
