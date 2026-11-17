"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Calendar, Camera, Check, CheckCircle2, ChevronDown, ChevronRight, Copy, Download, Globe, Image as ImageIcon,
  Loader2, Send, ShoppingBag, Sparkles, Ticket, Utensils, X,
} from "lucide-react";
import { createSite, setPublished } from "@/app/actions/sites";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { ROOT_DOMAIN } from "@/lib/config";
import { normalizeSlug } from "@/lib/slugs";
import { createClient } from "@/lib/supabase/client";
import { getTemplate } from "@/lib/templates";
import { CATALOG } from "./catalog";
import { Mascot, MascotSays, type Eyes } from "./Mascot";
import { Mark } from "./ui";

/* ──────────────────────────────────────────────────────────────
   Create your first site (Figma page 24, CS1 to CS5).
   Type → details → template or Wintech AI → building → ready.
   The template path creates the site straight away. The AI path calls
   /api/build-site, which writes the whole site and costs credits.
   ────────────────────────────────────────────────────────────── */

type TypeId = "store" | "digital" | "booking" | "portfolio" | "restaurant" | "events";
const TYPES: { id: TypeId; label: string; text: string; eg: string; icon: typeof ShoppingBag; templates: string[] }[] = [
  { id: "store", label: "Store", text: "Sell physical products with delivery and pickup across Nigeria.", eg: "Skincare, fashion, gadgets", icon: ShoppingBag, templates: ["store-skincare", "store-fashion", "store-food"] },
  { id: "digital", label: "Digital products", text: "Sell files, courses and presets. Buyers download right after paying.", eg: "Ebooks, presets, courses", icon: Download, templates: ["landing-waitlist", "landing-business"] },
  { id: "booking", label: "Bookings and services", text: "Take appointments and deposits for the work you do.", eg: "Salons, clinics, consultants", icon: Calendar, templates: ["booking-salon", "booking-consultant"] },
  { id: "portfolio", label: "Portfolio", text: "Show your projects with videos and pictures. Get enquiries.", eg: "Photographers, designers, artists", icon: ImageIcon, templates: ["portfolio-photographer", "portfolio-designer", "portfolio-developer"] },
  { id: "restaurant", label: "Restaurant", text: "Menu, live orders and delivery zones for food businesses.", eg: "Restaurants, bakeries, caterers", icon: Utensils, templates: ["booking-restaurant", "store-food"] },
  { id: "events", label: "Events", text: "Sell tickets, manage guests and check people in at the door.", eg: "Parties, conferences, classes", icon: Ticket, templates: ["landing-event"] },
];
const SELLS = ["Skincare and beauty", "Fashion and clothing", "Food and drinks", "Hair and beauty services", "Gadgets and electronics", "Home and furniture", "Courses and digital files", "Events and tickets", "Professional services", "Something else"];
const PLACES = ["Lekki, Lagos", "Ikeja, Lagos", "Victoria Island, Lagos", "Yaba, Lagos", "Abuja", "Port Harcourt", "Ibadan", "Ilorin", "Kano", "Enugu", "Benin City", "Somewhere else"];
const STEPS = ["Type", "Details", "Template", "Build"];

const BOX = "h-10 w-full rounded-[2px] border border-[rgba(10,14,23,0.1)] bg-white px-3 text-[15px] outline-none focus:border-[#3b5bff] focus:shadow-[0_0_0_3px_rgba(59,91,255,0.15)]";

