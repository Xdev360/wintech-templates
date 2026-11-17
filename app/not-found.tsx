import Link from "next/link";
import { ArrowRight, LayoutTemplate, LifeBuoy, MessageCircle, Percent } from "lucide-react";
import { ClosingCTA, Footer } from "@/components/v4/Footer";
import { Header } from "@/components/v4/Header";
import { Btn, WHATSAPP } from "@/components/v4/ui";

/* 404 (Figma "Desktop / 404"). Also shown for a customer address that is
   not taken yet, so it points people to the templates first. */

const LINKS: [string, typeof Percent, string][] = [
  ["Templates", LayoutTemplate, "/templates"],
  ["Pricing", Percent, "/pricing"],
  ["Help center", LifeBuoy, "/help"],
  ["WhatsApp us", MessageCircle, WHATSAPP],
];

export default function NotFound() {
  return (
    <main className="v4">
      <Header />
      <section className="wrap flex flex-col items-center py-[120px] text-center max-md:py-20">
        <p className="eyebrow">404</p>
        <h1 className="h1 mt-5 !text-[64px] max-md:!text-[40px]">This page is not here</h1>
        <p className="intro mt-5 max-w-[560px]">The link may be old or mistyped. Try the home page or pick up where most people start: the templates.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Btn href="/">Go to home</Btn>
          <Btn href="/templates" kind="secondary">Browse templates</Btn>
        </div>
        <div className="hair mt-14 grid w-full max-w-[880px] grid-cols-2 md:grid-cols-4">
          {LINKS.map(([l, I, h], i) => {
            const cls = `flex h-14 items-center gap-3 px-4 text-[15px] font-medium hover:bg-[var(--v4-soft)] ${i ? "md:border-l" : ""} ${i % 2 ? "max-md:border-l" : ""} ${i > 1 ? "max-md:border-t" : ""} border-[var(--v4-line)]`;
            const inner = (<><I className="h-4 w-4" strokeWidth={1.5} /><span className="flex-1 text-left">{l}</span><ArrowRight className="h-4 w-4" strokeWidth={1.5} /></>);
            return h.startsWith("http") ? (
              <a key={l} href={h} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
            ) : (
              <Link key={l} href={h} className={cls}>{inner}</Link>
            );
          })}
        </div>
      </section>
      <ClosingCTA />
      <Footer />
    </main>
  );
}
