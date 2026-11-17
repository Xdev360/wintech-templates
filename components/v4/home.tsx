"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, Banknote, Briefcase, Check, Cookie, CreditCard, Globe, Heart, Image as ImageIcon,
  LayoutTemplate, Link2, Lock, MessageCircle, Monitor, Minus, Plus, Scissors, Search, Send, Shield, Shirt,
  Smartphone, Sparkles, Truck, Utensils,
} from "lucide-react";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { getTemplate } from "@/lib/templates";
import { Btn, EMAIL, Head, TextLink, WHATSAPP } from "./ui";

const S = 1.5;

/* ── Hero ───────────────────────────────────────────────────────── */

function Claim() {
  const router = useRouter();
  const [name, setName] = useState("");
  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(name.trim() ? `/signup?name=${encodeURIComponent(name.trim())}` : "/signup");
      }}
    >
      <div className="flex gap-2 max-sm:flex-col">
        <label className="input flex flex-1 items-center !px-3">
          <span className="sr-only">Your business name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="yourbusiness"
            className="min-w-0 flex-none bg-transparent text-[15px] outline-none placeholder:text-[var(--v4-m45)]"
            style={{ width: `${(name || "yourbusiness").length + 0.6}ch`, maxWidth: "60%" }}
            autoComplete="organization"
          />
          <span className="min-w-0 truncate text-[15px] text-[var(--v4-m62)]">.wintechstudio.com</span>
        </label>
        <button type="submit" className="btn btn-primary">
          Start free <ArrowRight className="h-4 w-4" strokeWidth={S} />
        </button>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[14px] leading-[21px]">
        <span><b className="font-semibold">Free</b> <span className="muted">plan to start</span></span>
        <span><b className="font-semibold">0%</b> <span className="muted">cut of sales</span></span>
        <span><b className="font-semibold">Paystack</b> <span className="muted">card, transfer, USSD</span></span>
      </div>
    </form>
  );
}

