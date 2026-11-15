import type { ReactNode } from "react";

/* A title whose words rise in one after another as it scrolls into view.
   The animation is pure CSS (.wr-word in globals.css). */
export function RevealTitle({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h2 className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="wr-word" style={{ ["--i" as string]: i }}>{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h2>
  );
}

/* A section's heading. Left by default, with room on the right for the
   one action that belongs to the section — the way Webild does it. Pass
   `center` for the few sections that really are centred. */
export function SectionHead({
  label,
  title,
  action,
  center = false,
  children,
}: {
  label: string;
  title: string;
  action?: ReactNode;
  center?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={center ? "flex flex-col items-center text-center" : "flex flex-wrap items-end justify-between gap-4"}>
      <div className={center ? "flex flex-col items-center" : "min-w-0"}>
        <p className="text-[13px] font-medium text-label">{label}</p>
        <RevealTitle text={title} className="mt-1 max-w-[22ch] text-[24px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[30px]" />
        {children ? <div className="mt-3 max-w-[52ch] text-[13.5px] leading-relaxed text-mute">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
