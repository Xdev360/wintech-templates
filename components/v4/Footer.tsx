"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Btn, EMAIL, Logo, STUDIO, WHATSAPP, WHATSAPP_LABEL } from "./ui";

/* Closing band and footer (Figma: "Closing CTA / desktop", "Footer / desktop"). */

export function ClosingCTA({
  eyebrow = "Get started",
  title = <>Your business,<br />online this week</>,
  sub = "Pick a template, add your products, take payments with Paystack.",
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  sub?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[260px]"
        style={{ background: "radial-gradient(60% 100% at 50% 100%, rgba(59,91,255,0.55), rgba(59,91,255,0.12) 55%, transparent 80%)" }}
      />
      <div className="wrap relative flex flex-col items-center py-[200px] text-center max-md:py-[120px]">
        <p className="eyebrow !text-white/60">{eyebrow}</p>
        <h2 className="h2 mt-5">{title}</h2>
        <p className="mt-5 text-[18px] leading-[27px] text-white/75 max-md:text-[16px]">{sub}</p>
        <Btn href="/signup" arrow size="sm" className="mt-8">Start free</Btn>
      </div>
    </section>
  );
}

function Clock() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const f = () =>
      setT(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(new Date()));
    f();
    const id = setInterval(f, 30_000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t ?? "--:--"} WAT</span>;
}

const COLS: [string, [string, string][]][] = [
  ["Product", [["Templates", "/templates"], ["Pricing", "/pricing"], ["Domains", "/domains"], ["AI assistant", "/#ai"], ["Payments", "/#payments"]]],
  ["Templates", [["Salons", "/templates?type=booking"], ["Fashion", "/templates/store-fashion"], ["Bakeries", "/templates/store-food"], ["Restaurants", "/templates/booking-restaurant"], ["Services", "/templates/booking-consultant"]]],
  ["Resources", [["Help center", "/help"], ["Guides", "/help"], ["For designers", "/sell"], ["Sell templates", "/sell"]]],
  ["Company", [["Wintech Studio", STUDIO], ["Contact", `mailto:${EMAIL}`], ["Terms", "/terms"], ["Privacy", "/privacy"]]],
];

const ASK = "Tell me about Wintech Templates (app.wintechstudio.com), the website builder for Nigerian small businesses.";

function FLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const ext = href.startsWith("http") || href.startsWith("mailto:");
  return ext ? (
    <a href={href} className={className} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>
  ) : (
    <Link href={href} className={className}>{children}</Link>
  );
}

export function Footer() {
  const ai: [string, string][] = [
    ["ChatGPT", `https://chatgpt.com/?q=${encodeURIComponent(ASK)}`],
    ["Claude", `https://claude.ai/new?q=${encodeURIComponent(ASK)}`],
    ["Perplexity", `https://www.perplexity.ai/search?q=${encodeURIComponent(ASK)}`],
  ];
  return (
    <footer className="bg-[#0f0f0f] text-white">
      <div className="wrap flex h-[46px] items-center justify-between border-b border-white/10 text-[11px] uppercase tracking-[0.06em] text-white/60">
        <span className="flex items-center gap-2">Lagos <span className="live-dot" /> <Clock /></span>
        <span>Payments by Paystack</span>
      </div>
      <div className="flex flex-col items-center gap-4 border-b border-white/10 py-11 text-center">
        <Logo dark />
        <p className="text-[18px] leading-[27px] text-white/75">Websites for Nigerian small businesses.</p>
      </div>
      <div className="wrap grid gap-12 py-14 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-4">
          <p className="h3 !text-[28px] !leading-[36px]">Build it, sell from it, get paid.</p>
          <a href={`mailto:${EMAIL}`} className="w-fit text-[16px] underline underline-offset-4">{EMAIL}</a>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="w-fit text-[16px] underline underline-offset-4">WhatsApp {WHATSAPP_LABEL}</a>
          <p className="mt-4 text-[24px] font-semibold tracking-[-0.01em]">Ask AI about Wintech Templates</p>
          <div className="flex flex-wrap gap-2">
            {ai.map(([l, h]) => (
              <a key={l} href={h} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-[2px] border border-white/15 px-4 text-[14px] hover:border-white/35">
                <Sparkles className="h-4 w-4" strokeWidth={1.5} /> {l}
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-14 gap-y-10 sm:grid-cols-4">
          {COLS.map(([title, links]) => (
            <div key={title} className="flex flex-col gap-3">
              <p className="text-[11px] uppercase tracking-[0.06em] text-white/50">{title}</p>
              {links.map(([l, h]) => (
                <FLink key={l} href={h} className="text-[14px] text-white/85 hover:text-white">{l}</FLink>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="wrap flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-6 text-[14px] text-white/60">
        <div className="flex gap-8">
          <span>© {new Date().getFullYear()} Wintech Studio</span>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
        </div>
        <div className="flex gap-8">
          <a href="https://www.instagram.com/wintechstudio" target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a>
          <a href="https://x.com/wintechstudio_" target="_blank" rel="noreferrer" className="hover:text-white">X</a>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a>
        </div>
      </div>
    </footer>
  );
}
