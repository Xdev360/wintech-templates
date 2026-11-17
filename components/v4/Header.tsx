"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowRight, Banknote, BookOpen, Briefcase, Calendar, Camera, Coins, Cookie, CreditCard, File, Globe,
  HelpCircle, Image as ImageIcon, LayoutTemplate, LifeBuoy, Link2, Mail, Menu, MessageCircle, Palette,
  PenLine, Percent, Plus, Scissors, Shield, Shirt, Smartphone, Sparkles, Store, Truck, Upload, Users,
  Utensils, X,
} from "lucide-react";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { getTemplate } from "@/lib/templates";
import { Btn, EMAIL, Logo, STUDIO, WHATSAPP } from "./ui";

type Icon = ComponentType<{ className?: string; strokeWidth?: number }>;
type Item = [string, Icon, string];
type Menu = {
  label: string;
  cols: [string, Item[]][];
  featured: { title: string; href: string; label: string; template?: string };
  footer: Item[];
};

const MENUS: Menu[] = [
  {
    label: "Product",
    cols: [
      ["Build", [
        ["Templates", LayoutTemplate, "/templates"],
        ["Visual editor", PenLine, "/#how"],
        ["AI assistant", Sparkles, "/#ai"],
        ["Domains", Globe, "/domains"],
        ["Mobile friendly", Smartphone, "/templates"],
        ["Your web address", Link2, "/domains"],
      ]],
      ["Sell and get paid", [
        ["Online store", Store, "/templates?type=store"],
        ["Bookings", Calendar, "/templates?type=booking"],
        ["Paystack payments", CreditCard, "/#payments"],
        ["WhatsApp orders", MessageCircle, "/templates?type=store"],
        ["Delivery areas", Truck, "/templates?type=store"],
        ["Customers", Users, "/signup"],
      ]],
    ],
    featured: { title: "New in v4", href: "/#how", label: "What changed in v4", template: "booking-salon" },
    footer: [
      ["See pricing", Percent, "/pricing"],
      ["0% cut of your sales", Banknote, "/pricing"],
      ["Talk to us on WhatsApp", MessageCircle, WHATSAPP],
    ],
  },
  {
    label: "Templates",
    cols: [
      ["By business type", [
        ["Salons and beauty", Scissors, "/templates?type=booking"],
        ["Fashion stores", Shirt, "/templates/store-fashion"],
        ["Bakeries and food", Cookie, "/templates/store-food"],
        ["Restaurants", Utensils, "/templates/booking-restaurant"],
        ["Services and consultants", Briefcase, "/templates/booking-consultant"],
        ["Portfolios", Camera, "/templates?type=portfolio"],
      ]],
      ["By goal", [
        ["Sell online", Store, "/templates?type=store"],
        ["Take bookings", Calendar, "/templates?type=booking"],
        ["Collect a waitlist", Mail, "/templates/landing-waitlist"],
        ["Show your work", ImageIcon, "/templates?type=portfolio"],
        ["Promote an event", Sparkles, "/templates/landing-event"],
        ["Start from blank", LayoutTemplate, "/signup"],
      ]],
    ],
    featured: { title: "Featured template", href: "/templates/store-fashion", label: "Fashion store template", template: "store-fashion" },
    footer: [
      ["Browse all templates", LayoutTemplate, "/templates"],
      ["Sell your templates", Upload, "/sell"],
      ["How templates work", HelpCircle, "/help"],
    ],
  },
  {
    label: "Resources",
    cols: [
      ["Learn", [
        ["Help center", LifeBuoy, "/help"],
        ["Getting started", BookOpen, "/help/build-your-first-site"],
        ["Guides", File, "/help"],
        ["Payments setup", CreditCard, "/help"],
        ["Domains setup", Globe, "/help/connect-your-domain"],
        ["AI credits explained", Coins, "/pricing#credits"],
      ]],
      ["Company", [
        ["For designers", Palette, "/sell"],
        ["Wintech Studio", Briefcase, STUDIO],
        ["Contact us", Mail, `mailto:${EMAIL}`],
        ["WhatsApp support", MessageCircle, WHATSAPP],
        ["Terms", File, "/terms"],
        ["Privacy", Shield, "/privacy"],
      ]],
    ],
    featured: { title: "Start here", href: "/help/build-your-first-site", label: "Build your first site" },
    footer: [
      ["Help center", LifeBuoy, "/help"],
      ["Email support", Mail, `mailto:${EMAIL}`],
      ["WhatsApp support", MessageCircle, WHATSAPP],
    ],
  },
];

