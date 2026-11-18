"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Banknote, Coins, Home, LayoutTemplate, Plus, Settings, Store } from "lucide-react";
import type { ShellSite, ShellUser } from "@/lib/dashboard-types";
import { AccountMenu, UpgradeCard } from "./AccountMenu";
import { Brand, BrandMarkLink } from "./Brand";
import { Frame } from "./Frame";
import { Group, NavItem, SiteMark } from "./nav";
import { useRail } from "./rail";
import { ReferButton } from "./ReferPanel";

/* ──────────────────────────────────────────────────────────────
   The account: where you land after logging in. Everything that is
   yours rather than one site's — every site, templates, credits, and
   what you earn. Click a site to go into its own dashboard.
   ────────────────────────────────────────────────────────────── */

export function AccountShell({
  base = "/dashboard",
  sites,
  user,
  credits,
  children,
}: {
  base?: string;
  sites: ShellSite[];
  user: ShellUser;
  credits: number | null;
  children: ReactNode;
}) {
  return (
    <Frame
      brand={<Brand href={base} />}
      brandMark={<BrandMarkLink href={base} />}
      sidebar={<AccountSidebar base={base} sites={sites} credits={credits} />}
      bar={<><ReferButton /><AccountMenu user={user} credits={credits} base={base} /></>}
      mobileTitle={<Brand href={base} />}
    >
      {children}
    </Frame>
  );
}

function AccountSidebar({ base, sites, credits }: { base: string; sites: ShellSite[]; credits: number | null }) {
  const rail = useRail();
  const siteHref = (id: string) => (base === "/dashboard" ? `/dashboard/${id}` : base.startsWith("/demo") ? "/demo" : "/dev/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col px-2.5 pb-2.5">
      <nav className="flex-1" aria-label="Account">
        <Group title="Workspace">
          <NavItem href={base} label="Home" icon={Home} exact />
          <NavItem href={`${base}/templates`} label="Templates" icon={LayoutTemplate} />
          <NavItem href={`${base}/credits`} label="Credits" icon={Coins} badge={credits === null ? undefined : credits.toLocaleString()} />
        </Group>

        <Group
          title="Your sites"
          action={
            <Link href={`${base}/new`} className="grid h-5 w-5 place-items-center rounded-[6px] text-mute-2 hover:bg-page hover:text-ink" aria-label="New site">
              <Plus className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {sites.map((s) => (
            <NavItem
              key={s.id}
              href={siteHref(s.id)}
              label={s.name}
              dot={s.published ? "live" : "off"}
              lead={<SiteMark site={s} className="h-[18px] w-[18px] text-[9.5px]" />}
            />
          ))}
          <NavItem href={`${base}/new`} label={sites.length ? "New site" : "Create your first site"} icon={Plus} exact />
        </Group>

        <Group title="Earn">
          <NavItem href={`${base}/affiliate`} label="Affiliate" icon={Banknote} />
          <NavItem href={`${base}/sell`} label="Sell templates" icon={Store} soon />
        </Group>
      </nav>

      <div className="flex flex-col gap-2">
        <UpgradeCard href={`${base}/credits`} rail={rail} />
        <NavItem href={`${base}/settings`} label="Settings" icon={Settings} />
      </div>
    </div>
  );
}
