import { Coins, Sparkles } from "lucide-react";
import { AI_MESSAGE_COST, CREDIT_PACKS, PAYMENTS_LIVE } from "@/lib/credits";
import { Dashed, Label, PageHeader, Pill, TickBar } from "./ui";

export type HistoryRow = { id: number; delta: number; reason: string; created_at: string };

const REASONS: Record<string, string> = {
  welcome: "Welcome credits",
  purchase: "Bought credits",
  ai_message: "Wintech AI message",
  ai_build: "Site built by Wintech AI",
  telegram_message: "Telegram message",
  refund: "Refund",
};

export function CreditsView({ credits, history }: { credits: number | null; history: HistoryRow[] | null }) {
  const spent = (history || []).filter((r) => r.delta < 0).reduce((n, r) => n - r.delta, 0);
  const added = (history || []).filter((r) => r.delta > 0).reduce((n, r) => n + r.delta, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Credits" sub="Credits pay for Wintech AI. One credit for each message." />

      {credits === null ? (
        <p className="rounded-[12px] bg-amber-500/10 px-4 py-3 text-[13px]">
          Credits are not set up in the database yet. Run <code>supabase/003_credits.sql</code> in the Supabase SQL Editor.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section>
          <Label>Balance</Label>
          <p className="mt-1 flex items-baseline gap-2 text-[44px] font-normal tracking-[-0.03em] tabular-nums">
            {credits === null ? "—" : credits.toLocaleString()}
            <span className="text-[15px] tracking-normal text-mute">credits</span>
          </p>
          <p className="mt-1 text-[13px] text-mute">
            {AI_MESSAGE_COST} credit per message. You are only charged when Wintech AI answers.
          </p>
          <div className="mt-5">
            <TickBar value={Math.max(0, added - spent)} total={Math.max(added, 1)} />
          </div>
          <div className="mt-3 flex gap-6 text-[12px] text-mute">
            <span><b className="font-medium text-ink tabular-nums">{added.toLocaleString()}</b> added</span>
            <span><b className="font-medium text-ink tabular-nums">{spent.toLocaleString()}</b> used</span>
          </div>
        </section>

        <section className="rounded-[13px] bg-soft p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="text-[13px] font-medium">What a credit buys</p>
          </div>
          <ul className="mt-3 flex flex-col gap-2 text-[13px] text-mute">
            <li>One request to Wintech AI: rewrite a section, change your colour, fix your contact details.</li>
            <li>The same on Telegram, once it is connected.</li>
            <li>Credits never expire and work across all your sites.</li>
          </ul>
        </section>
      </div>

      <Dashed />

      <section>
        <div className="flex items-center justify-between gap-3">
          <Label>Top up</Label>
          {!PAYMENTS_LIVE ? <Pill tone="warn">Payments open soon</Pill> : null}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {CREDIT_PACKS.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col rounded-[13px] p-4 ${p.featured ? "bg-page shadow-[0_0_0_1.5px_var(--accent),0_18px_40px_-28px_var(--accent)]" : "bg-page shadow-[0_0_0_1px_var(--line)]"}`}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-accent/10 text-accent"><Coins className="h-4 w-4" /></span>
                {p.featured ? <Pill tone="accent">{p.note}</Pill> : <span className="text-[12px] text-mute">{p.note}</span>}
              </div>
              <p className="mt-5 text-[24px] font-normal tracking-[-0.02em] tabular-nums">{p.credits.toLocaleString()}</p>
              <p className="text-[13px] text-mute">credits</p>
              <p className="mt-4 text-[15px] font-medium tabular-nums">{p.price}</p>
              <button type="button" disabled={!PAYMENTS_LIVE} className={`${p.featured ? "btn-primary" : "btn-soft"} mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50`}>
                {PAYMENTS_LIVE ? "Buy" : "Not open yet"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <Dashed />

      <section>
        <Label>History</Label>
        {history && history.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-[13px]">
              <thead>
                <tr className="text-left text-[12px] text-mute-2">
                  <th className="py-2 font-normal">Date</th>
                  <th className="py-2 font-normal">What</th>
                  <th className="py-2 text-right font-normal">Credits</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-t border-dashed border-line">
                    <td className="py-3 text-mute tabular-nums">
                      {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </td>
                    <td className="py-3">{REASONS[r.reason] ?? r.reason}</td>
                    <td className={`py-3 text-right font-medium tabular-nums ${r.delta > 0 ? "text-emerald-600" : ""}`}>
                      {r.delta > 0 ? `+${r.delta}` : r.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-mute">Nothing yet. Every credit added or used will show here.</p>
        )}
      </section>
    </div>
  );
}
