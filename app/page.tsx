import Link from "next/link";
import { Check, LayoutTemplate, MousePointerClick, PlugZap, Rocket, Sparkles } from "lucide-react";
import { BrandDemo } from "@/components/marketing/BrandDemo";
import { CookieNotice } from "@/components/marketing/CookieNotice";
import { DomainCheck } from "@/components/marketing/DomainCheck";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { SectionHead } from "@/components/marketing/Reveal";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { GalleryCard, HeroCard } from "@/components/templates/TemplateCard";
import { TemplateFinder } from "@/components/templates/TemplateFinder";
import { isSignedIn } from "@/lib/session";
import { getTemplate, TEMPLATES } from "@/lib/templates";

/* The public home, on Webild's structure: one job above the fold, then
   the collection, how it works, the AI, your address, your brand, Claude,
   questions, and a big closing band. Every claim on it is true today, and
   what is not ready says so. */

const FEATURED = ["store-skincare", "booking-salon", "portfolio-designer", "landing-event", "store-fashion", "booking-restaurant"];

const FAQ: [string, string][] = [
  ["What is Wintech Templates?", "Ready-made websites. Pick one, change the words and photos, and your site is live at yourname.wintechstudio.com."],
  ["Is it free?", "Yes. Your first site is free. Wintech AI uses credits, and you get 20 free credits when you join."],
  ["What does Wintech AI do?", "You tell it what to change, in your own words. It shows you the change first. Nothing goes live until you press Apply."],
  ["Can I use it from Claude?", "Yes. Make a link in your dashboard, add it to Claude, and ask Claude to build or change your site."],
  ["Can I use my own domain name?", "Soon. You will be able to buy a .com or .ng here, or connect one you already have."],
  ["How do my customers pay me?", "By bank transfer, straight to your account. Wintech takes no fee and never holds your money."],
];

