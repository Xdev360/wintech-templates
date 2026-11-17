"use client";

import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { RailContext } from "./rail";

/* ──────────────────────────────────────────────────────────────
   The dashboard frame.

     ┌ brand ─ fold ───────────────────────────── gift · avatar ┐
     │ sidebar │ ┌──────────────────────────────────────────┐  │
     │         │ │                                          │  │
     │ upgrade │ │  the page, in one panel                  │  │
     │ card    │ │                                          │  │
     └─────────┴─┴──────────────────────────────────────────┴──┘

   The top bar holds what is about *you* (credits, referrals, account);
   the sidebar holds where you *go*. The sidebar folds to icons and
   remembers that. On a phone it becomes a drawer.
   ────────────────────────────────────────────────────────────── */

const KEY = "wt-rail";

// The folded state lives in localStorage and is read with an external
// store, so the first paint is already right and nothing flickers open.
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("wt-rail", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("wt-rail", callback);
  };
}
function readRail() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
function writeRail(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* private window: it simply will not be remembered */
  }
  window.dispatchEvent(new Event("wt-rail"));
}

export function Frame({
  brand,
  brandMark,
  sidebar,
  bar,
  mobileTitle,
  crumbs,
  children,
}: {
  /** The logo with its name, shown when the sidebar is open. */
  brand: ReactNode;
  /** The logo alone, shown when the sidebar is folded. */
  brandMark: ReactNode;
  sidebar: ReactNode;
  /** The right end of the top bar: referral gift and the account menu. */
  bar: ReactNode;
  mobileTitle: ReactNode;
  /** The left end of the top bar: where you are. */
  crumbs?: ReactNode;
  children: ReactNode;
}) {
  const rail = useSyncExternalStore(subscribe, readRail, () => false);
  const [open, setOpen] = useState(false);
  // Close the drawer when the page changes, adjusting state during render.
  const pathname = usePathname();
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setOpen(false);
  }

  return (
    <div className="v4 dash min-h-screen lg:flex lg:h-screen lg:overflow-hidden">
      {/* ── Top bar, phone ───────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--v4-line)] bg-white/90 px-3 backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">{mobileTitle}</div>
        <div className="flex items-center gap-1">
          {bar}
          <button type="button" onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-[10px] hover:bg-soft" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-black/30" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[280px] max-w-[86vw] flex-col overflow-y-auto bg-[#fafafa] pt-12 shadow-2xl">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-[10px] hover:bg-soft" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <RailContext.Provider value={false}>{sidebar}</RailContext.Provider>
          </div>
        </div>
      ) : null}

      {/* ── Sidebar, desktop: brand, then the site's navigation ── */}
      <aside className={`hidden shrink-0 flex-col border-r border-[var(--v4-line)] bg-[#fafafa] transition-[width] duration-200 lg:flex ${rail ? "w-[72px]" : "w-[240px]"}`}>
        <div className={`flex h-14 shrink-0 items-center ${rail ? "justify-center" : "justify-between pl-4 pr-2"}`}>
          {rail ? brandMark : brand}
          {!rail && (
            <button type="button" onClick={() => writeRail(true)} className="grid h-8 w-8 place-items-center rounded-[2px] text-[var(--v4-m62)] hover:bg-white hover:text-[var(--v4-ink)]" aria-label="Fold the sidebar" title="Fold the sidebar">
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
        {rail && (
          <button type="button" onClick={() => writeRail(false)} className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-[2px] text-[var(--v4-m62)] hover:bg-white" aria-label="Open the sidebar" title="Open the sidebar">
            <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <RailContext.Provider value={rail}>{sidebar}</RailContext.Provider>
        </div>
      </aside>

      {/* ── Main: top bar, then the page ─────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--v4-line)] bg-white px-6 lg:flex">
          <div className="flex min-w-0 items-center gap-2 text-[14px]">{crumbs}</div>
          <div className="flex items-center gap-2">{bar}</div>
        </header>
        <main className="min-w-0 bg-white lg:flex-1 lg:overflow-y-auto">
          <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