function A({ href, className, children, onClick }: { href: string; className?: string; children: React.ReactNode; onClick?: () => void }) {
  const ext = href.startsWith("http") || href.startsWith("mailto:");
  return ext ? (
    <a href={href} className={className} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" onClick={onClick}>{children}</a>
  ) : (
    <Link href={href} className={className} onClick={onClick}>{children}</Link>
  );
}

function Featured({ f, show }: { f: Menu["featured"]; show: boolean }) {
  const t = f.template ? getTemplate(f.template) : undefined;
  return (
    <A href={f.href} className="group flex flex-col p-2">
      <span className="relative block h-[214px] overflow-hidden bg-[var(--v4-panel)]">
        {t && show ? (
          <ScaledPreview ratio={368 / 214} initial={368 / 1280}>
            <TemplateSite template={t} />
          </ScaledPreview>
        ) : (
          <span className="flex h-full flex-col justify-end gap-2 p-5">
            <BookOpen className="h-5 w-5 text-[var(--v4-m62)]" strokeWidth={1.5} />
            <span className="text-[20px] font-semibold leading-[1.15] tracking-[-0.01em]">A first site in<br />one afternoon</span>
          </span>
        )}
      </span>
      <span className="flex items-center gap-2 px-2 py-3 text-[16px] font-medium leading-6">
        {f.label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
      </span>
    </A>
  );
}

function Mega({ m, show }: { m: Menu; show: boolean }) {
  return (
    <div className="hair bg-white">
      <div className="grid grid-cols-3">
        {m.cols.map(([title, items]) => (
          <div key={title} className="border-r border-[var(--v4-line)]">
            <p className="eyebrow flex h-[42px] items-center border-b border-[var(--v4-line)] px-4 !font-normal tracking-[0.04em]">{title}</p>
            <ul className="py-1">
              {items.map(([label, I, href]) => (
                <li key={label}>
                  <A href={href} className="mi flex h-11 items-center gap-3 px-4 py-2">
                    <span className="hair flex h-7 w-7 shrink-0 items-center justify-center bg-white">
                      <I className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span className="flex-1 text-[16px] font-medium leading-6">{label}</span>
                    <ArrowRight className="arr h-3 w-3" strokeWidth={1.5} />
                  </A>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="eyebrow flex h-[42px] items-center border-b border-[var(--v4-line)] px-4 !font-normal tracking-[0.04em]">{m.featured.title}</p>
          <Featured f={m.featured} show={show} />
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-[var(--v4-line)] py-1">
        {m.footer.map(([label, I, href]) => (
          <A key={label} href={href} className="flex h-9 items-center justify-center gap-2 text-[14px] font-medium text-[var(--v4-m75)] hover:text-[var(--v4-ink)]">
            <I className="h-4 w-4" strokeWidth={1.5} />
            {label}
          </A>
        ))}
      </div>
    </div>
  );
}

export function Header({ signedIn = false, announce = true }: { signedIn?: boolean; announce?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [seen, setSeen] = useState<Record<string, boolean>>({});
  const [mobile, setMobile] = useState(false);
  const [mobileSec, setMobileSec] = useState<string | null>(null);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(null), setMobile(false));
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const show = (label: string) => {
    setOpen(label);
    setSeen((s) => (s[label] ? s : { ...s, [label]: true }));
  };

  return (
    <header className="sticky top-0 z-40">
      {announce && (
        <Link
          href="/#how"
          className="flex h-8 items-center justify-center gap-3 border-b border-[rgba(245,245,245,0.12)] px-4 text-[14px] leading-[21px] text-white/75 hover:text-white"
          style={{ background: "linear-gradient(90deg,#111 0%,#1c1c1f 50%,#111 100%)" }}
        >
          <span className="rounded-[2px] bg-white px-2 py-px text-[11px] tracking-[0.04em] text-[var(--v4-ink)]">NEW</span>
          <span className="truncate">
            <span className="hidden sm:inline">Wintech Templates v4 is here: a new look and an AI assistant that builds your site with you</span>
            <span className="sm:hidden">v4 is here: a new look and an AI assistant</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        </Link>
      )}

      <div className="border-b border-[var(--v4-line)] bg-white">
        <div className="wrap flex h-[74px] items-center justify-between gap-6 max-md:h-[64px]">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="flex items-center gap-1 max-lg:hidden" aria-label="Main">
              {MENUS.slice(0, 2).map((m) => (
                <NavGroup key={m.label} m={m} open={open} show={show} hide={() => setOpen(null)} seen={!!seen[m.label]} />
              ))}
              <Link href="/pricing" className="flex h-9 items-center rounded-[2px] px-3 text-[14px] font-medium hover:bg-[var(--v4-panel)]">Pricing</Link>
              <Link href="/domains" className="flex h-9 items-center rounded-[2px] px-3 text-[14px] font-medium hover:bg-[var(--v4-panel)]">Domains</Link>
              <NavGroup m={MENUS[2]} open={open} show={show} hide={() => setOpen(null)} seen={!!seen[MENUS[2].label]} />
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {signedIn ? (
              <span className="max-sm:hidden"><Btn href="/dashboard" size="sm">Dashboard</Btn></span>
            ) : (
              <>
                <span className="flex gap-2 max-sm:hidden">
                  <Btn href="/login" kind="ghost" size="sm">Log in</Btn>
                  <Btn href="/signup" size="sm">Start free</Btn>
                </span>
              </>
            )}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-[2px] hover:bg-[var(--v4-panel)] lg:hidden"
              aria-label={mobile ? "Close menu" : "Open menu"}
              aria-expanded={mobile}
              onClick={() => setMobile((v) => !v)}
            >
              {mobile ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {mobile && (
        <div className="fixed inset-x-0 bottom-0 top-[var(--hh,106px)] z-40 flex flex-col overflow-y-auto bg-white lg:hidden" style={{ top: announce ? 96 : 64 }}>
          <nav className="flex-1" aria-label="Mobile">
            {MENUS.map((m) => (
              <div key={m.label} className="border-b border-[var(--v4-line)]">
                <button
                  type="button"
                  className="wrap flex h-14 w-full items-center justify-between text-[18px] font-medium"
                  aria-expanded={mobileSec === m.label}
                  onClick={() => setMobileSec((s) => (s === m.label ? null : m.label))}
                >
                  {m.label}
                  <Plus className={`plus h-4 w-4 ${mobileSec === m.label ? "rotate-45" : ""}`} strokeWidth={1.5} />
                </button>
                {mobileSec === m.label && (
                  <ul className="wrap pb-3">
                    {m.cols.flatMap(([, items]) => items).map(([label, I, href]) => (
                      <li key={label}>
                        <A href={href} onClick={() => setMobile(false)} className="flex h-11 items-center gap-3 text-[16px] font-medium">
                          <span className="hair flex h-7 w-7 items-center justify-center"><I className="h-4 w-4" strokeWidth={1.5} /></span>
                          {label}
                        </A>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {[["Pricing", "/pricing"], ["Domains", "/domains"]].map(([l, h]) => (
              <Link key={h} href={h} onClick={() => setMobile(false)} className="wrap flex h-14 items-center border-b border-[var(--v4-line)] text-[18px] font-medium">{l}</Link>
            ))}
          </nav>
          <div className="wrap flex flex-col gap-2 py-5">
            {signedIn ? (
              <Btn href="/dashboard" className="w-full">Dashboard</Btn>
            ) : (
              <>
                <Btn href="/signup" className="w-full" arrow>Start free</Btn>
                <Btn href="/login" kind="secondary" className="w-full">Log in</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavGroup({ m, open, show, hide, seen }: { m: Menu; open: string | null; show: (l: string) => void; hide: () => void; seen: boolean }) {
  const isOpen = open === m.label;
  return (
    <div
      className="nav-group"
      data-open={isOpen}
      onMouseEnter={() => show(m.label)}
      onMouseLeave={hide}
      onFocus={() => show(m.label)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && hide()}
    >
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-[2px] px-3 text-[14px] font-medium leading-[21px] hover:bg-[var(--v4-panel)]"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? hide() : show(m.label))}
      >
        {m.label}
        <Plus className="plus h-[14px] w-[14px]" strokeWidth={1.5} />
      </button>
      <div className="mega">
        <Mega m={m} show={seen} />
      </div>
    </div>
  );
}
