import type { ReactNode } from "react";

/* Small building blocks for dashboard pages, so every page shares one
   rhythm: quiet labels, large regular-weight numbers, dashed dividers. */

export function PageHeader({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[18px] font-semibold tracking-[-0.025em] text-ink">{title}</h1>
        {sub ? <p className="mt-1 text-[13px] text-mute">{sub}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Dashed({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-dashed border-line-2 ${className}`} />;
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-medium uppercase tracking-[0.075em] text-label ${className}`}>{children}</p>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[13px] bg-page p-4 shadow-[0_0_0_1px_var(--line)] ${className}`}>{children}</section>;
}

export function Pill({ tone = "mute", children }: { tone?: "mute" | "good" | "accent" | "warn"; children: ReactNode }) {
  const tones = {
    mute: "bg-soft text-mute",
    good: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    accent: "bg-accent/10 text-accent",
    warn: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
  };
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** The reference's bar of thin ticks, filled to a share. */
export function TickBar({ value, total, ticks = 36 }: { value: number; total: number; ticks?: number }) {
  const filled = total > 0 ? Math.round((value / total) * ticks) : 0;
  return (
    <div className="flex h-10 items-stretch gap-[3px]" role="img" aria-label={`${value} of ${total}`}>
      {Array.from({ length: ticks }, (_, i) => (
        <span key={i} className={`flex-1 rounded-[2px] ${i < filled ? "bg-accent" : "bg-soft"}`} />
      ))}
    </div>
  );
}

export function Initials({ name, className = "" }: { name: string; className?: string }) {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "W";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-accent/12 font-medium text-accent ${className}`} aria-hidden="true">
      {letters}
    </span>
  );
}
