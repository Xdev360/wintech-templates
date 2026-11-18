"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BarChart3, Bell, BookOpen, CalendarCheck, Check, ChevronsUpDown, CreditCard, ExternalLink, FolderKanban, Globe,
  HelpCircle, Home, MessageSquare, Package, PanelsTopLeft, Plus, Settings, ShoppingBag, Sparkles, TrendingUp, Users, Wallet,
} from "lucide-react";
import { usePathname } from "next/navigation";
import type { ShellSite, ShellUser } from "@/lib/dashboard-types";
import type { Kind } from "@/lib/templates";
import { Frame } from "./Frame";
import { AccountMenu } from "./AccountMenu";
import { Brand, BrandMarkLink } from "./Brand";
import { NavItem, SiteMark } from "./nav";
import { useRail } from "./rail";
import { ReferButton } from "./ReferPanel";
import type { Icon } from "./nav-types";

/* ──────────────────────────────────────────────────────────────
   One site's dashboard. Reached from the account home, which lists
   every site; "All sites" at the top goes back there.

   Plugins are one item here, not a list: they live on their own page,
   the way an app store does.
   ────────────────────────────────────────────────────────────── */

type Item = { label: string; path: string; icon: Icon; soon?: boolean };

/* Sidebar by site type (Figma page 24: ST1, BK1, PF1, RS1, EV1, DG1). */
const NAV: Record<Kind, Item[]> = {
  store: [
    { label: "Home", path: "", icon: Home },
    { label: "Website", path: "/site", icon: PanelsTopLeft },
    { label: "Products", path: "/site?part=items", icon: Package },
    { label: "Orders", path: "/orders", icon: ShoppingBag },
    { label: "Money", path: "/money", icon: Wallet },
    { label: "Customers", path: "/customers", icon: Users },
    { label: "Inbox", path: "/inbox", icon: MessageSquare },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Domains", path: "/domains", icon: Globe },
    { label: "Grow", path: "/plugins", icon: TrendingUp },
  ],
  booking: [
    { label: "Home", path: "", icon: Home },
    { label: "Website", path: "/site", icon: PanelsTopLeft },
    { label: "Calendar", path: "/calendar", icon: CalendarCheck },
    { label: "Services", path: "/site?part=items", icon: BookOpen },
    { label: "Money", path: "/money", icon: Wallet },
    { label: "Customers", path: "/customers", icon: Users },
    { label: "Inbox", path: "/inbox", icon: MessageSquare },
    { label: "Domains", path: "/domains", icon: Globe },
    { label: "Grow", path: "/plugins", icon: TrendingUp },
  ],
  portfolio: [
    { label: "Home", path: "", icon: Home },
    { label: "Website", path: "/site", icon: PanelsTopLeft },
    { label: "Projects", path: "/site?part=items", icon: FolderKanban },
    { label: "Enquiries", path: "/inbox", icon: MessageSquare },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Domains", path: "/domains", icon: Globe },
    { label: "Grow", path: "/plugins", icon: TrendingUp },
  ],
  landing: [
    { label: "Home", path: "", icon: Home },
    { label: "Website", path: "/site", icon: PanelsTopLeft },
    { label: "Inbox", path: "/inbox", icon: MessageSquare },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Domains", path: "/domains", icon: Globe },
    { label: "Grow", path: "/plugins", icon: TrendingUp },
  ],
};

const PAGE_NAMES: Record<string, string> = {
  "": "Home", site: "Website", orders: "Orders", money: "Money", customers: "Customers", inbox: "Inbox", analytics: "Analytics",
  domains: "Domains", plugins: "Grow", settings: "Settings", ai: "Wintech AI", calendar: "Calendar", plan: "Plan", help: "Help",
};

