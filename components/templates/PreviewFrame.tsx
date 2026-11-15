"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

/* Full-screen preview. A slim glass bar on top, the sample site below,
   and a switch to see it at phone width. Nothing here is editable:
   editing starts after sign-up. */
export function PreviewFrame({
  name,
  kind,
  useHref,
  children,
}: {
  name: string;
  kind: string;
  useHref: string;
  children: ReactNode;
}) {
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");

  return (
    <div className="min-h-screen bg-soft">
      <header className="glass-pill sticky top-0 z-30 !rounded-none border-x-0 border-t-0">
        <div className="mx-auto grid h-14 max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-3 px-3 md:px-5">
          <Link href="/templates" className="btn-soft !h-9 !px-3" aria-label="Back to all templates">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            <span className="hidden sm:inline">Templates</span>
          </Link>

          <p className="truncate text-center text-[14px]">
            <span className="font-medium">{name}</span>
            <span className="text-mute"> · {kind}</span>
          </p>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-[11px] bg-page p-0.5 shadow-[0_0_0_1px_var(--line)] md:flex" role="group" aria-label="Preview size">
              {(["desktop", "phone"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={device === d}
                  onClick={() => setDevice(d)}
                  className={`h-8 rounded-[9px] px-3 text-[12px] font-medium capitalize ${device === d ? "bg-ink text-page" : "text-mute"}`}
                >
                  {d}
                </button>
              ))}
            </div>
            <Link href={useHref} className="btn-primary !h-9">Use this template</Link>
          </div>
        </div>
      </header>

      {device === "desktop" ? (
        <div className="min-h-[calc(100vh-56px)]">{children}</div>
      ) : (
        <div className="flex justify-center px-4 py-8">
          <div className="h-[760px] w-[390px] overflow-y-auto rounded-[36px] bg-page shadow-[0_0_0_8px_#111,0_40px_80px_-30px_rgba(0,0,0,0.5)]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
