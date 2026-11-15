import type { Metadata } from "next";
import { Clause, LegalPage } from "@/components/marketing/Legal";
import { isSignedIn } from "@/lib/session";

export const metadata: Metadata = {
  title: "Terms · Wintech Templates",
  description: "The deal between you and Wintech Studio, in plain words.",
};

export default async function TermsPage() {
  const signedIn = await isSignedIn();
  return (
    <LegalPage
      signedIn={signedIn}
      updated="18 September 2026"
      title="Terms of use"
      lead="The deal between you and Wintech Studio, Lagos. Using Wintech Templates means you accept this. It is written plainly on purpose."
    >
      <Clause title="What we provide">
        <p>Software for building and running a business website. We supply the tools, the templates and the address your site sits on. We do not sell what you sell, and we are not a party to any order your customers place.</p>
      </Clause>

      <Clause title="Your account">
        <p>Keep your password to yourself. What happens under your account is your responsibility. Tell us quickly if you think someone else is in it.</p>
        <p>One person, one account. You may run several sites from it, within the limits of your plan.</p>
      </Clause>

      <Clause title="Money between you and your customers">
        <p>Customers pay you directly, into your own bank account. Wintech never holds that money and takes no share of it.</p>
        <p>That also means we cannot referee a dispute. If a customer pays and you do not deliver, that is between you and them, and it may be a matter for your bank or the police. You are responsible for the goods and services you sell, for delivering them, and for any refunds.</p>
        <p>Marking an order as paid is your decision, made by looking at your own bank account. We only record what you tell us.</p>
      </Clause>

      <Clause title="What you pay us">
        <p>Plans are billed in advance and shown in naira before you pay. Credits included in a plan are for AI features and do not roll over when the month ends.</p>
        <p>We may change prices. Existing subscribers get at least 30 days' notice by email, and a chance to cancel before the new price applies.</p>
        <p>Premium templates and creator licences are one-off purchases, and each has its own refund terms stated at the time of sale.</p>
      </Clause>

      <Clause title="What you may not do">
        <p>No selling anything illegal. No fraud, no pretending to be someone else, no adult content, no schemes that depend on recruiting other people to pay in.</p>
        <p>No attacking the platform, and no automated scraping of other people's sites hosted here.</p>
        <p>If you do any of that, we may take the site down without notice. Where it is not obviously deliberate, we will tell you what is wrong and give you a chance to fix it first.</p>
      </Clause>

      <Clause title="Who owns what">
        <p>Your words, your photos, your logo and your customer list stay yours. You give us permission to store and display them, which is simply what hosting a website means.</p>
        <p>The templates, the editor and the platform stay ours. Buying a template gives you the right to use it for your own business. It does not let you resell it or pass it on as your own.</p>
      </Clause>

      <Clause title="Referrals and affiliates">
        <p>Commission is paid on real, paid subscriptions from people you genuinely referred. Referring yourself, or paying people to sign up and cancel, forfeits the earnings.</p>
      </Clause>

      <Clause title="Things going wrong">
        <p>We work hard to keep sites up, but we do not promise that the service will never be interrupted. Keep your own copy of anything you cannot afford to lose.</p>
        <p>If we fail you, what you can claim from us is limited to what you paid us in the twelve months before the problem. That limit does not apply to anything the law does not allow us to limit.</p>
      </Clause>

      <Clause title="Ending it">
        <p>You may close your account at any time, from Settings. We may close an account that breaks these terms, or after long inactivity on a free plan, with notice by email.</p>
        <p>When an account closes, its sites stop being served and its content is deleted.</p>
      </Clause>

      <Clause title="Which law applies">
        <p>The laws of the Federal Republic of Nigeria, and the courts of Lagos State.</p>
      </Clause>
    </LegalPage>
  );
}
