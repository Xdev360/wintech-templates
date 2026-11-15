import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Coins, Upload } from "lucide-react";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { SectionHead } from "@/components/marketing/Reveal";
import { isSignedIn } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sell your templates · Wintech Templates",
  description:
    "Design a template, list it on Wintech, and keep 70% of every sale. Applications open soon.",
};

/* ──────────────────────────────────────────────────────────────
   Make money with us.

   Marked coming soon on purpose: taking applications before reviews
   and payouts exist would mean taking people's work with nowhere to
   sell it. The terms are stated now so designers can decide early.
   ────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    icon: BadgeCheck,
    title: "Apply once",
    body: "Send two designs you have made. We look at craft, not credentials. Approved designers pay once for a creator licence.",
  },
  {
    icon: Upload,
    title: "Build and publish",
    body: "Build with Claude through the Wintech connector, or design it yourself. Set your price inside the band we allow, and publish.",
  },
  {
    icon: Coins,
    title: "Keep 70%",
    body: "You keep 70% of every sale. Paid out monthly by transfer, after the refund window closes.",
  },
];

export default async function SellPage() {
  const signedIn = await isSignedIn();

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-10 md:px-8">
        <div className="max-w-[52ch]">
          <span className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 text-[12px] font-medium text-mute">
            Applications open soon
          </span>
          <h1 className="mt-4 text-[28px] font-semibold leading-[1.06] tracking-[-0.03em] md:text-[34px]">
            Make money with <span className="text-gradient">your designs</span>
          </h1>
          <p className="mt-3 text-[14px] leading-[1.6] text-mute">
            Nigerian businesses buy a template and have a site running the same day. If you design
            one they buy, you get paid every time — without finding the clients yourself.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-[13px] p-4 shadow-[0_0_0_1px_var(--line)]">
              <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-accent-3/40 text-accent">
                <s.icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-[13px] font-medium">{s.title}</p>
              <p className="mt-1 text-[12px] leading-[1.55] text-mute">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <SectionHead label="The terms" title="Said plainly, before you build anything" />
          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              ["Your share", "70% of every sale. Wintech keeps 30% for hosting, payments, and support."],
              ["Your price", "You set it, inside a band we publish. Premium templates sit between ₦12,000 and ₦40,000."],
              ["Review", "Every template is checked before it lists. One broken template costs us more than the 30% earns."],
              ["The licence", "A one-off fee to become a listed creator. It pays for the review and keeps the library serious."],
              ["Who owns it", "You do. You can take it down whenever you like; people who already bought it keep working."],
              ["Payouts", "Monthly, by transfer, above a minimum, after the refund window."],
            ].map(([term, detail]) => (
              <div key={term}>
                <dt className="text-[13px] font-medium">{term}</dt>
                <dd className="mt-0.5 text-[12px] leading-[1.55] text-mute">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 rounded-[16px] p-6 shadow-[0_0_0_1px_var(--line)]">
          <p className="text-[14px] font-medium">Want to be in the first group?</p>
          <p className="mt-1 max-w-[58ch] text-[13px] leading-[1.6] text-mute">
            Applications open when reviews and payouts are running. Send two designs now and you go
            to the front of the queue.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="https://www.wintechstudio.com/contact.html" className="btn-primary">
              Send your designs <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link href="/templates" className="btn-soft">See what sells</Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
