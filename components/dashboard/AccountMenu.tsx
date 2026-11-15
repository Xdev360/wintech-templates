"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Banknote, Bug, LogOut, Settings } from "lucide-react";
import { signOut } from "@/app/actions/sites";
import type { ShellUser } from "@/lib/dashboard-types";
import { Initials } from "./ui";

/* ──────────────────────────────────────────────────────────────
   The avatar in the top right, and what opens from it: who you are,
   how many credits you have left and what that is out of, the way to
   get more, and the account links.

   The meter is measured against the free allowance, so a new account
   sees a full bar and watches it go down. Referral bonuses can push the
   balance past it; the bar simply stays full.
   ────────────────────────────────────────────────────────────── */

const FREE_ALLOWANCE = 20;

export function AccountMenu({
  user,
  credits,
  base = "/dashboard",
}: {
  user: ShellUser;
  credits: number | null;
  base?: string;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const left = credits ?? 0;
  const pct = Math.max(0, Math.min(100, Math.round((left / FREE_ALLOWANCE) * 100)));
  const low = credits !== null && left <= 5;

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Your account"
        className="grid h-8 w-8 place-items-center rounded-full ring-2 ring-transparent transition hover:ring-line"
      >
        <Initials name={user.name} className="h-8 w-8 text-[11px]" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] rounded-[14px] bg-page p-2 shadow-[0_0_0_1px_var(--line),0_24px_60px_-24px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2.5 px-2 pb-2.5 pt-1.5">
            <Initials name={user.name} className="h-9 w-9 text-[12px]" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{user.name}</p>
              <p className="truncate text-[12px] text-mute">{user.email}</p>
            </div>
          </div>

          <div className="rounded-[11px] bg-soft p-3">
            <div className="flex items-baseline justify-between">
              <p className="text-[12.5px] font-medium">Credits</p>
              <p className={`text-[12px] tabular-nums ${low ? "text-amber-600" : "text-mute"}`}>
                {credits === null ? "—" : `${left.toLocaleString()} left`}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" role="meter" aria-valuenow={left} aria-valuemin={0} aria-valuemax={FREE_ALLOWANCE} aria-label="Credits left">
              <div className={`h-full rounded-full ${low ? "bg-amber-500" : "bg-accent"}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-[11.5px] leading-[1.45] text-mute">
              {low ? "Running low. Top up to keep using Wintech AI." : "You are on the free plan. Upgrade for monthly credits and a custom domain."}
            </p>
            <Link href={`${base}/credits`} className="btn-primary mt-2.5 w-full">Upgrade</Link>
          </div>

          <nav className="mt-1.5 flex flex-col">
            <MenuLink href={`${base}/settings`} icon={Settings}>Settings</MenuLink>
            <MenuLink href={`${base}/affiliate`} icon={Banknote}>Affiliate earnings</MenuLink>
            <MenuLink href="https://www.wintechstudio.com/contact.html" icon={Bug}>Report a problem</MenuLink>
            <form action={signOut}>
              <button className="flex w-full items-center gap-2.5 rounded-[9px] px-2 py-2 text-left text-[13px] text-ink/80 hover:bg-soft hover:text-ink">
                <LogOut className="h-4 w-4 text-mute" /> Sign out
              </button>
            </form>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: typeof Settings; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-[9px] px-2 py-2 text-[13px] text-ink/80 hover:bg-soft hover:text-ink">
      <Icon className="h-4 w-4 text-mute" /> {children}
    </Link>
  );
}

/* The card at the foot of the sidebar that says what upgrading unlocks.
   Folded sidebars get a single button instead. */
export function UpgradeCard({ href, rail }: { href: string; rail: boolean }) {
  if (rail) {
    return (
      <Link
        href={href}
        title="Upgrade"
        aria-label="Upgrade"
        className="upgrade-ring mx-auto grid h-9 w-9 place-items-center rounded-[10px] bg-page text-accent"
      >
        <span className="text-[15px]" aria-hidden="true">✦</span>
      </Link>
    );
  }
  return (
    <div className="upgrade-ring rounded-[13px] bg-page p-3">
      <p className="text-[13px] font-medium leading-[1.3]">Unlock premium</p>
      <p className="mt-0.5 text-[11.5px] leading-[1.45] text-mute">Monthly credits, your own domain, and every plugin.</p>
      <Link href={href} className="btn-primary mt-2.5 w-full">Upgrade now</Link>
    </div>
  );
}
