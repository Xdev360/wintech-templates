import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { HelpSearch, Topics } from "@/components/v4/help";
import { PageShell, PageTop } from "@/components/v4/PageShell";
import { Btn, EMAIL, WHATSAPP, WHATSAPP_LABEL } from "@/components/v4/ui";

export const metadata: Metadata = {
  title: "Help center · Wintech Templates",
  description: "Guides for building your site, taking Paystack payments, connecting a domain and using AI credits.",
};

export default function HelpPage() {
  return (
    <PageShell cta={false}>
      <div className="border-b border-[var(--v4-line)]">
        <PageTop eyebrow="Help center" title="How can we help?">
          <HelpSearch />
        </PageTop>
        <div className="h-10" />
      </div>
      <section className="wrap py-[96px] max-md:py-16">
        <h2 className="h2s">Browse by topic</h2>
        <div className="mt-10"><Topics /></div>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {[[MessageCircle, "Chat on WhatsApp", WHATSAPP_LABEL, WHATSAPP, "Open WhatsApp"], [Mail, "Email support", EMAIL, `mailto:${EMAIL}`, "Send an email"]].map(([I, t, s, h, b]) => {
            const Icon = I as typeof Mail;
            return (
              <div key={t as string} className="flex flex-wrap items-center gap-4 bg-[var(--v4-soft)] p-5">
                <span className="hair flex h-9 w-9 shrink-0 items-center justify-center bg-white"><Icon className="h-4 w-4" strokeWidth={1.5} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{t as string}</span>
                  <span className="block text-[13px] text-[var(--v4-m75)]">{s as string}</span>
                </span>
                <Btn href={h as string} kind="outline" size="sm">{b as string}</Btn>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
