import type { Metadata } from "next";
import { Image as ImageIcon, Send, ShieldCheck, Wallet } from "lucide-react";
import { CATALOG } from "@/components/v4/catalog";
import { FaqList } from "@/components/v4/FaqList";
import { PageShell } from "@/components/v4/PageShell";
import { TCard } from "@/components/v4/TCard";
import { Btn, EMAIL } from "@/components/v4/ui";

export const metadata: Metadata = {
  title: "For designers · Wintech Templates",
  description: "Design templates for Nigerian businesses. We review every one, put it in the template store and pay you when businesses use it.",
};

const APPLY = `mailto:${EMAIL}?subject=${encodeURIComponent("I want to sell templates on Wintech")}&body=${encodeURIComponent("Hi Wintech,\n\nMy name is ...\nMy work: (link)\nThe kind of templates I want to make: ...\n")}`;

const STEPS: [typeof Send, string, string][] = [
  [Send, "Apply", "Send a link to your work. We look for clean layout and real business sense."],
  [ImageIcon, "Build", "Design with the Wintech section kit so your template works in the editor and with AI."],
  [ShieldCheck, "Review", "Every template must pass the 1,000 words test: it works with any business copy."],
  [Wallet, "Earn", "Your template goes live in the store and you are paid when businesses buy it."],
];

const STANDARDS: [string, string][] = [
  ["Works with any copy", "Long names, short names, no photos, too many photos. It still looks good."],
  ["Phone first", "Most customers will open it on a phone. Design for that, then scale up."],
  ["Built from sections", "Use the Wintech sections so owners can reorder and the AI can edit."],
  ["Made for how Nigerians buy", "Clear prices in naira, WhatsApp orders, delivery areas and bookings."],
  ["Light and fast", "Compress images and keep effects simple so pages load on mobile data."],
];

const FAQ: [string, string][] = [
  ["How much do I earn per sale?", "The revenue share is being finalised. We will confirm it with you before your first template goes live."],
  ["Do I need to code?", "No. You design with the Wintech section kit and we help you turn it into a working template."],
  ["Who owns the template?", "You keep the rights to your design. The exact terms are in the designer agreement we share with you before your first template goes live."],
];

/* For designers (Figma "Desktop / For designers"). */
export default function SellPage() {
  const show = ["portfolio-designer", "portfolio-developer", "portfolio-photographer"].map((id) => CATALOG.find((c) => c.id === id)!);
  return (
    <PageShell>
      <section className="wrap pb-16 pt-[96px] max-md:pt-14">
        <p className="eyebrow">For designers</p>
        <h1 className="h1 mt-5 max-w-[900px] !text-[64px] max-md:!text-[40px]">Sell your templates to Nigerian businesses</h1>
        <p className="intro mt-5 max-w-[680px]">Design templates for salons, shops, bakeries and service businesses. We review every one, put it in the template store and pay you when businesses use it.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Btn href={APPLY} arrow>Apply to sell</Btn>
          <Btn href="#standards" kind="secondary">Read the template rules</Btn>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {show.map((c) => <TCard key={c.id} c={c} />)}
        </div>
      </section>

      <section className="wrap py-[96px] max-md:py-16">
        <p className="eyebrow">How it works</p>
        <h2 className="h2 mt-4">From your file to the store</h2>
        <p className="intro mt-4">Four steps. We help at each one.</p>
        <div className="hair mt-12 grid sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([I, t, d], i) => (
            <div key={t} className={`flex flex-col gap-3 border-[var(--v4-line)] p-7 ${i ? "lg:border-l" : ""} max-lg:border-t max-lg:first:border-t-0 ${i % 2 ? "sm:max-lg:border-l" : ""} ${i === 1 ? "sm:max-lg:border-t-0" : ""}`}>
              <span className="flex items-center justify-between text-[12px] text-[var(--v4-m62)]">0{i + 1}<I className="h-4 w-4" strokeWidth={1.5} /></span>
              <p className="mt-4 text-[18px] font-semibold">{t}</p>
              <p className="text-[15px] leading-[22px] text-[var(--v4-m75)]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="standards" className="scroll-mt-28 bg-[var(--v4-soft)] py-[120px] max-md:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.7fr]">
          <div className="flex flex-col gap-4">
            <p className="eyebrow">Standards</p>
            <h2 className="h2s">What we look for</h2>
            <p className="intro">Business owners will fill your template with their own words and photos. It has to survive that.</p>
          </div>
          <dl>
            {STANDARDS.map(([t, d]) => (
              <div key={t} className="grid gap-2 border-t border-[var(--v4-line)] py-6 sm:grid-cols-[240px_1fr]">
                <dt className="text-[16px] font-semibold">{t}</dt>
                <dd className="text-[15px] leading-[22px] text-[var(--v4-m75)]">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <FaqList title="Designer questions" items={FAQ} />
    </PageShell>
  );
}
