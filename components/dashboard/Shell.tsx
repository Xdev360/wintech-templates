"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, BarChart3, Blocks, BookOpen, CalendarCheck, Check, ChevronsUpDown, Coins,
  Plus,
  FolderKanban, Inbox, LayoutGrid, Package, Paintbrush, Receipt, Settings,
} from "lucide-react";
import type { ShellSite, ShellUser } from "@/lib/dashboard-types";
import type { Kind } from "@/lib/templates";
import { Frame } from "./Frame";
import { AccountMenu, UpgradeCard } from "./AccountMenu";
import { Brand, BrandMarkLink } from "./Brand";
import { Group, NavItem, SiteMark } from "./nav";
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

const MAIN: Item[] = [
  { label: "Overview", path: "", icon: LayoutGrid },
  { label: "Site", path: "/site", icon: Paintbrush },
  { label: "Inbox", path: "/inbox", icon: Inbox },
  { label: "Analytics", path: "/analytics", icon: BarChart3, soon: true },
];

const BY_KIND: Record<Kind, { title: string; items: Item[] } | null> = {
  store: { title: "Store", items: [
    { label: "Products", path: "/site?part=items", icon: Package },
    { label: "Orders", path: "/orders", icon: Receipt },
  ] },
  booking: { title: "Booking", items: [
    { label: "Services", path: "/site?part=items", icon: BookOpen },
    { label: "Bookings", path: "/bookings", icon: CalendarCheck, soon: true },
  ] },
  portfolio: { title: "Portfolio", items: [
    { label: "Projects", path: "/site?part=items", icon: FolderKanban },
    { label: "Bookings", path: "/bookings", icon: CalendarCheck, soon: true },
  ] },
  landing: null,
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
  const home = base.startsWith("/dev/") ? "/dev/account" : "/dashboard";
  const kind = BY_KIND[site.kind];

  const sidebar = <SiteSidebar base={base} home={home} site={site} sites={sites} kind={kind} credits={credits} />;

  return (
    <Frame
      brand={<Brand href={home} />}
      brandMark={<BrandMarkLink href={home} />}
      sidebar={sidebar}
      bar={<><ReferButton /><AccountMenu user={user} credits={credits} base={home} /></>}
      mobileTitle={<><SiteMark site={site} className="h-8 w-8 text-[12px]" /><span className="truncate text-[13px] font-medium">{site.name}</span></>}
    >
      {children}
    </Frame>
  );
}

/* The sidebar reads the fold state itself, so it can swap the site card
   for just the site's mark and hide the upgrade card's words. */
function SiteSidebar({
  base, home, site, sites, kind, credits,
}: {
  base: string; home: string; site: ShellSite; sites: ShellSite[];
  kind: { title: string; items: Item[] } | null; credits: number | null;
}) {
  const rail = useRail();
  return (
    <div className="flex min-h-full flex-1 flex-col px-2.5 pb-2.5">
      <div className={rail ? "flex justify-center pb-2" : "pb-2"}>
        <SiteSwitcher site={site} sites={sites} home={home} dev={home !== "/dashboard"} rail={rail} />
      </div>

      <nav className="flex-1" aria-label="Site">
        <Group title="Site">
          {MAIN.map((it) => <NavItem key={it.label} href={`${base}${it.path}`} label={it.label} icon={it.icon} soon={it.soon} exact={it.path === ""} />)}
        </Group>
        {kind ? (
          <Group title={kind.title}>
            {kind.items.map((it) => <NavItem key={it.label} href={`${base}${it.path}`} label={it.label} icon={it.icon} soon={it.soon} />)}
          </Group>
        ) : null}
        <Group title="Grow">
          <NavItem href={`${base}/plugins`} label="Plugins" icon={Blocks} />
          <NavItem href={`${home}/credits`} label="Credits" icon={Coins} badge={credits === null ? undefined : credits.toLocaleString()} />
        </Group>
      </nav>

      <div className="flex flex-col gap-2">
        <UpgradeCard href={`${home}/credits`} rail={rail} />
        <div className="flex flex-col gap-px">
          <NavItem href={`${base}/settings`} label="Site settings" icon={Settings} />
          <NavItem href={home} label="All sites" icon={ArrowLeft} exact />
        </div>
      </div>
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
          className="flex w-full items-center gap-2.5 rounded-[11px] bg-page p-2 text-left shadow-[0_0_0_1px_var(--line)] hover:shadow-[0_0_0_1px_var(--line-2)]">
          <SiteMark site={site} className="h-8 w-8 text-[12px]" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">{site.name}</span>
            <span className="block truncate text-[11.5px] text-mute">{site.kindLabel} · {site.templateName}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-mute" />
        </button>
      )}
      {open ? (
        <div className={`absolute top-[calc(100%+6px)] z-30 w-[232px] rounded-[12px] ${rail ? "left-0" : "inset-x-0 w-auto"}`}><div className="rounded-[12px] bg-page p-1.5 shadow-[0_0_0_1px_var(--line),0_16px_40px_-16px_rgba(0,0,0,0.3)]" role="listbox" aria-label="Your sites">
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-mute-2">Your sites</p>
          {sites.map((s) => (
            <Link key={s.id} href={dev ? "/dev/dashboard" : `/dashboard/${s.id}`} role="option" aria-selected={s.id === site.id}
              className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-soft">
              <SiteMark site={s} className="h-7 w-7 text-[12px]" />
              <span className="min-w-0 flex-1 truncate text-[13px]">{s.name}</span>
              {s.id === site.id ? <Check className="h-4 w-4 text-accent" /> : null}
            </Link>
          ))}
          <div className="my-1 border-t border-line" />
          <Link href={`${home}/new`} className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-mute hover:bg-soft hover:text-ink">
            <span className="grid h-7 w-7 place-items-center rounded-full shadow-[0_0_0_1px_var(--line-2)]"><Plus className="h-4 w-4" /></span>
            New site
          </Link>
        </div></div>
      ) : null}
    </div>
  );
}
