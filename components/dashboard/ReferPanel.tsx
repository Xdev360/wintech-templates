"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Gift, Share2, UserPlus, X } from "lucide-react";
import { ROOT_DOMAIN } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

/* ──────────────────────────────────────────────────────────────
   Refer a friend.

   The gift in the top corner opens this. Your link is made the first
   time you open it, never before, so nobody has a code they never
   asked for. Both sides get credits: them for joining, you when they
   do. Everything is granted by the database, not by this page.
   ────────────────────────────────────────────────────────────── */

type Stats = { joined: number; earned: number; reward: number };

export function ReferButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Refer a friend"
        className="grid h-8 w-8 place-items-center rounded-[9px] text-mute transition-colors hover:bg-soft hover:text-ink"
      >
        <Gift className="h-4 w-4" />
      </button>
      {open ? <ReferDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function ReferDialog({ onClose }: { onClose: () => void }) {
  const [link, setLink] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const supabase = createClient();
        const [code, s] = await Promise.all([
          supabase.rpc("my_referral_code"),
          supabase.rpc("referral_stats"),
        ]);
        if (!live) return;
        if (code.error) throw new Error(code.error.message);
        const base = typeof window === "undefined" ? `https://app.${ROOT_DOMAIN}` : window.location.origin;
        setLink(`${base}/signup?ref=${code.data}`);
        if (!s.error) setStats(s.data as Stats);
      } catch (err) {
        if (live) setError(err instanceof Error ? err.message : "Could not make your link.");
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const reward = stats?.reward ?? 25;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Refer a friend">
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-[520px] rounded-[16px] bg-page p-6 shadow-[0_0_0_1px_var(--line),0_40px_90px_-40px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-[9px] text-mute hover:bg-soft hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-[20px] font-semibold tracking-[-0.025em]">Refer a friend, earn credits.</h2>
        <p className="mt-1 text-[12px] text-mute">
          They get {reward} credits when they join. You get {reward} when they do.
        </p>

        <div className="mt-5 rounded-[12px] bg-soft p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.075em] text-label">Your link</p>
          <div className="mt-2 flex gap-2">
            <input
              readOnly
              value={error ? "" : link || "Making your link…"}
              onFocus={(e) => e.currentTarget.select()}
              className="h-9 min-w-0 flex-1 rounded-[10px] bg-page px-3 text-[12px] shadow-[inset_0_0_0_1px_var(--line-2)] outline-none"
              aria-label="Your referral link"
            />
            <button
              type="button"
              disabled={!link}
              onClick={() => {
                navigator.clipboard?.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
              className="btn-primary shrink-0 disabled:opacity-60"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          {error ? <p className="mt-2 text-[12px] text-mute">Run 006_referrals.sql to switch this on.</p> : null}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Step icon={Share2} label="Share your link" note="WhatsApp, Instagram, anywhere" />
          <Step icon={UserPlus} label={`They get ${reward}`} note="Credits, the moment they join" />
          <Step icon={Gift} label={`You get ${reward}`} note="Straight into your balance" />
        </div>

        {stats ? (
          <p className="mt-4 text-[12px] text-mute">
            {stats.joined === 0
              ? "Nobody has joined from your link yet."
              : `${stats.joined} ${stats.joined === 1 ? "person has" : "people have"} joined · ${stats.earned} credits earned.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Step({ icon: Icon, label, note }: { icon: typeof Gift; label: string; note: string }) {
  return (
    <div className="rounded-[12px] p-3 shadow-[0_0_0_1px_var(--line)]">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-3/40 text-accent">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <p className="mt-2 text-[12px] font-medium">{label}</p>
      <p className="text-[11px] leading-[1.4] text-mute">{note}</p>
    </div>
  );
}