export function Shell({
  base,
  site,
  sites,
  user,
  credits,
  children,
}: {
  base: string;
  site: ShellSite;
  sites: ShellSite[];
  user: ShellUser;
  credits: number | null;
  children: ReactNode;
}) {
  const home = base.startsWith("/dev/") ? "/dev/account" : base.startsWith("/demo") ? "/demo/account" : "/dashboard";
  const sidebar = <SiteSidebar base={base} home={home} site={site} sites={sites} credits={credits} />;
  const url = `https://${site.slug}.wintechstudio.com`;

  return (
    <Frame
      brand={<Brand href={home} />}
      brandMark={<BrandMarkLink href={home} />}
      sidebar={sidebar}
      crumbs={<Crumbs base={base} site={site} />}
      bar={
        <>
          <Link href={`${base}/ai`} className="btn btn-outline btn-sm !h-9 !px-3 max-lg:hidden"><Sparkles className="h-4 w-4 text-[var(--v4-blue)]" strokeWidth={1.5} /> Ask AI</Link>
          <a href={url} target="_blank" rel="noreferrer" title="View site" aria-label="View site" className="hair grid h-9 w-9 place-items-center rounded-[2px] hover:border-[var(--v4-line-2)] max-lg:hidden"><ExternalLink className="h-4 w-4" strokeWidth={1.5} /></a>
          <Link href={`${base}/inbox`} title="Inbox" aria-label="Inbox" className="hair grid h-9 w-9 place-items-center rounded-[2px] hover:border-[var(--v4-line-2)] max-lg:hidden"><Bell className="h-4 w-4" strokeWidth={1.5} /></Link>
          <ReferButton />
          <AccountMenu user={user} credits={credits} base={home} />
        </>
      }
      mobileTitle={<><SiteMark site={site} className="h-8 w-8 text-[12px]" /><span className="truncate text-[14px] font-medium">{site.name}</span></>}
    >
      {children}
    </Frame>
  );
}

function Crumbs({ base, site }: { base: string; site: ShellSite }) {
  const pathname = usePathname();
  const rest = pathname.startsWith(base) ? pathname.slice(base.length).split("/").filter(Boolean)[0] ?? "" : "";
  return (
    <>
      <span className="truncate text-[rgba(10,14,23,0.62)]">{site.name}</span>
      <span className="text-[rgba(10,14,23,0.3)]">/</span>
      <span className="font-medium">{PAGE_NAMES[rest] ?? rest.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase())}</span>
      <span className={`ml-1 inline-flex items-center gap-1.5 rounded-[2px] px-2 py-0.5 text-[12px] ${site.published ? "bg-[#dcfce7] text-[#15803d]" : "bg-[rgba(10,14,23,0.06)] text-[rgba(10,14,23,0.62)]"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${site.published ? "bg-[#16a34a]" : "bg-[rgba(10,14,23,0.4)]"}`} />{site.published ? "Live" : "Hidden"}
      </span>
    </>
  );
}

/* The sidebar reads the fold state itself, so it can swap the site card
   for just the site's mark and hide the upgrade card's words. */
function SiteSidebar({ base, home, site, sites, credits }: { base: string; home: string; site: ShellSite; sites: ShellSite[]; credits: number | null }) {
  const rail = useRail();
  const items = NAV[site.kind] ?? NAV.landing;
  return (
    <div className="flex min-h-full flex-1 flex-col px-3 pb-3">
      <div className={rail ? "flex justify-center pb-3" : "pb-3"}>
        <SiteSwitcher site={site} sites={sites} home={home} dev={home !== "/dashboard"} rail={rail} />
      </div>
      <nav className="flex flex-1 flex-col gap-px" aria-label="Site">
        {items.map((it) => <NavItem key={it.label} href={`${base}${it.path}`} label={it.label} icon={it.icon} soon={it.soon} exact={it.path === ""} />)}
      </nav>
      <div className="mt-4 flex flex-col gap-px">
        <NavItem href={`${home}/credits`} label="Plan" icon={CreditCard} />
        <NavItem href={`${base}/settings`} label="Settings" icon={Settings} />
        <NavItem href="/help" label="Help" icon={HelpCircle} />
      </div>
      {!rail && <Usage href={`${home}/credits`} credits={credits} />}
    </div>
  );
}

