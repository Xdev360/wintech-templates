"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, Coins, Sparkles } from "lucide-react";
import { applySitePatch } from "@/app/actions/sites";
import type { Change } from "@/lib/site-diff";

/* ──────────────────────────────────────────────────────────────
   The chat panel. Wintech AI answers and may propose edits; each
   proposal shows as a before-and-after card with an Apply button.
   Nothing reaches the live site until the owner presses it.
   ────────────────────────────────────────────────────────────── */

type Msg = { role: "user" | "assistant"; content: string; changes?: Change[]; patch?: unknown; applied?: boolean; error?: boolean };

const STARTERS = [
  "Rewrite my headline so it sells harder",
  "Add a question about delivery to my FAQ",
  "Move reviews above the about section",
  "Change my colour to a deep green",
];

const ERRORS: Record<string, string> = {
  no_credits: "You are out of credits. Top up to keep chatting.",
  not_configured: "Wintech AI is not switched on for this app yet. The ANTHROPIC_API_KEY needs to be added to the server.",
  credits_not_set_up: "Credits are not set up yet. Run 003_credits.sql in Supabase.",
  busy: "Wintech AI is busy right now. Try again in a moment. You were not charged.",
  unreachable: "Could not reach Wintech AI. Try again. You were not charged.",
  ai_error: "Something went wrong on my side. Try again. You were not charged.",
  signed_out: "Your session ended. Log in again.",
};

export function AssistantChat({
  siteId,
  siteName,
  credits,
  base,
  initialPrompt = "",
}: {
  siteId: string;
  siteName: string;
  credits: number | null;
  base: string;
  initialPrompt?: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState(initialPrompt);
  const [busy, setBusy] = useState(false);
  const [balance, setBalance] = useState(credits);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const said = text.trim();
    if (!said || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: said }];
    setMessages(next);
    setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          messages: next.filter((m) => !m.error).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (typeof data.balance === "number") setBalance(data.balance);
        setMessages((m) => [...m, { role: "assistant", content: ERRORS[data.error] || ERRORS.ai_error, error: true }]);
        return;
      }
      if (typeof data.balance === "number") setBalance(data.balance);
      setMessages((m) => [...m, { role: "assistant", content: data.reply, changes: data.changes, patch: data.patch }]);
      // Re-read server data so the sidebar's credit count matches. Chat state survives.
      router.refresh();
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: ERRORS.unreachable, error: true }]);
    } finally {
      setBusy(false);
    }
  }

  async function apply(index: number) {
    const msg = messages[index];
    if (!msg.patch) return;
    const result = await applySitePatch(siteId, msg.patch);
    if (result.error) {
      setMessages((m) => [...m, { role: "assistant", content: `That did not save: ${result.error}`, error: true }]);
      return;
    }
    setMessages((m) => m.map((x, i) => (i === index ? { ...x, applied: true } : x)));
    router.refresh();
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[520px] flex-col overflow-hidden rounded-[18px] shadow-[0_0_0_1px_var(--line)]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-accent text-accent-ink">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-medium">Wintech AI</p>
            <p className="text-[12px] text-mute">Knows {siteName}</p>
          </div>
        </div>
        <Link href={`${base}/credits`} className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-[12px] font-medium tabular-nums">
          <Coins className="h-3.5 w-3.5 text-accent" />
          {balance === null ? "—" : balance.toLocaleString()} credits
        </Link>
      </div>

      <div ref={log} className="flex-1 overflow-y-auto px-5 py-6" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-[460px] pt-4 text-center">
            <span className="mx-auto grid h-9 w-9 place-items-center rounded-[10px] bg-accent/10 text-accent">
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="mt-4 text-[15px] font-medium tracking-[-0.015em]">What should change on your site?</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-mute">
              I can rewrite anything on your page, add or remove products and questions, reorder sections, and change your colour. You see every change before it goes live.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className="btn-soft !h-9 !text-[12px] !font-normal">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[78%] rounded-[13px] rounded-br-[6px] bg-ink px-4 py-2.5 text-[13px] leading-relaxed text-page">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[88%]">
                  <div className={`rounded-[13px] rounded-bl-[6px] px-4 py-2.5 text-[13px] leading-relaxed ${m.error ? "bg-amber-500/10 text-ink" : "bg-soft"}`}>
                    {m.content}
                    {m.error && m.content === ERRORS.no_credits ? (
                      <Link href={`${base}/credits`} className="ml-1 font-medium text-accent underline">Get credits</Link>
                    ) : null}
                  </div>
                  {m.changes?.length ? (
                    <div className="mt-2 rounded-[12px] bg-page p-3 shadow-[0_0_0_1px_var(--line-2)]">
                      <ul className="flex flex-col gap-2.5">
                        {m.changes.map((c) => (
                          <li key={c.label} className="text-[13px]">
                            <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mute-2">{c.label}</p>
                            {c.swatch ? (
                              <p className="mt-1 flex items-center gap-2">
                                <span className="h-4 w-4 rounded-full" style={{ background: c.before }} />→
                                <span className="h-4 w-4 rounded-full" style={{ background: c.after }} />
                                <code className="text-[12px]">{c.after}</code>
                              </p>
                            ) : (
                              <>
                                {c.before ? <p className="mt-0.5 text-mute line-through decoration-line-2">{c.before}</p> : null}
                                <p className="mt-0.5">{c.after || <em className="text-mute">(removed)</em>}</p>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center gap-2">
                        {m.applied ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
                            <Check className="h-4 w-4" /> Applied. Your site is updated.
                          </span>
                        ) : (
                          <button type="button" onClick={() => apply(i)} className="btn-primary !h-9">Apply to my site</button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ),
            )}
            {busy ? (
              <div className="flex w-16 gap-1 rounded-[13px] rounded-bl-[6px] bg-soft px-4 py-3.5" aria-label="Wintech AI is thinking">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-pulse rounded-full bg-mute" style={{ animationDelay: `${d * 160}ms` }} />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <form
        className="border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <div className="flex items-end gap-2 rounded-[12px] bg-soft p-1.5">
          <label htmlFor="assistant-input" className="sr-only">Message Wintech AI</label>
          <textarea
            id="assistant-input"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            placeholder="Ask for a change, or ask a question"
            className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-[15px] outline-none placeholder:text-mute-2 sm:text-[13px]"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            aria-label="Send"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-accent text-accent-ink transition disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
        <p className="mt-2 px-1 text-[12px] text-mute-2">One credit per message. You are only charged when Wintech AI answers.</p>
      </form>
    </div>
  );
}
