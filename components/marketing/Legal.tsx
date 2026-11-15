import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";

/* ──────────────────────────────────────────────────────────────
   The two pages nobody reads until something goes wrong, so they are
   written to be read: short sentences, no capitals shouting, no
   promises we cannot keep.
   ────────────────────────────────────────────────────────────── */

export function LegalPage({
  signedIn, title, lead, updated, children,
}: {
  signedIn: boolean; title: string; lead: string; updated: string; children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-10 md:px-8">
        <div className="max-w-[62ch]">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-mute-2">Last updated {updated}</p>
          <h1 className="mt-3 text-[28px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[34px]">{title}</h1>
          <p className="mt-3 text-[14px] leading-[1.65] text-mute">{lead}</p>
          <div className="mt-10 flex flex-col gap-8">{children}</div>
          <p className="mt-12 text-[13px] leading-[1.6] text-mute">
            Questions about anything here: <a className="text-ink underline underline-offset-4" href="mailto:hello@wintechstudio.com">hello@wintechstudio.com</a>.
            {" "}The other page is <Link className="text-ink underline underline-offset-4" href={title.startsWith("Privacy") ? "/terms" : "/privacy"}>here</Link>.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}

export function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[16px] font-semibold tracking-[-0.01em]">{title}</h2>
      <div className="mt-2 flex flex-col gap-2.5 text-[14px] leading-[1.65] text-mute">{children}</div>
    </section>
  );
}
