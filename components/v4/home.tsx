"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Banknote, Briefcase, Check, Cookie, CreditCard, Globe, Heart, Image as ImageIcon,
  LayoutTemplate, Link2, Lock, MessageCircle, Monitor, Minus, Plus, Scissors, Search, Send, Shield, Shirt,
  Smartphone, Sparkles, Truck, Utensils,
} from "lucide-react";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { getTemplate } from "@/lib/templates";
import { Mascot } from "./Mascot";
import { Btn, EMAIL, Head, TextLink, WHATSAPP } from "./ui";

const S = 1.5;

/* ── Hero (v5, Figma "00 · v5 changes") ───────────────────────────
   Centred heading at a calmer size, the claim box, then the product
   card rising out from under the header. Inside the card Wintech AI
   works in a loop: the owner asks, the AI types, the reply lands, the
   blue outline moves to the section it changed, and an order toast
   pops in every few seconds. Reduced motion shows the resting state. */

function Claim() {
  const router = useRouter();
  const [name, setName] = useState("");
  return (
    <form
      className="mx-auto flex w-full max-w-[520px] flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(name.trim() ? `/create?name=${encodeURIComponent(name.trim())}` : "/create");
      }}
    >
      <div className="flex gap-2 max-sm:flex-col">
        <label className="input flex flex-1 items-center !px-3 !h-11 bg-white">
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
        <button type="submit" className="btn btn-primary !h-11">
          Start free <ArrowRight className="h-4 w-4" strokeWidth={S} />
        </button>
      </div>
      <p className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[13px] leading-5 text-[var(--v4-m62)]">
        <span>Free plan to start</span><span aria-hidden="true">·</span>
        <span>0% cut of your sales</span><span aria-hidden="true">·</span>
        <span>WhatsApp orders built in</span>
      </p>
    </form>
  );
}

type Beat = { ask: string; reply: string; section: string };
const BEATS: Beat[] = [
  { ask: "Add my delivery areas: Lekki, Ajah and VI.", reply: "Done. I added a Delivery areas section with three zones.", section: "Delivery areas" },
  { ask: "Make the hero say we bake fresh every morning.", reply: "Updated. Your hero now reads: Fresh from our oven every morning.", section: "Hero" },
  { ask: "Put a WhatsApp order button under the menu.", reply: "Added. Customers can now order your menu on WhatsApp.", section: "Order on WhatsApp" },
];
const TOASTS: [string, string][] = [
  ["New order", "₦18,500 · via WhatsApp"],
  ["New enquiry", "Do you deliver to Yaba on Sunday?"],
  ["Payment confirmed", "WT-K4M2QP · ₦9,000 transfer"],
];
/* Where the blue outline sits on the preview, as % of its height. */
const SPOTS: Record<string, [number, number]> = {
  Hero: [9.4, 46],
  "Delivery areas": [57, 30],
  "Order on WhatsApp": [44, 18],
};

function useLoop(still: boolean) {
  /* phase: 0 asking, 1 typing, 2 replied */
  const [beat, setBeat] = useState(0);
  const [phase, setPhase] = useState(still ? 2 : 0);
  const [toast, setToast] = useState(-1);
  useEffect(() => {
    if (still) return;
    const wait = phase === 0 ? 1100 : phase === 1 ? 1500 : 3600;
    const t = setTimeout(() => {
      if (phase < 2) setPhase(phase + 1);
      else { setBeat((b) => (b + 1) % BEATS.length); setPhase(0); }
    }, wait);
    return () => clearTimeout(t);
  }, [phase, still]);
  useEffect(() => {
    if (still) return;
    const first = setTimeout(() => setToast(0), 2600);
    const every = setInterval(() => setToast((n) => (n + 1) % TOASTS.length), 6000);
    return () => { clearTimeout(first); clearInterval(every); };
  }, [still]);
  return { beat, phase, toast };
}