/* Usage meter (Figma: sidebar footer). Shows the AI credits left; the
   bar is relative to the 30 free credits a month until plans land. */
function Usage({ href, credits }: { href: string; credits: number | null }) {
  const left = credits ?? 0;
  const pct = Math.max(0, Math.min(100, Math.round((left / Math.max(30, left)) * 100)));
  return (
    <div className="mt-3 border border-[var(--v4-line)] bg-white p-3">
      <p className="flex items-center justify-between text-[12px]"><span className="text-[rgba(10,14,23,0.75)]">AI credits left</span><span className="font-semibold tabular-nums">{credits === null ? "–" : left.toLocaleString()}</span></p>
      <div className="mt-2 h-1 bg-[rgba(10,14,23,0.08)]"><div className="h-full bg-[var(--v4-blue)]" style={{ width: `${pct}%` }} /></div>
      <p className="mt-2 flex items-center justify-between text-[12px]"><span className="text-[rgba(10,14,23,0.62)]">Packs never expire</span><Link href={href} className="font-medium text-[var(--v4-blue)]">Top up</Link></p>
    </div>
  );
}

function SiteSwitcher({ site, sites, home, dev, rail }: { site: ShellSite; sites: ShellSite[]; home: string; dev: boolean; rail: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={box} className="relative">
      {rail ? (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="listbox" aria-label={`Switch site: ${site.name}`} title={site.name}
          className="grid h-10 w-10 place-items-center rounded-[11px] hover:bg-page">
          <SiteMark site={site} className="h-7 w-7 text-[11px]" />
        </button>
      ) : (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="listbox"
          className="flex w-full items-center gap-2.5 rounded-[2px] border border-[var(--v4-line)] bg-white p-2 text-left hover:border-[var(--v4-line-2)]">
          <SiteMark site={site} className="h-8 w-8 text-[13px]" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold">{site.name}</span>
            <span className="block truncate text-[11.5px] text-[rgba(10,14,23,0.62)]">{site.slug}.wintechstudio.com</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-mute" />
        </button>
      )}
      {open ? (
        <div className={`absolute top-[calc(100%+6px)] z-30 w-[232px] rounded-[2px] ${rail ? "left-0" : "inset-x-0 w-auto"}`}><div className="rounded-[2px] border border-[var(--v4-line)] bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(10,14,23,0.3)]" role="listbox" aria-label="Your sites">
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-mute-2">Your sites</p>
          {sites.map((s) => (
            <Link key={s.id} href={dev ? (home.startsWith("/demo") ? "/demo" : "/dev/dashboard") : `/dashboard/${s.id}`} role="option" aria-selected={s.id === site.id}
              className="flex items-center gap-2.5 rounded-[2px] px-2.5 py-2 hover:bg-[#fafafa]">
              <SiteMark site={s} className="h-7 w-7 text-[12px]" />
              <span className="min-w-0 flex-1 truncate text-[13px]">{s.name}</span>
              {s.id === site.id ? <Check className="h-4 w-4 text-accent" /> : null}
            </Link>
          ))}
          <div className="my-1 border-t border-line" />
          <Link href={home} className="flex items-center gap-2.5 rounded-[2px] px-2.5 py-2 text-[13px] text-[rgba(10,14,23,0.75)] hover:bg-[#fafafa] hover:text-[#0a0e17]">All sites</Link>
          <Link href="/create" className="flex items-center gap-2.5 rounded-[2px] px-2.5 py-2 text-[13px] text-[rgba(10,14,23,0.75)] hover:bg-[#fafafa] hover:text-[#0a0e17]">
            <span className="grid h-7 w-7 place-items-center rounded-full shadow-[0_0_0_1px_var(--line-2)]"><Plus className="h-4 w-4" /></span>
            New site
          </Link>
        </div></div>
      ) : null}
    </div>
  );
}
