import Link from "next/link";
import { Mark } from "@/components/shell/Mark";

/* A big closing band over the same illustration as the hero, then the
   links. Every link here goes somewhere that exists. */
export function MarketingFooter() {
  return (
    <footer className="relative isolate overflow-hidden">
      <div className="hero-art absolute inset-0 -z-10 [background-position:center_70%]" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-page to-transparent" aria-hidden="true" />

      <div className="mx-auto max-w-[1180px] px-4 pb-8 pt-28 md:px-8 md:pt-36">
        <div className="glass mx-auto max-w-[760px] px-6 py-10 text-center md:px-12 md:py-14">
          <p className="text-gradient text-[14px] font-semibold">Your site, live today</p>
          <p className="mt-2 text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink md:text-[46px]">Start free. No card needed.</p>
          <p className="mx-auto mt-3 max-w-[44ch] text-[14px] text-mute">Pick a template, make it yours, and share yourname.wintechstudio.com tonight.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Link href="/templates" className="btn-soft">Browse templates</Link>
            <Link href="/signup" className="btn-primary">Get started</Link>
          </div>
        </div>

        <div className="glass mt-6 grid gap-8 px-6 py-8 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-10">
          <div>
            <Link href="/" className="flex items-center gap-2 text-[14px] font-semibold text-ink"><Mark className="h-4 w-auto" /> Wintech Templates</Link>
            <p className="mt-2 max-w-[32ch] text-[13px] leading-relaxed text-mute">Websites for portfolios, landing pages, stores, and booking, from Wintech Studio in Lagos.</p>
          </div>
          <Col title="Product" links={[["Templates", "/templates"], ["How it works", "/#how"], ["Wintech AI", "/#ai"], ["Your address", "/#domain"], ["Works with Claude", "/#claude"]]} />
          <Col title="Account" links={[["Get started", "/signup"], ["Log in", "/login"], ["Questions", "/#faq"]]} />
          <Col title="Earn" links={[["Sell your templates", "/sell"]]} />
          <Col title="Company" links={[["Wintech Studio", "https://www.wintechstudio.com"], ["Contact", "https://www.wintechstudio.com/contact.html"], ["Privacy", "/privacy"], ["Terms", "/terms"]]} />
        </div>
        <div className="mt-4 flex flex-col justify-between gap-2 px-2 text-[12px] text-mute md:flex-row">
          <span>© 2026 Wintech Studio, Lagos</span>
          <span>One cookie, to keep you signed in. No tracking.</span>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-mute-2">{title}</p>
      <ul className="mt-3 flex flex-col gap-2 text-[14px]">
        {links.map(([label, href]) => (
          <li key={label}><Link href={href} className="text-ink/80 hover:text-ink">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