function ProductCard() {
  const food = getTemplate("store-food");
  const [still, setStill] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setStill(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  const { beat, phase, toast } = useLoop(still);
  const b = BEATS[beat];
  const done = phase === 2;
  const prev = BEATS[(beat + BEATS.length - 1) % BEATS.length];
  const shown = done ? b.section : prev.section;
  const [top, h] = SPOTS[shown] ?? SPOTS.Hero;
  const sections: [string, typeof LayoutTemplate][] = [
    ["Header", LayoutTemplate], ["Hero", ImageIcon], ["Menu", Cookie], ["Order on WhatsApp", MessageCircle],
    ["Delivery areas", Truck], ["Reviews", Heart], ["Footer", LayoutTemplate],
  ];
  const [tilt, setTilt] = useState<[number, number]>([0, 0]);

  return (
    <div
      className="hero-card relative [perspective:1600px]"
      onMouseMove={(e) => {
        if (still) return;
        const r = e.currentTarget.getBoundingClientRect();
        setTilt([((e.clientY - r.top) / r.height - 0.5) * -2, ((e.clientX - r.left) / r.width - 0.5) * 2]);
      }}
      onMouseLeave={() => setTilt([0, 0])}
    >
      <div
        className="hair flex h-[600px] flex-col overflow-hidden bg-[var(--v4-soft)] shadow-[0_40px_80px_-40px_rgba(10,14,23,0.35)] transition-transform duration-300 ease-out max-lg:h-auto"
        style={{ transform: `rotateX(${tilt[0]}deg) rotateY(${tilt[1]}deg)` }}
        aria-label="The Wintech editor with a sample store, while Wintech AI makes changes"
      >
        <div className="flex h-[52px] items-center justify-between border-b border-[var(--v4-line)] bg-white px-4">
          <div className="flex items-center gap-2.5">
            <span className="whitespace-nowrap text-[14px] font-semibold">Ade Bakes</span>
            <span className="tag tag-sm max-sm:hidden">Sample store</span>
          </div>
          <div className="hair flex h-8 items-center gap-2 rounded-[2px] bg-[var(--v4-soft)] px-3 text-[13px] font-medium text-[var(--v4-m75)] max-md:hidden">
            <Lock className="h-[14px] w-[14px]" strokeWidth={S} /> adebakes.wintechstudio.com
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="h-[18px] w-[18px] max-sm:hidden" strokeWidth={S} />
            <Smartphone className="h-[18px] w-[18px] max-sm:hidden" strokeWidth={S} />
            <span className="btn btn-primary btn-sm">Publish</span>
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="flex w-[220px] shrink-0 flex-col border-r border-[var(--v4-line)] bg-white px-2 py-4 max-lg:hidden">
            <p className="eyebrow px-2">Sections</p>
            <div className="h-3" />
            {sections.map(([l, I]) => (
              <div key={l} className={`flex h-9 items-center gap-2.5 rounded-[2px] px-2 text-[14px] font-medium transition-colors duration-300 ${l === shown ? "bg-[rgba(59,91,255,0.08)] text-[var(--v4-ink)]" : "text-[var(--v4-m75)]"}`}>
                <I className={`h-4 w-4 ${l === shown ? "text-[var(--v4-blue)]" : ""}`} strokeWidth={S} /> {l}
              </div>
            ))}
          </div>
          <div className="relative flex min-w-0 flex-1 items-start justify-center bg-[var(--v4-panel)] p-7 max-sm:p-4">
            <div className={`hair relative w-full max-w-[540px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${phase === 1 ? "build-shimmer" : ""}`}>
              {food && (
                <ScaledPreview ratio={540 / 500} initial={540 / 1280}>
                  <TemplateSite template={food} />
                </ScaledPreview>
              )}
              <div className="absolute inset-x-[-1px] border-2 border-[var(--v4-blue)] transition-all duration-500 ease-out" style={{ top: `${top}%`, height: `${h}%` }} aria-hidden="true">
                <span className="absolute left-[-2px] top-[-22px] flex h-[22px] items-center bg-[var(--v4-blue)] px-2 text-[12px] font-medium text-white">{shown}</span>
              </div>
            </div>
            {toast >= 0 && (
              <div key={toast} className="toast-in absolute bottom-5 left-5 flex items-center gap-3 bg-[var(--v4-ink)] px-3.5 py-2.5 text-white shadow-[0_12px_30px_-10px_rgba(10,14,23,0.5)]" role="status">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#22c55e]"><Check className="h-3.5 w-3.5" strokeWidth={2.5} /></span>
                <span className="text-[13px] leading-[18px]"><b className="block font-semibold">{TOASTS[toast][0]}</b><span className="text-white/70">{TOASTS[toast][1]}</span></span>
              </div>
            )}
          </div>
          <div className="flex w-[300px] shrink-0 flex-col border-l border-[var(--v4-line)] bg-white max-md:hidden">
            <div className="flex h-12 items-center gap-2 border-b border-[var(--v4-line)] px-4 text-[14px] font-semibold">
              <Mascot eyes={phase === 1 ? (beat % 2 ? "left" : "right") : done ? "happy" : "open"} size={22} /> Wintech AI
              <span className={`ml-auto flex items-center gap-1.5 text-[12px] font-normal ${phase === 1 ? "text-[var(--v4-blue)]" : "text-[var(--v4-m62)]"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${phase === 1 ? "bg-[var(--v4-blue)] live-dot !bg-[var(--v4-blue)]" : "bg-[#22c55e]"}`} />
                {phase === 1 ? "Working" : "Ready"}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
              <p key={`a${beat}`} className="msg-in w-fit max-w-[250px] self-end rounded-[2px] bg-[var(--v4-ink)] px-3 py-2.5 text-[13px] leading-[19px] text-white">{b.ask}</p>
              {phase === 1 && (
                <div className="msg-in flex w-fit items-center gap-2 rounded-[2px] bg-[rgba(59,91,255,0.08)] px-3 py-2.5 text-[13px] text-[var(--v4-m75)]">
                  <span className="typing" aria-hidden="true"><i /><i /><i /></span> Changing {b.section.toLowerCase()}
                </div>
              )}
              {done && (
                <>
                  <p key={`r${beat}`} className="msg-in hair max-w-[250px] rounded-[2px] bg-[var(--v4-soft)] px-3 py-2.5 text-[13px] leading-[19px]">{b.reply}</p>
                  <div className="msg-in flex gap-2" style={{ animationDelay: "120ms" }}>
                    {["Looks good", "Undo"].map((x) => <span key={x} className="hair flex h-7 items-center rounded-[2px] px-2.5 text-[13px] font-medium">{x}</span>)}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-[var(--v4-line)] px-4 py-3">
              <div className="hair flex h-10 min-w-0 flex-1 items-center truncate rounded-[2px] px-3 text-[13px] text-[var(--v4-m45)]">Ask Wintech AI to change anything</div>
              <span className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-[var(--v4-blue)] text-white"><Send className="h-4 w-4" strokeWidth={S} /></span>
            </div>
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
    <section className="wrap flex flex-col gap-14 pt-[72px] max-md:gap-10 max-md:pt-12">
      <div className="mx-auto flex max-w-[760px] flex-col items-center gap-5 text-center">
        <p className="eyebrow rise" style={{ animationDelay: "0ms" }}>Website builder for Nigerian businesses</p>
        <h1 className="h1-hero rise" style={{ animationDelay: "60ms" }}>A website that brings<br className="max-sm:hidden" /> you customers.</h1>
        <p className="intro rise max-w-[600px]" style={{ animationDelay: "120ms" }}>
          Pick a template made for your business. Wintech AI writes the words, you add your prices, and you are live today.
        </p>
        <div className="rise mt-3 w-full" style={{ animationDelay: "180ms" }}><Claim /></div>
      </div>
      <div className="card-rise"><ProductCard /></div>
      <div className="flex flex-col items-center gap-4 pt-10 max-md:pt-4">
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
        <Step n="03" title="Go live and get paid" text="Publish to yourname.wintechstudio.com. Customers order on your site or on WhatsApp and pay by bank transfer.">
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
  const [method, setMethod] = useState("Transfer");
  const lines: [string, string][] = [["Chin chin, 1kg × 2", "₦9,000"], ["Meat pie box of 6", "₦7,500"], ["Delivery, Lekki", "₦2,000"]];
  const methods: [string, typeof CreditCard][] = [["Transfer", Banknote], ["WhatsApp", MessageCircle]];
  return (
    <section id="payments" className="scroll-mt-28 bg-dots py-[120px] max-md:py-20">
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
            <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="How to order">
              {methods.map(([m, I]) => (
                <button key={m} type="button" role="radio" aria-checked={method === m} onClick={() => setMethod(m)}
                  className={`flex h-10 items-center justify-center gap-2 rounded-[2px] border text-[13px] ${method === m ? "border-[var(--v4-ink)]" : "border-[var(--v4-line)]"}`}>
                  <I className="h-4 w-4" strokeWidth={S} /> {m}
                </button>
              ))}
            </div>
            {method === "Transfer" ? (
              <div key="t" className="msg-in mt-3 bg-[var(--v4-soft)] p-3 text-[13px] leading-5">
                <p className="text-[var(--v4-m62)]">Pay into</p>
                <p className="font-medium">Ade Bakes · your bank account</p>
                <p className="text-[var(--v4-m62)]">Reference WT-K4M2QP</p>
              </div>
            ) : (
              <p key="w" className="msg-in mt-3 bg-[var(--v4-soft)] p-3 text-[13px] leading-5 text-[var(--v4-m75)]">The order opens in WhatsApp with every item and the total filled in.</p>
            )}
            <div className="btn btn-primary mt-3 w-full">{method === "Transfer" ? "I have paid ₦18,500" : "Send order on WhatsApp"}</div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[var(--v4-m62)]">
              <Shield className="h-[13px] w-[13px]" strokeWidth={S} /> You confirm it in your dashboard
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <p className="eyebrow">Orders and payments</p>
          <h2 className="h2">Orders come to you.<br className="max-md:hidden" /> Money goes to your bank.</h2>
          <p className="intro max-w-[560px]">
            Customers order on your site or on WhatsApp and pay by transfer straight into your account. You see each order, check your bank, and confirm. We take 0% of your sales.
          </p>
          <div className="hair mt-3 grid grid-cols-3 bg-white">
            {[["0%", "Wintech cut of sales"], ["2 ways", "Transfer or WhatsApp"], ["₦", "Prices in naira"]].map(([a, b], i) => (
              <div key={a} className={`flex flex-col gap-1 p-5 max-md:p-3 ${i ? "border-l border-[var(--v4-line)]" : ""}`}>
                <span className="text-[28px] font-semibold tracking-[-0.02em] max-md:text-[22px]">{a}</span>
                <span className="text-[13px] text-[var(--v4-m62)]">{b}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-[var(--v4-m62)]">Card and USSD checkout are coming later.</p>
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
          <Link href="/create" className={`btn mt-4 w-full ${p.best ? "btn-primary" : "btn-secondary"}`}>{p.cta}</Link>
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
  ["Do you take a cut of my sales?", "No. Wintech takes 0% of your sales on every plan. Customers pay you straight into your own bank account."],
  ["Can I use my own domain?", "Yes, on Starter and up. Connect a domain you already own or buy a new one. Every site also keeps its free yourname.wintechstudio.com address."],
  ["How do customers pay?", "By bank transfer to your account, with the order details sent to you and on WhatsApp. You confirm each payment in your dashboard. Card checkout is coming later."],
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