export default async function HomePage() {
  const signedIn = await isSignedIn();
  const list = TEMPLATES.map(({ id, name, kind, keywords }) => ({ id, name, kind, keywords }));
  const cards = Object.fromEntries(TEMPLATES.map((t) => [t.id, <HeroCard key={t.id} t={t} />]));

  return (
    <main>
      <SiteHeader signedIn={signedIn} overlay />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <div className="hero-art absolute inset-0 -z-10" aria-hidden="true" />
        <div className="hero-fade absolute inset-x-0 bottom-0 -z-10 h-48" aria-hidden="true" />
        <div className="mx-auto flex max-w-[1180px] flex-col items-center px-4 pb-24 pt-[112px] text-center md:px-8 md:pb-32 md:pt-[140px]">
          <p className="glass-pill inline-flex items-center gap-2 rounded-full py-2 pl-3 pr-4 text-[14px]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-gradient font-semibold">Free site at yourname.wintechstudio.com</span>
          </p>
          <h1 className="mt-6 text-[30px] font-semibold leading-[1.04] tracking-[-0.03em] text-ink md:text-[44px]">
            Pick a template.<br className="md:hidden" /> Go live today.
          </h1>
          <div className="mt-8 w-full md:mt-10">
            <TemplateFinder list={list} cards={cards} />
          </div>
        </div>
      </section>

      {/* ── Collection ───────────────────────────────────────── */}
      <section id="collection" className="mx-auto max-w-[1180px] scroll-mt-20 px-4 py-16 md:px-8 md:py-20">
        <SectionHead
          label="Browse the collection"
          title="Start with a design"
          action={<Link href="/templates" className="btn-soft">View all {TEMPLATES.length}</Link>}
        />
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((id) => <GalleryCard key={id} t={getTemplate(id)!} />)}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how" className="bg-soft/50 scroll-mt-20">
        <div className="mx-auto max-w-[1180px] px-4 py-16 md:px-8 md:py-20">
          <SectionHead label="How it works" title="Live in three steps" />
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              [LayoutTemplate, "Pick a template", "Look at every design before you sign up. Or tell Wintech AI about your business and it picks one for you."],
              [MousePointerClick, "Make it yours", "Click any words on the page and type. Change photos, prices, and colour. Or ask Wintech AI to do it."],
              [Rocket, "Publish", "Press Publish and your site is live at yourname.wintechstudio.com. Change it any time."],
            ].map(([Icon, title, body], i) => {
              const I = Icon as typeof LayoutTemplate;
              return (
                <li key={title as string} className="rounded-[20px] bg-card p-6 shadow-[0_0_0_1px_var(--line),0_20px_40px_-34px_rgba(35,39,50,0.45)]">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-accent text-accent-ink"><I className="h-5 w-5" /></span>
                    <span className="text-[13px] font-medium text-mute-2">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-[16px] font-medium tracking-[-0.01em]">{title as string}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-mute">{body as string}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Wintech AI ───────────────────────────────────────── */}
      <section id="ai" className="mx-auto max-w-[1180px] scroll-mt-20 px-4 py-16 md:px-8 md:py-20">
        <SectionHead label="Wintech AI" title="Ask for a change. Approve it. Done.">
          It reads your whole site and shows you what will change. Nothing goes live until you say yes.
        </SectionHead>
        <div className="mx-auto mt-12 max-w-[640px] rounded-[22px] bg-card p-5 shadow-[0_0_0_1px_var(--line),0_40px_80px_-50px_rgba(35,39,50,0.55)]" aria-label="An example conversation with Wintech AI">
          <div className="ml-auto w-fit max-w-[85%] rounded-[16px] rounded-br-[6px] bg-ink px-4 py-2.5 text-[13.5px] text-page">
            Add a question about delivery, and move the reviews above the about section
          </div>
          <div className="mt-3 w-fit max-w-[90%] rounded-[16px] rounded-bl-[6px] bg-soft px-4 py-2.5 text-[13.5px]">
            Added a delivery question and moved the reviews up. Here is what changes:
          </div>
          <div className="mt-2 rounded-[14px] p-3.5 shadow-[0_0_0_1px_var(--line-2)]">
            <p className="text-[11.5px] font-medium uppercase tracking-[0.07em] text-mute-2">Questions</p>
            <p className="mt-0.5 text-[13px] text-mute line-through decoration-line-2">How do I pay?, Can I return something?</p>
            <p className="text-[13px]">How long does delivery take?, How do I pay?, Can I return something?</p>
            <p className="mt-3 text-[11.5px] font-medium uppercase tracking-[0.07em] text-mute-2">Page order</p>
            <p className="mt-0.5 text-[13px] text-mute line-through decoration-line-2">Products → About → Testimonials → Questions</p>
            <p className="text-[13px]">Products → Testimonials → About → Questions</p>
            <span className="btn-primary mt-4 !h-9">Apply to my site</span>
          </div>
        </div>
      </section>

      {/* ── Your address ─────────────────────────────────────── */}
      <section id="domain" className="bg-soft/50 scroll-mt-20">
        <div className="mx-auto max-w-[1180px] px-4 py-24 text-center md:px-8 md:py-28">
          <SectionHead label="Your address" title="Claim your name today">
            Every site gets a free wintechstudio.com address. Search yours now; buying your own .com or .ng opens soon.
          </SectionHead>
          <div className="mt-10"><DomainCheck /></div>
        </div>
      </section>

      {/* ── Brand ────────────────────────────────────────────── */}
      <section id="brand" className="mx-auto max-w-[1180px] scroll-mt-20 px-4 py-16 md:px-8 md:py-20">
        <SectionHead label="Make it yours" title="One colour, everywhere" />
        <div className="mt-12"><BrandDemo /></div>
      </section>

      {/* ── Claude ───────────────────────────────────────────── */}
      <section id="claude" className="bg-soft/50 scroll-mt-20">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-4 py-16 md:px-8 md:py-20 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="text-[15px] font-medium text-label md:text-[18px]">Works with Claude</p>
            <h2 className="mt-1 text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] md:text-[34px]">Run your sites from Claude</h2>
            <p className="mt-4 text-[14px] leading-relaxed text-mute">
              Already use Claude? Get a link from your dashboard and add it to Claude. Then ask Claude to build your site, change a section, or publish it.
            </p>
            <ul className="mx-auto mt-6 flex max-w-[420px] flex-col gap-2.5 text-left text-[14px] lg:mx-0">
              {["Build a site on any template, written for your business", "Change or move what is already there", "Publish only when you say so"].map((t) => (
                <li key={t} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />{t}</li>
              ))}
            </ul>
            <Link href={signedIn ? "/dashboard" : "/signup"} className="btn-primary mt-8"><PlugZap className="h-4 w-4" /> Get your link</Link>
          </div>
          <div className="rounded-[22px] bg-card p-5 shadow-[0_0_0_1px_var(--line),0_40px_80px_-50px_rgba(35,39,50,0.55)]" aria-label="An example of Claude using the Wintech connector">
            <p className="text-[12px] font-medium uppercase tracking-[0.07em] text-mute-2">In a Claude chat</p>
            <div className="ml-auto mt-3 w-fit max-w-[85%] rounded-[16px] rounded-br-[6px] bg-ink px-4 py-2.5 text-[13.5px] text-page">
              Build my bakery a site on Wintech. We are Mama’s Oven in Surulere.
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {["list_templates", "create_site"].map((t) => (
                <span key={t} className="inline-flex w-fit items-center gap-2 rounded-full bg-soft px-3 py-1 text-[12px] text-mute">
                  <Sparkles className="h-3.5 w-3.5 text-accent-2" /> Wintech · {t}
                </span>
              ))}
            </div>
            <div className="mt-3 w-fit max-w-[90%] rounded-[16px] rounded-bl-[6px] bg-soft px-4 py-2.5 text-[13.5px]">
              Done. I used the Food &amp; bakery template and wrote your menu. It is hidden until you publish: mamasoven.wintechstudio.com
            </div>
          </div>
        </div>
      </section>

      {/* ── Questions ────────────────────────────────────────── */}
      <section id="faq" className="mx-auto max-w-[860px] scroll-mt-20 px-4 py-16 md:px-8 md:py-20">
        <SectionHead label="Questions" title="Still wondering?" />
        <div className="mt-10 flex flex-col gap-3">
          {FAQ.map(([q, a], i) => (
            <details key={q} open={i === 0} className="group rounded-[16px] bg-card px-5 shadow-[0_0_0_1px_var(--line)] open:shadow-[0_0_0_1px_var(--line-2),0_20px_40px_-34px_rgba(35,39,50,0.5)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[14px] font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-[17px] font-normal leading-none text-mute transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-5 text-[14px] leading-relaxed text-mute">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <MarketingFooter />
      <CookieNotice />
    </main>
  );
}
