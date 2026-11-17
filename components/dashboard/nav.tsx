"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { inkFor, safeAccent } from "@/lib/color";
import type { ShellSite } from "@/lib/dashboard-types";
import { useRail } from "./rail";

/* Pieces both sidebars share: groups, items, the site avatar, the
   account card. The dashboard wears Wintech's navy; only a site's own
   avatar carries that site's brand colour. */

import type { Icon } from "./nav-types";
export type { Icon };

export function Group({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const rail = useRail();
  return (
    <div className="mb-3">
      {rail ? (
        <div className="mx-auto mb-1.5 mt-1 h-px w-6 bg-line" aria-hidden="true" />
      ) : (
        <div className="mb-0.5 flex h-6 items-center justify-between px-2.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[rgba(10,14,23,0.5)]">{title}</p>
          {action}
        </div>
      )}
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

export function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  soon,
  badge,
  dot,
  lead,
}: {
  href: string;
  label: string;
  icon?: Icon;
  exact?: boolean;
  soon?: boolean;
  badge?: string;
  dot?: "live" | "off";
  lead?: ReactNode;
}) {
  const pathname = usePathname();
  const rail = useRail();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const icon = lead ?? (Icon ? <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-[#0a0e17]" : "text-[rgba(10,14,23,0.62)]"}`} strokeWidth={1.5} /> : null);

  if (rail) {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        title={soon ? `${label} · soon` : label}
        className={`relative mx-auto grid h-9 w-9 place-items-center rounded-[2px] transition-colors ${
          active ? "bg-[rgba(10,14,23,0.06)]" : "hover:bg-[rgba(10,14,23,0.04)]"
        }`}
      >
        {icon}
        {badge || dot === "live" ? (
          <span className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${dot === "live" ? "bg-emerald-500" : "bg-accent"}`} aria-hidden="true" />
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex h-9 items-center gap-2.5 rounded-[2px] px-2.5 text-[14px] transition-colors ${
        active ? "bg-[rgba(10,14,23,0.06)] font-medium text-[#0a0e17]" : "text-[rgba(10,14,23,0.75)] hover:bg-[rgba(10,14,23,0.04)] hover:text-[#0a0e17]"
      }`}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {soon ? <span className="rounded-[2px] bg-[rgba(10,14,23,0.06)] px-1.5 py-px text-[11px] text-[rgba(10,14,23,0.62)]">Soon</span> : null}
      {badge ? <span className="rounded-[2px] bg-[rgba(10,14,23,0.06)] px-1.5 py-px text-[12px] tabular-nums text-[rgba(10,14,23,0.75)]">{badge}</span> : null}
      {dot ? <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot === "live" ? "bg-emerald-500" : "bg-line-2"}`} aria-label={dot === "live" ? "Live" : "Hidden"} /> : null}
    </Link>
  );
}

/** The site's own mark: its logo, or its initial on its brand colour. */
export function SiteMark({ site, className = "h-10 w-10 text-[13px]" }: { site: ShellSite; className?: string }) {
  if (site.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={site.logoUrl} alt="" className={`shrink-0 rounded-[2px] object-cover ${className}`} />;
  }
  const bg = safeAccent(site.accent);
  return (
    <span className={`grid shrink-0 place-items-center rounded-[2px] font-semibold ${className}`} style={{ background: bg, color: inkFor(bg) }} aria-hidden="true">
      {(site.name || site.slug).slice(0, 1).toUpperCase()}
    </span>
  );
}
