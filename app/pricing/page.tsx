import type { Metadata } from "next";
import { FaqList } from "@/components/v4/FaqList";
import { PageShell, PageTop } from "@/components/v4/PageShell";
import { CompareTable, CreditsExplainer, PricingPlans } from "@/components/v4/pricing";

export const metadata: Metadata = {
  title: "Pricing · Wintech Templates",
  description: "Simple plans in naira and 0% cut of your sales. Start free, upgrade when you want your own domain or more AI credits.",
};

const FAQ: [string, string][] = [
  ["Do you take a cut of my sales?", "No. Wintech takes 0% on every plan. Paystack charges its normal processing fee and pays you directly."],
  ["Can I pay yearly?", "Yes. Pay for a year on any paid plan and you get 2 months free."],
  ["What happens if I run out of credits?", "Your site stays live. The AI assistant pauses until your credits renew next month, or you can buy a pack that never expires."],
];

export default function PricingPage() {
  return (
    <PageShell>
      <PageTop
        eyebrow="Pricing"
        title={<>Simple plans in naira.<br />0% cut of your sales.</>}
        intro="Pay monthly or yearly. Yearly gives you 2 months free on any paid plan."
      />
      <PricingPlans />
      <CompareTable />
      <CreditsExplainer />
      <FaqList title="Pricing questions" items={FAQ} />
    </PageShell>
  );
}