export function CreateSite({ initialTemplate = "", initialName = "" }: { initialTemplate?: string; initialName?: string }) {
  const router = useRouter();
  const preType = TYPES.find((t) => t.templates.includes(initialTemplate))?.id ?? "store";
  const [step, setStep] = useState(initialTemplate ? 1 : 0);
  const [type, setType] = useState<TypeId>(preType);
  const [name, setName] = useState(initialName);
  const [ig, setIg] = useState("");
  const [sells, setSells] = useState(SELLS[0]);
  const [place, setPlace] = useState(PLACES[0]);
  const [pick, setPick] = useState<string>(initialTemplate || "ai");
  const [error, setError] = useState("");
  const [built, setBuilt] = useState<{ id: string; slug: string; name: string } | null>(null);
  const T = TYPES.find((t) => t.id === type)!;

  return (
    <div className="v4 bg-grid min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--v4-line)] bg-white">
        <div className="flex h-16 items-center justify-between px-10 max-md:px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="Wintech Templates dashboard">
            <Mark className="h-[17px] w-[25px]" />
            <span className="text-[18px] font-semibold tracking-[-0.02em] max-sm:hidden">Wintech <span className="font-medium text-[#8a93a6]">Templates</span></span>
          </Link>
          <ol className="flex items-center gap-3 text-[13px] max-md:hidden">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className={`flex items-center gap-2 ${i <= step ? "text-[var(--v4-ink)]" : "text-[var(--v4-m62)]"}`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${i < step ? "bg-[var(--v4-blue)] text-white" : i === step ? "bg-[var(--v4-ink)] text-white" : "border border-[var(--v4-line-2)]"}`}>
                    {i < step ? <Check className="h-3 w-3" strokeWidth={2.5} /> : i + 1}
                  </span>
                  {s}
                </span>
                {i < STEPS.length - 1 && <span className="h-px w-8 bg-[var(--v4-line-2)]" />}
              </li>
            ))}
          </ol>
          <Link href="/dashboard" className="flex items-center gap-2 text-[14px] font-medium">Save and exit <X className="h-4 w-4" strokeWidth={1.5} /></Link>
        </div>
        <div className="h-[2px] bg-[var(--v4-panel)]"><div className="h-full bg-[var(--v4-blue)] transition-[width] duration-500" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      </header>

      <main className="mx-auto max-w-[960px] px-6 pb-20 pt-14 max-md:px-4 max-md:pt-8">
        {step === 0 && (
          <section>
            <h1 className="text-[40px] font-semibold tracking-[-0.02em] max-md:text-[30px]">What are you building?</h1>
            <p className="mt-2 text-[16px] text-[var(--v4-m75)]">Pick the closest fit. One account can run several sites of different types.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Site type">
              {TYPES.map((t) => {
                const on = t.id === type;
                return (
                  <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => setType(t.id)}
                    className={`relative flex flex-col items-start gap-2 border p-5 text-left transition-colors ${on ? "border-[var(--v4-blue)] bg-[rgba(59,91,255,0.05)]" : "border-[var(--v4-line)] hover:border-[var(--v4-line-2)]"}`}>
                    <span className="hair flex h-9 w-9 items-center justify-center bg-white"><t.icon className="h-4 w-4" strokeWidth={1.5} /></span>
                    <span className={`absolute right-5 top-5 flex h-5 w-5 items-center justify-center rounded-full ${on ? "bg-[var(--v4-blue)] text-white" : "border border-[var(--v4-line-2)]"}`}>{on && <Check className="h-3 w-3" strokeWidth={2.5} />}</span>
                    <span className="mt-3 text-[17px] font-semibold">{t.label}</span>
                    <span className="text-[14px] leading-[21px] text-[var(--v4-m75)]">{t.text}</span>
                    <span className="mt-2 text-[12px] text-[var(--v4-m62)]">{t.eg}</span>
                  </button>
                );
              })}
            </div>
            <Footer note={`${T.label} selected`} onNext={() => setStep(1)} />
          </section>
        )}

        {step === 1 && (
          <section>
            <h1 className="text-[40px] font-semibold tracking-[-0.02em] max-md:text-[30px]">Tell us about your business</h1>
            <p className="mt-2 text-[16px] text-[var(--v4-m75)]">Two quick things. Wintech AI does the rest.</p>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
              <div className="flex flex-col gap-5">
                <label className="flex flex-col gap-2"><span className="text-[14px] font-medium">Business name</span>
                  <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Glow Skincare" className={BOX} /></label>
                <label className="flex flex-col gap-2"><span className="text-[14px] font-medium">Instagram link <span className="font-normal text-[var(--v4-m62)]">(optional)</span></span>
                  <input value={ig} onChange={(e) => setIg(e.target.value)} placeholder="instagram.com/yourbusiness" className={BOX} /></label>
                <p className="flex gap-3 bg-[rgba(59,91,255,0.06)] p-4 text-[14px] leading-[21px] text-[var(--v4-m75)]">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--v4-blue)]" strokeWidth={1.5} />
                  Wintech AI uses your business name, what you sell and where you are to write your site. Your Instagram handle goes on the site so customers can find you. Nothing is posted to Instagram.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="What do you sell?" value={sells} set={setSells} options={SELLS} />
                  <Select label="Where are you based?" value={place} set={setPlace} options={PLACES} />
                </div>
              </div>
              <aside className="hair flex flex-col gap-4 bg-white p-5">
                <p className="eyebrow">Your site will start with</p>
                <div className="flex items-center gap-3">
                  <span className="hair flex h-10 w-10 items-center justify-center"><Camera className="h-4 w-4" strokeWidth={1.5} /></span>
                  <span>
                    <span className="block text-[15px] font-semibold">{name || "Your business name"}</span>
                    <span className="block text-[13px] text-[var(--v4-m62)]">{sells} · {place}</span>
                  </span>
                </div>
                <ul className="flex flex-col gap-2 text-[14px] text-[var(--v4-m75)]">
                  {[`A ${T.label.toLowerCase()} layout made for phones`, `Your address: ${normalizeSlug(name) || "yourname"}.${ROOT_DOMAIN}`, ig ? `A link to ${ig.replace(/^https?:\/\/(www\.)?/, "")}` : "Your Instagram link, if you add it", "Words you can change any time"].map((x) => (
                    <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#15803d]" strokeWidth={1.5} /> <span className="min-w-0 break-words">{x}</span></li>
                  ))}
                </ul>
                <p className="text-[12px] text-[var(--v4-m62)]">Hidden until you press Publish.</p>
              </aside>
            </div>
            {error && <p role="alert" className="mt-6 bg-[#fef2f2] px-3 py-2 text-[13px] text-[#b91c1c]">{error}</p>}
            <Footer onBack={() => setStep(0)} onNext={() => (name.trim() ? (setError(""), setStep(2)) : setError("Add your business name."))} />
          </section>
        )}

        {step === 2 && (
          <PickTemplate type={T} pick={pick} setPick={setPick} name={name} sells={sells} onBack={() => setStep(1)} onNext={() => { setError(""); setStep(3); }} />
        )}

        {step === 3 && !built && (
          <Building
            name={name.trim()}
            template={pick}
            brief={`${name.trim()} is a ${T.label.toLowerCase()} business in ${place}, Nigeria. They sell: ${sells}.${ig ? ` Instagram: ${ig}.` : ""} Build a ${T.label.toLowerCase()} site.`}
            onDone={setBuilt}
            onFail={(m) => { setError(m); setStep(2); }}
          />
        )}
        {step === 3 && built && <Ready site={built} onOpen={() => router.push(`/dashboard/${built.id}`)} />}
        {step === 2 && error && <p role="alert" className="mt-6 bg-[#fef2f2] px-3 py-2 text-[13px] text-[#b91c1c]">{error}</p>}
      </main>
    </div>
  );
}

function Select({ label, value, set, options }: { label: string; value: string; set: (v: string) => void; options: string[] }) {
  return (
    <label className="flex flex-col gap-2"><span className="text-[14px] font-medium">{label}</span>
      <span className="relative">
        <select value={value} onChange={(e) => set(e.target.value)} className={`${BOX} appearance-none pr-9`}>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" strokeWidth={1.5} />
      </span>
    </label>
  );
}

function Footer({ note, onBack, onNext, nextLabel = "Continue", disabled }: { note?: string; onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--v4-line)] pt-6">
      {onBack ? <button type="button" onClick={onBack} className="btn btn-secondary"><ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back</button> : <span />}
      <div className="flex items-center gap-4">
        {note && <span className="text-[14px] text-[var(--v4-m62)] max-sm:hidden">{note}</span>}
        <button type="button" disabled={disabled} onClick={onNext} className="btn btn-primary">{nextLabel}</button>
      </div>
    </div>
  );
}

function PickTemplate({ type, pick, setPick, name, sells, onBack, onNext }: { type: (typeof TYPES)[number]; pick: string; setPick: (v: string) => void; name: string; sells: string; onBack: () => void; onNext: () => void }) {
  const [all, setAll] = useState(false);
  const ids = all ? CATALOG.map((c) => c.id) : type.templates;
  return (
    <section>
      <h1 className="text-[40px] font-semibold tracking-[-0.02em] max-md:text-[30px]">Pick a template</h1>
      <p className="mt-2 text-[16px] text-[var(--v4-m75)]">Showing {all ? "every" : type.label.toLowerCase()} template. Every template is mobile-first and wired to your products and Paystack.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={() => setAll(false)} className={`h-9 rounded-[2px] border px-3.5 text-[14px] ${!all ? "border-[var(--v4-ink)] bg-[var(--v4-ink)] text-white" : "border-[var(--v4-line)]"}`}>{type.label}</button>
        <button type="button" onClick={() => setAll(true)} className={`h-9 rounded-[2px] border px-3.5 text-[14px] ${all ? "border-[var(--v4-ink)] bg-[var(--v4-ink)] text-white" : "border-[var(--v4-line)]"}`}>All templates</button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Template">
        <button type="button" role="radio" aria-checked={pick === "ai"} onClick={() => setPick("ai")}
          className={`flex min-h-[300px] flex-col justify-center gap-3 border p-8 text-left ${pick === "ai" ? "border-[var(--v4-blue)] bg-[rgba(59,91,255,0.05)]" : "border-[var(--v4-line)]"}`}>
          <Mascot eyes="happy" size={48} />
          <span className="mt-2 text-[20px] font-semibold">Let Wintech AI build it</span>
          <span className="text-[14px] leading-[21px] text-[var(--v4-m75)]">It picks the best layout for {name ? <b className="font-semibold text-[var(--v4-ink)]">{name}</b> : "your business"} ({sells.toLowerCase()}), writes every page and sets up your sections. Uses AI credits.</span>
          <span className="mt-1 flex items-center gap-3 text-[13px]"><span className="tag tag-sm tag-blue">Recommended</span><span className="text-[var(--v4-m62)]">About 2 minutes</span></span>
        </button>
        {ids.map((id) => {
          const t = getTemplate(id); const c = CATALOG.find((x) => x.id === id);
          if (!t || !c) return null;
          return (
            <div key={id} role="radio" tabIndex={0} aria-checked={pick === id} aria-label={c.name} onClick={() => setPick(id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setPick(id))}
              className={`flex cursor-pointer flex-col border text-left ${pick === id ? "border-[var(--v4-blue)] ring-1 ring-[var(--v4-blue)]" : "border-[var(--v4-line)] hover:border-[var(--v4-line-2)]"}`}>
              <span className="block overflow-hidden"><ScaledPreview ratio={460 / 290} initial={0.36}><TemplateSite template={t} /></ScaledPreview></span>
              <span className="flex items-center justify-between border-t border-[var(--v4-line)] px-4 py-3">
                <span><span className="block text-[15px] font-semibold">{c.name}</span><span className="block text-[12px] text-[var(--v4-m62)]">by Wintech</span></span>
                <span className="tag tag-sm !bg-[#dcfce7] !text-[#15803d]">Free</span>
              </span>
            </div>
          );
        })}
      </div>
      <Footer onBack={onBack} onNext={onNext} nextLabel={pick === "ai" ? "Use Wintech AI" : "Use this template"} />
    </section>
  );
}

const BUILD_STEPS_AI: [string, string][] = [
  ["Reading your details", "Name, what you sell and where you are"],
  ["Picking the best layout", "Matched to your kind of business"],
  ["Writing your pages", "Home, about, contact and more"],
  ["Adding your sections", "Prices in naira, WhatsApp button"],
  ["Final checks on phone and desktop", "Making sure everything fits"],
];
const BUILD_STEPS_TPL: [string, string][] = [
  ["Copying the template", "Every section and page"],
  ["Adding your business name", "On the header, footer and browser tab"],
  ["Setting your address", "Hidden until you publish"],
];

function Building({ name, template, brief, onDone, onFail }: { name: string; template: string; brief: string; onDone: (s: { id: string; slug: string; name: string }) => void; onFail: (m: string) => void }) {
  const ai = template === "ai";
  const steps = ai ? BUILD_STEPS_AI : BUILD_STEPS_TPL;
  const [at, setAt] = useState(0);
  const [result, setResult] = useState<{ id: string; slug: string; name: string } | null>(null);
  const says = ["Reading what you told me.", "Picking a layout.", "Writing your pages now.", "Adding your sections.", "Checking it on a phone.", "Done!"];

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (ai) {
          const res = await fetch("/api/build-site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief }) });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.id) {
            const why: Record<string, string> = {
              no_credits: "You are out of AI credits. Pick a template instead, or top up.",
              site_limit: "You have reached the site limit on your plan.",
              not_configured: "Wintech AI is not switched on yet. Pick a template instead.",
              credits_not_set_up: "Wintech AI is not switched on yet. Pick a template instead.",
              busy: "Wintech AI is busy. Try again in a minute, or pick a template.",
            };
            throw new Error(why[data.error] || "The build did not finish. Try again or pick a template.");
          }
          const { data: site } = await createClient().from("sites").select("slug,name").eq("id", data.id).single();
          if (live) setResult({ id: data.id, slug: site?.slug || "", name: site?.name || name });
        } else {
          const fd = new FormData();
          fd.set("name", name);
          fd.set("slug", normalizeSlug(name));
          fd.set("template", template);
          const r = await createSite(fd);
          if (!r || !("id" in r) || !r.id) throw new Error(("error" in (r || {}) && (r as { error?: string }).error) || "The site was not created.");
          if (live) setResult({ id: r.id as string, slug: normalizeSlug(name), name });
        }
      } catch (e) {
        if (live) onFail(e instanceof Error ? e.message : "That did not work.");
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Steps tick over on a timer; the last one waits for the real answer. */
  useEffect(() => {
    if (at < steps.length - 1) {
      const t = setTimeout(() => setAt((a) => a + 1), ai ? 2600 : 700);
      return () => clearTimeout(t);
    }
    if (result) {
      const t = setTimeout(() => { setAt(steps.length); onDone(result); }, 600);
      return () => clearTimeout(t);
    }
  }, [at, result, steps.length, ai, onDone]);

  const pct = Math.min(99, Math.round(((at + (result ? 1 : 0.5)) / steps.length) * 100));
  const preview = getTemplate(ai ? "store-skincare" : template);
  const eyes: Eyes = result ? "happy" : at % 2 ? "left" : "right";
  return (
    <section className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-5">
        <MascotSays eyes={eyes} text={says[Math.min(at, says.length - 1)]} />
        <div>
          <h1 className="text-[36px] font-semibold tracking-[-0.02em] max-md:text-[28px]">Building {name}</h1>
          <p className="mt-2 text-[16px] text-[var(--v4-m75)]">Keep this tab open. It takes {ai ? "about two minutes" : "a few seconds"}.</p>
        </div>
        <div>
          <div className="flex justify-between text-[13px] text-[var(--v4-m75)]"><span>{pct}% done</span><span>{result ? "Almost there" : ai ? "Writing with Wintech AI" : "Setting up"}</span></div>
          <div className="mt-2 h-1.5 bg-[var(--v4-panel)]"><div className="h-full bg-[var(--v4-blue)] transition-[width] duration-700" style={{ width: `${pct}%` }} /></div>
        </div>
        <ol className="hair">
          {steps.map(([t, d], i) => {
            const done = i < at || (i === at && !!result && at === steps.length);
            const now = i === at;
            return (
              <li key={t} className={`flex items-center gap-3 border-b border-[var(--v4-line)] px-4 py-3 last:border-0 transition-colors ${now ? "bg-[rgba(59,91,255,0.05)]" : ""}`}>
                {done ? <CheckCircle2 className="h-4 w-4 text-[#15803d]" strokeWidth={1.5} /> : now ? <Loader2 className="h-4 w-4 animate-spin text-[var(--v4-blue)]" strokeWidth={1.5} /> : <span className="h-4 w-4 rounded-full border border-[var(--v4-line-2)]" />}
                <span className={done || now ? "" : "text-[var(--v4-m62)]"}>
                  <span className="block text-[14px] font-medium">{t}</span>
                  {(done || now) && <span className="block text-[12px] text-[var(--v4-m62)]">{d}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <BrowserPreview template={preview?.id} host={`${normalizeSlug(name) || "yoursite"}.${ROOT_DOMAIN}`} shimmer />
    </section>
  );
}

function BrowserPreview({ template, host, hidden, shimmer }: { template?: string; host: string; hidden?: boolean; shimmer?: boolean }) {
  const t = template ? getTemplate(template) : undefined;
  return (
    <div className="hair self-start overflow-hidden bg-white max-lg:hidden">
      <div className="flex h-10 items-center gap-3 border-b border-[var(--v4-line)] px-3">
        <span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-[var(--v4-panel)]" />)}</span>
        <span className="hair truncate rounded-[2px] bg-[var(--v4-soft)] px-3 py-1 text-[12px] text-[var(--v4-m75)]">{host}</span>
        {hidden && <span className="tag tag-sm tag-warm ml-auto">● Hidden</span>}
      </div>
      <div className={`relative ${shimmer ? "build-shimmer" : ""}`}>
        {t && <ScaledPreview ratio={460 / 400} initial={0.36}><TemplateSite template={t} /></ScaledPreview>}
      </div>
    </div>
  );
}

function Ready({ site, onOpen }: { site: { id: string; slug: string; name: string }; onOpen: () => void }) {
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const host = `${site.slug}.${ROOT_DOMAIN}`;
  const url = `https://${host}`;
  const [tpl, setTpl] = useState<string>();
  useEffect(() => {
    createClient().from("sites").select("template").eq("id", site.id).single().then(({ data }) => setTpl(data?.template));
  }, [site.id]);
  const share = useMemo(() => `https://wa.me/?text=${encodeURIComponent(`We are online! Visit ${site.name}: ${url}`)}`, [site.name, url]);

  return (
    <section className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-5">
        <MascotSays eyes="happy" text={live ? "You're live!" : "Done! Have a look."} />
        <div>
          <h1 className="text-[36px] font-semibold tracking-[-0.02em] max-md:text-[28px]">Your site is ready</h1>
          <p className="mt-2 text-[16px] leading-6 text-[var(--v4-m75)]">{site.name} is built and {live ? "live for everyone" : "hidden until you publish"}. Check it on your phone, then go live.</p>
        </div>
        <div className="hair flex h-11 items-center gap-2 bg-[var(--v4-soft)] px-3">
          <Globe className="h-4 w-4" strokeWidth={1.5} />
          <a href={url} target="_blank" rel="noreferrer" className="flex-1 truncate text-[14px]">{host}</a>
          <button type="button" aria-label="Copy address" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
            {copied ? <Check className="h-4 w-4 text-[#15803d]" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
        {copied && <p className="text-[13px] text-[#15803d]" role="status">Copied</p>}
        <div className="flex flex-wrap gap-2">
          {!live && (
            <button type="button" disabled={busy} className="btn btn-primary" onClick={async () => { setBusy(true); await setPublished(site.id, true); setLive(true); setBusy(false); }}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : null} Publish now
            </button>
          )}
          <button type="button" className={`btn ${live ? "btn-primary" : "btn-secondary"}`} onClick={onOpen}>Open dashboard</button>
        </div>
        <ul className="hair">
          {[
            [CheckCircle2, "Your pages are written", "Change words, prices or photos any time", `/dashboard/${site.id}/site`, true],
            [CheckCircle2, "Payments", "Add your bank details to take orders", `/dashboard/${site.id}/settings`, true],
            [Globe, "Add your own domain", `Optional. Use ${site.slug}.ng`, "/domains", false],
            [Send, "Share on WhatsApp", "Send the link to your customers", share, false],
          ].map(([I, t, d, h, ok]) => {
            const Icon = I as typeof Globe;
            const ext = String(h).startsWith("http");
            const cls = "flex items-center gap-3 border-b border-[var(--v4-line)] px-4 py-3 last:border-0 hover:bg-[var(--v4-soft)]";
            const inner = (<><Icon className={`h-4 w-4 ${ok ? "text-[#15803d]" : ""}`} strokeWidth={1.5} /><span className="flex-1"><span className="block text-[14px] font-medium">{t as string}</span><span className="block text-[12px] text-[var(--v4-m62)]">{d as string}</span></span><ChevronRight className="h-4 w-4 text-[var(--v4-m62)]" strokeWidth={1.5} /></>);
            return ext ? <a key={t as string} href={h as string} target="_blank" rel="noreferrer" className={cls}>{inner}</a> : <Link key={t as string} href={h as string} className={cls}>{inner}</Link>;
          })}
        </ul>
      </div>
      <BrowserPreview template={tpl} host={host} hidden={!live} />
    </section>
  );
}
