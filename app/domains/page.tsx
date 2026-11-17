import type { Metadata } from "next";
import { PageShell, PageTop } from "@/components/v4/PageShell";
import { Globe, Link2, RefreshCw } from "lucide-react";
import { DomainSearch } from "@/components/v4/domains";
import { TextLink } from "@/components/v4/ui";

export const metadata: Metadata = {
  title: "Domains · Wintech Templates",
  description: "Every site gets a free name.wintechstudio.com address. Buy a domain or connect one you own on Starter and up.",
};

const WAYS: [typeof Link2, string, string, string][] = [
  [Link2, "Free address", "name.wintechstudio.com is ready the moment you publish. Free on every plan.", "Every plan"],
  [Globe, "Buy a domain", "Search, pay with Paystack and we connect it for you. No records to copy.", "Starter and up"],
  [RefreshCw, "Connect one you own", "Keep it at your provider. We show you exactly which two records to add.", "Starter and up"],
];

const STEPS: [string, string][] = [
  ["Type your domain", "In the app, open Website, then Domains, then Connect one I own."],
  ["Add two records at your provider", "We check where your domain is managed and show the exact A and CNAME records to add."],
  ["We check and switch it on", "Once the records are found your site loads on your domain, with https added for you."],
];

export default async function DomainsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <PageShell>
      <PageTop
        eyebrow="Domains"
        title="Find your web address"
        intro="Every site gets a free name.wintechstudio.com address. Buy a domain here, or connect one you own on Starter and up."
      />
      <DomainSearch initial={q || "glowskin"} />

      <section className="bg-[var(--v4-soft)] py-[120px] max-md:py-20">
        <div className="wrap">
          <p className="eyebrow">Your options</p>
          <h2 className="h2s mt-4">Three ways to get an address</h2>
          <div className="hair mt-12 grid bg-white md:grid-cols-3">
            {WAYS.map(([I, t, d, tag], i) => (
              <div key={t} className={`flex flex-col gap-3 p-8 max-md:p-6 ${i ? "border-[var(--v4-line)] md:border-l max-md:border-t" : ""}`}>
                <span className="hair flex h-9 w-9 items-center justify-center"><I className="h-4 w-4" strokeWidth={1.5} /></span>
                <p className="mt-3 text-[18px] font-semibold">{t}</p>
                <p className="text-[15px] leading-[22px] text-[var(--v4-m75)]">{d}</p>
                <span className="tag tag-sm mt-1 w-fit">{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap grid gap-16 py-[120px] max-md:gap-10 max-md:py-20 lg:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">Connect</p>
          <h2 className="h2s">Connecting a domain you own</h2>
          <p className="intro">It takes three steps. If you get stuck, we can do it for you on WhatsApp.</p>
          <div className="mt-3"><TextLink href="/help/connect-your-domain">Read the domains guide</TextLink></div>
        </div>
        <ol className="flex flex-col">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="grid grid-cols-[48px_1fr] gap-2 border-t border-[var(--v4-line)] py-7">
              <span className="text-[12px] text-[var(--v4-m62)]">0{i + 1}</span>
              <span>
                <span className="block text-[18px] font-semibold">{t}</span>
                <span className="mt-2 block text-[15px] leading-[22px] text-[var(--v4-m75)]">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
