import type { Metadata } from "next";
import { Clause, LegalPage } from "@/components/marketing/Legal";
import { isSignedIn } from "@/lib/session";

export const metadata: Metadata = {
  title: "Privacy · Wintech Templates",
  description: "What we keep, why we keep it, and how to get it deleted.",
};

export default async function PrivacyPage() {
  const signedIn = await isSignedIn();
  return (
    <LegalPage
      signedIn={signedIn}
      updated="18 September 2026"
      title="Privacy"
      lead="Wintech Templates is run by Wintech Studio in Lagos, Nigeria. This says what we keep, why, and how to get rid of it. If a sentence here is unclear, that is our fault — write to us and we will fix the wording."
    >
      <Clause title="What we keep about you">
        <p>Your name, your email address, and the date you joined. Your password is never stored as you typed it; it is scrambled by our sign-in provider so nobody, including us, can read it back.</p>
        <p>Everything you put on your site: your words, prices, photos, bank details for receiving payment, and your site address.</p>
        <p>If you sign in with Google, we receive your name, email address and profile picture from Google. Nothing else, and we never gain access to your Gmail or your files.</p>
      </Clause>

      <Clause title="What we keep about your customers">
        <p>When someone orders from a site built here, we store the name, phone number, email if they gave one, what they ordered, and any note they wrote. This belongs to the shop owner. We hold it on their behalf so they can fill the order, and we do not sell it, market to it, or use it for anything else.</p>
        <p>If a shop owner asks us to delete their customer records, we delete them.</p>
      </Clause>

      <Clause title="Money">
        <p>Customers pay shop owners by bank transfer, directly. Wintech never touches that money and never sees a customer's bank login. We store only the account details a shop owner chooses to display, because they have to appear on the payment screen.</p>
        <p>When we start taking card payments for plans, that is handled by a licensed payment company. Card numbers never reach our servers.</p>
      </Clause>

      <Clause title="Cookies">
        <p>One cookie, which keeps you signed in. There is no advertising, no tracking pixel, and no analytics that follows you to other websites.</p>
      </Clause>

      <Clause title="Companies that help us run this">
        <p>We use a small number of providers, and your information reaches them only so the product works. They are bound by their own contracts not to use it for anything else.</p>
        <p>Supabase stores the database and handles sign-in. Vercel hosts the website. Resend sends receipt emails. Anthropic provides the AI that writes copy when you ask it to. These companies are outside Nigeria, so your information is stored and processed abroad.</p>
        <p>What you type into Wintech AI is sent to Anthropic to produce the answer. It is not used to train their models.</p>
      </Clause>

      <Clause title="How long we keep it">
        <p>While your account exists. Delete a site and its content goes with it. Ask us to close your account and we remove your personal details and your sites.</p>
        <p>We keep records of orders and payments for as long as the law requires us to, even after an account closes.</p>
      </Clause>

      <Clause title="Your rights">
        <p>Under the Nigeria Data Protection Act you may ask for a copy of what we hold about you, ask us to correct it, or ask us to delete it. Write to hello@wintechstudio.com and we will answer within 30 days.</p>
        <p>You may also complain to the Nigeria Data Protection Commission if you think we have handled your information badly.</p>
      </Clause>

      <Clause title="Children">
        <p>This is a tool for running a business, and it is not meant for anyone under 18.</p>
      </Clause>

      <Clause title="Changes">
        <p>If we change anything that matters, we will say so by email before it takes effect, not quietly on this page.</p>
      </Clause>
    </LegalPage>
  );
}