function EditorShot() {
  const food = getTemplate("store-food");
  const sections: [string, typeof LayoutTemplate][] = [
    ["Header", LayoutTemplate], ["Hero", ImageIcon], ["Menu", Cookie], ["Order on WhatsApp", MessageCircle],
    ["Delivery areas", Truck], ["Reviews", Heart], ["Footer", LayoutTemplate],
  ];
  const thread: [boolean, string][] = [
    [true, "Add my delivery areas: Lekki, Ajah and Victoria Island."],
    [false, "Done. I added a Delivery areas section with three zones. Want me to set a fee for each one?"],
    [true, "Change the hero photo to my chin chin packs."],
    [false, "Updated. Your hero now shows the chin chin photo from your uploads."],
  ];
  return (
    <div className="hair flex h-[660px] flex-col overflow-hidden bg-[var(--v4-soft)] max-lg:h-auto" aria-label="The Wintech editor with a sample store">
      <div className="flex h-[52px] items-center justify-between border-b border-[var(--v4-line)] bg-white px-4">
        <div className="flex items-center gap-2.5">
          <span className="whitespace-nowrap text-[14px] font-semibold">Ade Bakes</span>
          <span className="tag max-sm:hidden">Sample store</span>
        </div>
        <div className="hair flex h-8 items-center gap-2 rounded-[2px] bg-[var(--v4-soft)] px-3 text-[13px] font-medium text-[var(--v4-m75)] max-md:hidden">
          <Lock className="h-[14px] w-[14px]" strokeWidth={S} /> adebakes.wintechstudio.com
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="h-[18px] w-[18px] max-sm:hidden" strokeWidth={S} />
          <Smartphone className="h-[18px] w-[18px] max-sm:hidden" strokeWidth={S} />
          <span className="btn btn-secondary btn-sm max-sm:!hidden">Preview</span>
          <span className="btn btn-primary btn-sm">Publish</span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[240px] shrink-0 flex-col border-r border-[var(--v4-line)] bg-white px-2 py-4 max-lg:hidden">
          <p className="eyebrow px-2">Sections</p>
          <div className="h-3" />
          {sections.map(([l, I]) => (
            <div key={l} className={`flex h-9 items-center gap-2.5 rounded-[2px] px-2 text-[14px] font-medium ${l === "Hero" ? "bg-[rgba(10,14,23,0.06)]" : "text-[var(--v4-m75)]"}`}>
              <I className="h-4 w-4" strokeWidth={S} /> {l}
            </div>
          ))}
          <div className="flex-1" />
          <div className="flex h-9 items-center gap-2 rounded-[2px] border border-dashed border-[var(--v4-line)] px-2 text-[14px] font-medium">
            <Plus className="h-4 w-4" strokeWidth={S} /> Add section
          </div>
        </div>
        <div className="flex min-w-0 flex-1 items-start justify-center bg-[var(--v4-panel)] p-7 max-sm:p-4">
          <div className="hair relative w-full max-w-[560px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            {food && (
              <ScaledPreview ratio={560 / 520} initial={560 / 1280}>
                <TemplateSite template={food} />
              </ScaledPreview>
            )}
            <div className="absolute inset-x-[-1px] top-[9.4%] h-[48%] border-2 border-[var(--v4-blue)]" aria-hidden="true" />
            <div className="absolute left-[-1px] top-[calc(9.4%-22px)] flex h-[22px] items-center bg-[var(--v4-blue)] px-2 text-[12px] font-medium text-white" aria-hidden="true">Hero</div>
          </div>
        </div>
        <div className="flex w-[320px] shrink-0 flex-col border-l border-[var(--v4-line)] bg-white max-md:hidden">
          <div className="flex h-12 items-center gap-2 border-b border-[var(--v4-line)] px-4 text-[14px] font-semibold">
            <Sparkles className="h-4 w-4 text-[var(--v4-blue)]" strokeWidth={S} /> AI assistant
          </div>
          <div className="flex flex-col gap-3 p-4">
            {thread.map(([you, text], i) => (
              <div key={i} className="contents">
                <p className={`rounded-[2px] px-3 py-2.5 text-[13px] leading-[19px] ${you ? "w-fit max-w-[260px] bg-[var(--v4-ink)] text-white" : "hair max-w-[260px] bg-[var(--v4-soft)]"}`}>{text}</p>
                {i === 1 && (
                  <div className="flex gap-2">
                    {["Set fees", "Undo"].map((s) => (
                      <span key={s} className="hair flex h-7 items-center rounded-[2px] px-2.5 text-[13px] font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 border-t border-[var(--v4-line)] px-4 py-3">
            <div className="hair flex h-10 min-w-0 flex-1 items-center rounded-[2px] truncate px-3 text-[13px] text-[var(--v4-m45)]">Ask the assistant to change anything</div>
            <span className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-[var(--v4-blue)] text-white"><Send className="h-4 w-4" strokeWidth={S} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const band: [string, typeof Scissors, string][] = [
    ["Salons and beauty", Scissors, "/templates?group=Salons%20and%20beauty"],
    ["Fashion stores", Shirt, "/templates/store-fashion"],
    ["Bakeries", Cookie, "/templates/store-food"],
    ["Restaurants", Utensils, "/templates/booking-restaurant"],
    ["Services", Briefcase, "/templates/booking-consultant"],
  ];
  return (
    <section className="wrap flex flex-col gap-16 pt-[72px] max-md:gap-10 max-md:pt-12">
      <div className="flex items-end gap-16 max-lg:flex-col max-lg:items-start max-lg:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <p className="eyebrow">Website builder for Nigerian businesses</p>
          <h1 className="h1">Build your website.<br />Get paid in naira.</h1>
          <p className="intro max-w-[640px]">
            Templates made for salons, fashion stores, bakeries and restaurants. The AI assistant fills in your words,
            Paystack takes the payments, and we take 0% of your sales.
          </p>
        </div>
        <div className="w-[456px] shrink-0 max-lg:w-full max-lg:max-w-[520px]">
          <Claim />
        </div>
      </div>
      <EditorShot />
      <div className="flex flex-col items-center gap-4 pt-16 max-md:pt-6">
        <p className="text-[14px] text-[var(--v4-m62)]">Built for the businesses that keep Nigeria running</p>
        <div className="grid w-full grid-cols-5 border-y border-[var(--v4-line)] max-md:grid-cols-2">
          {band.map(([l, I, h], i) => (
            <Link key={l} href={h} className={`flex h-[74px] items-center justify-center gap-2.5 text-[16px] font-medium text-[var(--v4-m62)] hover:text-[var(--v4-ink)] ${i < 4 ? "md:border-r" : ""} border-[var(--v4-line)] max-md:border-b max-md:odd:border-r max-md:last:col-span-2 max-md:last:border-b-0`}>
              <I className="h-5 w-5" strokeWidth={S} /> {l}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ──────────────────────────────────────────────── */

export function HowItWorks() {
  const thumbs = ["booking-salon", "store-fashion", "store-food"].map((id) => getTemplate(id)!).filter(Boolean);
  return (
    <section id="how" className="wrap scroll-mt-28 py-[120px] max-md:py-20">
      <Head center eyebrow="How it works" title="Live in three steps" intro="No code and no designer needed. You can change anything later." />
      <div className="hair mt-16 grid md:grid-cols-3">
        <Step n="01" title="Pick a template" text="Choose one made for your kind of business: salons, fashion, food or services.">
          <div className="grid h-full grid-cols-3 items-center gap-2 p-3">
            {thumbs.map((t) => (
              <div key={t.id} className="overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <ScaledPreview ratio={0.78} initial={0.07}><TemplateSite template={t} /></ScaledPreview>
              </div>
            ))}
          </div>
        </Step>
        <Step n="02" title="Make it yours with AI" text="Tell the assistant your name, prices and delivery areas. It writes and edits the pages." mid>
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <span className="rounded-[2px] bg-[var(--v4-ink)] px-3 py-2 text-[13px] text-white">We deliver in Lekki and Ajah</span>
            <span className="hair flex items-center gap-2 rounded-[2px] bg-white px-3 py-2 text-[13px]">
              <Sparkles className="h-[14px] w-[14px] text-[var(--v4-blue)]" strokeWidth={S} /> Added a Delivery areas section
            </span>
          </div>
        </Step>
        <Step n="03" title="Go live and get paid" text="Publish to yourname.wintechstudio.com and take card, transfer or USSD through Paystack.">
          <div className="flex h-full items-center justify-center px-3">
            <div className="hair flex w-full max-w-[300px] items-center gap-3 bg-white p-3">
              <span className="flex h-7 w-7 items-center justify-center bg-[#dcfce7] text-[#15803d]"><Check className="h-4 w-4" strokeWidth={2} /></span>
              <span className="flex-1">
                <span className="block text-[13px] font-semibold">Payment received</span>
                <span className="block text-[12px] text-[var(--v4-m62)]">Sample order · Transfer</span>
              </span>
              <span className="text-[14px] font-semibold">₦18,500</span>
            </div>
          </div>
        </Step>
      </div>
    </section>
  );
}

function Step({ n, title, text, children, mid }: { n: string; title: string; text: string; children: React.ReactNode; mid?: boolean }) {
  return (
    <div className={`flex flex-col gap-4 p-8 max-md:p-6 ${mid ? "md:border-x" : ""} border-[var(--v4-line)] max-md:border-b max-md:last:border-b-0`}>
      <p className="text-[12px] text-[var(--v4-m62)]">{n}</p>
      <div className="h-[200px] bg-[var(--v4-panel)]">{children}</div>
      <p className="mt-2 text-[20px] font-semibold tracking-[-0.01em]">{title}</p>
      <p className="text-[16px] leading-6 text-[var(--v4-m75)]">{text}</p>
    </div>
  );
}

/* ── Template gallery ──────────────────────────────────────────── */

const GALLERY: { id: string; name: string; tag: string; group: string; text: string }[] = [
  { id: "booking-salon", name: "Salon booking", tag: "Salons", group: "Salons", text: "Take bookings and deposits for your salon." },
  { id: "store-fashion", name: "Fashion store", tag: "Fashion", group: "Fashion", text: "Sell your pieces with sizes and checkout." },
  { id: "store-food", name: "Food and bakery", tag: "Bakeries", group: "Bakeries", text: "Menu, order on WhatsApp and delivery areas." },
  { id: "booking-restaurant", name: "Restaurant", tag: "Restaurants", group: "Restaurants", text: "Show your menu and take table bookings." },
  { id: "booking-consultant", name: "Consultant", tag: "Services", group: "Services", text: "Book calls and take payment before the session." },
  { id: "store-skincare", name: "Skincare store", tag: "Beauty", group: "Salons", text: "A clean shop for beauty and self-care products." },
  { id: "landing-business", name: "Business profile", tag: "Services", group: "Services", text: "Your offer, three reasons and a contact form." },
  { id: "portfolio-designer", name: "Designer portfolio", tag: "Portfolio", group: "Portfolios", text: "A case-study grid and a book-a-call button." },
  { id: "portfolio-photographer", name: "Photographer", tag: "Portfolio", group: "Portfolios", text: "Galleries, packages and booking requests." },
  { id: "portfolio-developer", name: "Developer portfolio", tag: "Portfolio", group: "Portfolios", text: "Projects with their stacks and a hire-me form." },
];
const CHIPS = ["All", "Salons", "Fashion", "Bakeries", "Restaurants", "Services", "Portfolios"];

export function TemplateGallery() {
  const [chip, setChip] = useState("All");
  const list = (chip === "All" ? GALLERY.slice(0, 6) : GALLERY.filter((g) => g.group === chip)).slice(0, 6);
  return (
    <section id="templates" className="wrap scroll-mt-28 pb-[120px] max-md:pb-20">
      <Head eyebrow="Templates" title="Made for how you sell" action={<TextLink href="/templates">See all templates</TextLink>} />
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter templates">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={chip === c}
            onClick={() => setChip(c)}
            className={`h-9 rounded-[2px] border px-3.5 text-[14px] ${chip === c ? "border-[var(--v4-ink)] bg-[var(--v4-ink)] text-white" : "border-[var(--v4-line)] hover:border-[var(--v4-line-2)]"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((g) => {
          const t = getTemplate(g.id);
          if (!t) return null;
          return (
            <Link key={g.id} href={`/templates/${g.id}`} className="tcard hair group flex flex-col bg-white transition-colors">
              <span className="relative block p-2 pb-0">
                <span className="relative block overflow-hidden bg-[var(--v4-panel)]">
                  <ScaledPreview ratio={376 / 280} initial={0.29}><TemplateSite template={t} /></ScaledPreview>
                </span>
              </span>
              <span className="flex items-center gap-2 border-b border-[var(--v4-line)] px-4 py-3">
                <span className="text-[16px] font-semibold">{g.name}</span>
                <span className="tag !py-0.5 !text-[13px]">{g.tag}</span>
                <span className="ml-auto text-[13px] text-[var(--v4-m62)]">All plans</span>
              </span>
              <span className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex-1 text-[14px] leading-[21px] text-[var(--v4-m75)]">{g.text}</span>
                <span className="hair flex h-8 w-8 shrink-0 items-center justify-center transition-colors group-hover:border-[var(--v4-ink)] group-hover:bg-[var(--v4-ink)] group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={S} />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ── AI assistant ──────────────────────────────────────────────── */

export function AIAssistant() {
  const points = [
    "Writes your pages from your answers",
    "Edits text, photos, prices and sections on request",
    "Answers customer questions on your site",
    "Runs on AI credits, explained on the pricing page",
  ];
  const chat: [boolean, string][] = [
    [true, "I sell ankara dresses and bags in Ibadan. I deliver across Oyo."],
    [false, "Got it. I picked the Fashion store template, wrote your About page and added Oyo as a delivery area. Want a size guide too?"],
    [true, "Yes, and add a WhatsApp button."],
    [false, "Added both. Customers can now order on WhatsApp from any product."],
  ];
  return (
    <section id="ai" className="wrap grid scroll-mt-28 items-center gap-16 pb-[120px] max-md:pb-20 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <p className="eyebrow">AI assistant</p>
        <h2 className="h2">An assistant that<br className="max-md:hidden" /> builds with you</h2>
        <p className="intro max-w-[560px]">Answer a few questions and it drafts your whole site. After that, ask for changes in plain words.</p>
        <ul className="mt-2 flex flex-col gap-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-3 text-[16px] leading-6 text-[var(--v4-m75)]">
              <Check className="h-4 w-4 shrink-0 text-[var(--v4-ink)]" strokeWidth={S} /> {p}
            </li>
          ))}
        </ul>
        <div className="mt-6"><TextLink href="/help">How the assistant works</TextLink></div>
      </div>
      <div className="flex flex-col gap-4 bg-[var(--v4-soft)] p-10 max-md:p-5">
        {chat.map(([you, text], i) => (
          <p
            key={i}
            className={`flex max-w-[440px] gap-2.5 rounded-[2px] px-4 py-3 text-[14px] leading-[21px] ${you ? "w-fit bg-[var(--v4-ink)] text-white" : "hair bg-white"}`}
          >
            {!you && <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--v4-blue)]" strokeWidth={S} />}
            {text}
          </p>
        ))}
        <p className="flex items-center gap-2 text-[12px] text-[var(--v4-m62)]">
          <Link2 className="h-[14px] w-[14px]" strokeWidth={S} /> Sample chat. Each edit uses AI credits.
        </p>
      </div>
    </section>
  );
}

/* ── Payments ──────────────────────────────────────────────────── */

export function Payments() {
  const [method, setMethod] = useState("Card");
  const lines: [string, string][] = [["Chin chin, 1kg × 2", "₦9,000"], ["Meat pie box of 6", "₦7,500"], ["Delivery, Lekki", "₦2,000"]];
  const methods: [string, typeof CreditCard][] = [["Card", CreditCard], ["Transfer", Banknote], ["USSD", Smartphone]];
  return (
    <section id="payments" className="scroll-mt-28 bg-[var(--v4-soft)] py-[120px] max-md:py-20">
      <div className="wrap grid items-center gap-16 lg:grid-cols-2">
        <div className="hair flex justify-center bg-white p-16 max-md:p-5 max-lg:order-2">
          <div className="w-full max-w-[332px] border border-[var(--v4-line-2)] p-6 max-md:p-4">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-semibold">Your order</p>
              <span className="tag !text-[13px]">Sample order</span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {lines.map(([a, b]) => (
                <p key={a} className="flex justify-between text-[13px] text-[var(--v4-m75)]"><span>{a}</span><span className="text-[var(--v4-ink)]">{b}</span></p>
              ))}
            </div>
            <p className="mt-4 flex justify-between border-t border-[var(--v4-line)] pt-4 text-[14px] font-semibold"><span>Total</span><span>₦18,500</span></p>
            <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
              {methods.map(([m, I]) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={method === m}
                  onClick={() => setMethod(m)}
                  className={`flex h-10 items-center justify-center gap-2 rounded-[2px] border text-[13px] ${method === m ? "border-[var(--v4-ink)]" : "border-[var(--v4-line)]"}`}
                >
                  <I className="h-4 w-4" strokeWidth={S} /> {m}
                </button>
              ))}
            </div>
            <div className="btn btn-primary mt-3 w-full">Pay ₦18,500</div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[var(--v4-m62)]">
              <Shield className="h-[13px] w-[13px]" strokeWidth={S} /> Secured by Paystack
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <p className="eyebrow">Payments</p>
          <h2 className="h2">Get paid with<br className="max-md:hidden" /> Paystack</h2>
          <p className="intro max-w-[560px]">
            Customers pay by card, bank transfer or USSD. Paystack sends the money to your bank account. We take 0% of your sales.
          </p>
          <div className="hair mt-3 grid grid-cols-3 bg-white">
            {[["0%", "Wintech cut of sales"], ["3 ways", "Card, transfer, USSD"], ["₦", "Prices in naira"]].map(([a, b], i) => (
              <div key={a} className={`flex flex-col gap-1 p-5 max-md:p-3 ${i ? "border-l border-[var(--v4-line)]" : ""}`}>
                <span className="text-[28px] font-semibold tracking-[-0.02em] max-md:text-[22px]">{a}</span>
                <span className="text-[13px] text-[var(--v4-m62)]">{b}</span>
              </div>
            ))}
          </div>
          <div className="mt-4"><TextLink href="/help">Payments setup guide</TextLink></div>
        </div>
      </div>
    </section>
  );
}

/* ── Domains ───────────────────────────────────────────────────── */

export function Domains() {
  const router = useRouter();
  const [q, setQ] = useState("adebakes");
  const name = q.toLowerCase().replace(/[^a-z0-9-]/g, "") || "adebakes";
  return (
    <section className="wrap py-[120px] max-md:py-20">
      <Head center eyebrow="Domains" title="Your own web address" intro="Every site gets a free yourname.wintechstudio.com address. On paid plans you can connect a domain you own or buy a new one." />
      <div className="hair mx-auto mt-14 max-w-[760px]">
        <form
          className="flex gap-2 border-b border-[var(--v4-line)] p-4 max-sm:p-3"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/domains?q=${encodeURIComponent(name)}`);
          }}
        >
          <label className="input flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-[var(--v4-m62)]" strokeWidth={S} />
            <span className="sr-only">Search for a domain</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent text-[15px] outline-none" />
          </label>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <Row icon={Globe} name={`${name}.wintechstudio.com`} tag={<span className="tag tag-sm tag-blue">Free on every plan</span>} end={<span className="text-[13px] text-[var(--v4-m62)]">Included</span>} />
        <Row icon={Globe} name={`${name}.com.ng`} tag={<span className="tag tag-sm">Available</span>} end={<Link href="/domains" className="btn btn-outline btn-sm !h-8">Buy</Link>} />
        <Row icon={Globe} name={`${name}.ng`} tag={<span className="tag tag-sm">Available</span>} end={<Link href="/domains" className="btn btn-outline btn-sm !h-8">Buy</Link>} />
        <Row icon={Link2} name="Already have a domain?" tag={<span className="tag tag-sm">Starter and up</span>} end={<Link href="/help/connect-your-domain" className="btn btn-outline btn-sm !h-8">Connect</Link>} last />
      </div>
      <p className="mt-8 text-center text-[12px] text-[var(--v4-m62)]">Sample search. Domain prices show at checkout.</p>
    </section>
  );
}

function Row({ icon: I, name, tag, end, last }: { icon: typeof Globe; name: string; tag: React.ReactNode; end: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex min-h-[60px] items-center gap-3 px-4 py-2 ${last ? "" : "border-b border-[var(--v4-line)]"}`}>
      <I className="h-4 w-4 shrink-0" strokeWidth={S} />
      <span className="truncate text-[15px] font-medium max-sm:text-[14px]">{name}</span>
      <span className="max-sm:hidden">{tag}</span>
      <span className="ml-auto">{end}</span>
    </div>
  );
}

/* ── Pricing ───────────────────────────────────────────────────── */

export const PLANS = [
  { name: "Free", ngn: "₦0", usd: "$0", note: "Try everything on a free address.", cta: "Start free", feats: ["1 site on name.wintechstudio.com", "30 AI credits", "50 reply drafts a month", "Wintech badge on your site"] },
  { name: "Starter", ngn: "₦6,000", usd: "$4", note: "Your own web address, plus orders.", cta: "Start with Starter", feats: ["Your own domain", "150 AI credits", "Orders and receipts", "300 reply drafts a month"] },
  { name: "Grow", ngn: "₦15,000", usd: "$10", note: "More sites, more credits, weekly reports.", cta: "Start with Grow", feats: ["3 sites, 300 AI credits", "Weekly report", "Mobile manager", "Premium store templates 20% off"], best: true },
  { name: "Business", ngn: "₦37,500", usd: "$25", note: "For teams running several sites.", cta: "Start with Business", feats: ["10 sites, 1,000 AI credits", "Team seats", "Priority help on WhatsApp", "0% cut of sales"] },
];

export function PlanCards({ cur }: { cur: "NGN" | "USD" }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((p) => (
        <div key={p.name} className={`flex flex-col p-6 ${p.best ? "border border-[var(--v4-ink)] bg-[var(--v4-soft)]" : "hair bg-white"}`}>
          <div className="flex items-center justify-between">
            <p className="text-[20px] font-semibold">{p.name}</p>
            {p.best && <span className="tag tag-sm tag-warm">Recommended</span>}
          </div>
          <p className="mt-5 flex items-baseline gap-1.5">
            <span className="text-[40px] font-semibold leading-none tracking-[-0.02em]">{cur === "NGN" ? p.ngn : p.usd}</span>
            <span className="text-[14px] text-[var(--v4-m62)]">/ month</span>
          </p>
          <p className="mt-2 text-[12px] text-[var(--v4-m62)]">{cur === "NGN" ? `${p.usd} per month` : `${p.ngn} per month`}</p>
          <p className="mt-6 min-h-[42px] text-[15px] leading-[21px] text-[var(--v4-m75)]">{p.note}</p>
          <Link href={`/signup?plan=${p.name.toLowerCase()}`} className={`btn mt-4 w-full ${p.best ? "btn-primary" : "btn-secondary"}`}>{p.cta}</Link>
          <ul className="mt-6 flex flex-col gap-3 border-t border-[var(--v4-line)] pt-6">
            {p.feats.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] leading-5 text-[var(--v4-m75)]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--v4-ink)]" strokeWidth={S} /> {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function CurrencyToggle({ cur, setCur }: { cur: "NGN" | "USD"; setCur: (c: "NGN" | "USD") => void }) {
  return (
    <div className="hair inline-flex p-[3px]" role="radiogroup" aria-label="Currency">
      {(["NGN", "USD"] as const).map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={cur === c}
          onClick={() => setCur(c)}
          className={`h-7 rounded-[2px] px-3 text-[13px] ${cur === c ? "bg-[var(--v4-ink)] text-white" : "text-[var(--v4-m75)]"}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export function PricingTeaser() {
  const [cur, setCur] = useState<"NGN" | "USD">("NGN");
  return (
    <section className="border-t border-[var(--v4-line)] py-[120px] max-md:py-20">
      <div className="wrap">
        <Head center eyebrow="Pricing" title="Simple plans, 0% cut" intro="Start free. Upgrade when you want your own domain, more products or more AI credits." />
        <div className="mt-10 flex justify-center"><CurrencyToggle cur={cur} setCur={setCur} /></div>
        <div className="mt-10"><PlanCards cur={cur} /></div>
        <div className="mt-12 flex justify-center"><TextLink href="/pricing">Compare all plans</TextLink></div>
      </div>
    </section>
  );
}

/* ── FAQ ───────────────────────────────────────────────────────── */

export const HOME_FAQ: [string, string][] = [
  ["Do you take a cut of my sales?", "No. Wintech takes 0% of your sales on every plan. Paystack charges its normal processing fee and pays you directly."],
  ["Can I use my own domain?", "Yes, on Starter and up. Connect a domain you already own or buy a new one. Every site also keeps its free yourname.wintechstudio.com address."],
  ["How do customers pay?", "By card, bank transfer or USSD through Paystack. The money goes straight to your bank account."],
  ["What are AI credits?", "Each request to the AI assistant uses a few credits. Every plan includes some each month, and you can top up when you need more."],
  ["Do I need a laptop?", "No. You can build your site, add products and take orders from your phone."],
];

export function Faq({ items = HOME_FAQ }: { items?: [string, string][] }) {
  return (
    <section className="wrap grid gap-16 py-[120px] max-md:gap-10 max-md:py-20 lg:grid-cols-[1fr_1.2fr]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2s">Questions, answered</h2>
        </div>
        <div className="flex flex-col gap-3 bg-[var(--v4-soft)] p-6">
          <p className="h3">Still unsure?</p>
          <p className="text-[16px] leading-6 text-[var(--v4-m75)]">Message us on WhatsApp and a real person from Wintech will help you choose.</p>
          <Btn href={WHATSAPP} size="sm" className="mt-2 w-fit">Chat on WhatsApp</Btn>
          <p className="text-[13px] text-[var(--v4-m75)]">
            Or email us <a href={`mailto:${EMAIL}`} className="font-semibold text-[var(--v4-ink)] underline underline-offset-2">{EMAIL}</a>
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {items.map(([q, a], i) => (
          <details key={q} open={i === 0} className="bg-[var(--v4-soft)]">
            <summary className="flex items-center gap-4 px-5 py-5 text-[16px] font-medium">
              <span className="hair flex h-6 w-6 shrink-0 items-center justify-center bg-white">
                <Plus className="faq-plus h-[14px] w-[14px]" strokeWidth={S} />
                <Minus className="faq-minus h-[14px] w-[14px]" strokeWidth={S} />
              </span>
              {q}
            </summary>
            <p className="px-5 pb-6 pl-[60px] text-[15px] leading-[22px] text-[var(--v4-m75)]">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
