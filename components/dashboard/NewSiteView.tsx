"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Check, LayoutTemplate, Sparkles } from "lucide-react";
import { createSite } from "@/app/actions/sites";
import { AI_BUILD_COST } from "@/lib/credits";
import { normalizeSlug } from "@/lib/slugs";
import { KINDS, type Kind } from "@/lib/templates";

/* Two ways in: pick a template and fill it in, or describe the business
   and let Wintech AI pick the template and write the whole site. Either
   way the site starts hidden, so nothing goes live until it is theirs. */

type Lite = { id: string; name: string; kind: Kind };

const input =
  "h-11 w-full rounded-[12px] bg-page px-3.5 text-[13px] shadow-[inset_0_0_0_1px_var(--line-2)] outline-none transition focus:shadow-[inset_0_0_0_1.5px_var(--accent)]";

const ERRORS: Record<string, string> = {
  too_short: "Tell Wintech AI a little more: what you sell, who for, and where.",
  site_limit: "The free plan is one site. Delete the other, or wait for paid plans.",
  not_configured: "Wintech AI is not switched on yet. Pick a template instead for now.",
  credits_not_set_up: "Credits are not set up yet. Pick a template instead for now.",
  no_credits: `Building a site uses ${AI_BUILD_COST} credits, and you do not have enough.`,
  busy: "Wintech AI is busy. Try again in a minute. You were not charged.",
  unreachable: "Could not reach Wintech AI. Try again. You were not charged.",
  ai_error: "Something went wrong. Try again. You were not charged.",
  refused: "Wintech AI could not build that one. Try describing the business differently.",
  create_failed: "The site could not be created. Try again.",
  signed_out: "Your session ended. Log in again.",
};

export function NewSiteView({
  templates,
  cards,
  initialTemplate,
  initialName,
}: {
  templates: Lite[];
  cards: Record<string, ReactNode>;
  initialTemplate: string;
  initialName: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"template" | "ai">("template");
  const [kind, setKind] = useState<Kind | null>(null);
  const [template, setTemplate] = useState(initialTemplate || templates[0].id);
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(normalizeSlug(initialName));
  const [brief, setBrief] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function fromTemplate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const result = await createSite(new FormData(e.currentTarget));
    setPending(false);
    if (result.error) return setError(result.error);
    if (result.id) router.push(`/dashboard/${result.id}/site`);
  }

  async function withAi(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/build-site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(ERRORS[data.error] || ERRORS.ai_error);
      router.push(`/dashboard/${data.id}/site`);
    } catch {
      setError(ERRORS.unreachable);
    } finally {
      setPending(false);
    }
  }

  const shown = kind ? templates.filter((t) => t.kind === kind) : templates;

  return (
    <div className="flex flex-col gap-6">
      <div className="inline-flex w-fit rounded-[12px] bg-soft p-1" role="tablist" aria-label="How to start">
        <Tab on={mode === "template"} onClick={() => setMode("template")} icon={<LayoutTemplate className="h-4 w-4" />}>Pick a template</Tab>
        <Tab on={mode === "ai"} onClick={() => setMode("ai")} icon={<Sparkles className="h-4 w-4" />}>Describe your business</Tab>
      </div>

      {mode === "template" ? (
        <form onSubmit={fromTemplate} className="flex flex-col gap-6">
          <input type="hidden" name="template" value={template} />
          <div className="flex flex-wrap gap-1.5">
            <Chip on={!kind} onClick={() => setKind(null)}>All</Chip>
            {KINDS.map((k) => <Chip key={k.id} on={kind === k.id} onClick={() => setKind(k.id)}>{k.plural}</Chip>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Template">
            {shown.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={template === t.id} onClick={() => setTemplate(t.id)}
                className={`group relative overflow-hidden rounded-[13px] text-left transition ${template === t.id ? "shadow-[0_0_0_2px_var(--accent)]" : "shadow-[0_0_0_1px_var(--line)] hover:shadow-[0_0_0_1px_var(--line-2)]"}`}>
                <div className="pointer-events-none">{cards[t.id]}</div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] font-medium">{t.name}</span>
                  {template === t.id ? <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-ink"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span> : <span className="text-[12px] text-mute">{KINDS.find((k) => k.id === t.kind)?.label}</span>}
                </div>
              </button>
            ))}
          </div>

          <div className="grid max-w-[640px] gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[13px] text-mute">
              Business name
              <input name="name" required className={input} value={name} placeholder="Best Luxury"
                onChange={(e) => { setName(e.target.value); setSlug(normalizeSlug(e.target.value)); }} />
            </label>
            <label className="grid gap-1.5 text-[13px] text-mute">
              Link
              <input name="slug" required className={input} value={slug} placeholder="bestluxury" onChange={(e) => setSlug(normalizeSlug(e.target.value))} />
              <span className="text-[12px]">{slug || "yourname"}.wintechstudio.com</span>
            </label>
          </div>
          <p className="text-[12px] text-mute">It starts with the template&apos;s sample words and stays hidden until you make it yours and publish.</p>
          {error ? <p className="text-[13px] text-red-600" role="alert">{error}</p> : null}
          <button disabled={pending} className="btn-primary w-fit disabled:opacity-60">{pending ? "Creating…" : "Create and open the editor"}</button>
        </form>
      ) : (
        <form onSubmit={withAi} className="flex max-w-[720px] flex-col gap-4">
          <label className="grid gap-1.5 text-[13px] text-mute">
            Tell Wintech AI about the business
            <textarea rows={6} value={brief} onChange={(e) => setBrief(e.target.value)} className={`${input} h-auto py-3 leading-relaxed`}
              placeholder="I run a small bakery in Surulere. We sell meat pies (₦800 each), chin chin, banana bread and birthday cakes from ₦25,000. We deliver across the mainland and take orders by WhatsApp on 0803 000 0000." />
          </label>
          <p className="text-[12px] text-mute">
            Wintech AI picks the best template and writes every section from what you say. It never invents prices, contacts, or reviews. Uses {AI_BUILD_COST} credits, only if it succeeds. The site starts hidden so you can check it first.
          </p>
          {error ? <p className="text-[13px] text-red-600" role="alert">{error}</p> : null}
          <button disabled={pending} className="btn-primary w-fit disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> {pending ? "Building your site…" : "Build my site"}
          </button>
        </form>
      )}
    </div>
  );
}

function Tab({ on, onClick, icon, children }: { on: boolean; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button type="button" role="tab" aria-selected={on} onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-[11px] px-4 text-[13px] font-medium transition ${on ? "bg-page shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_var(--line)]" : "text-mute hover:text-ink"}`}>
      {icon}{children}
    </button>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`h-8 rounded-[10px] px-3 text-[12px] font-medium ${on ? "bg-accent text-accent-ink" : "bg-soft text-mute hover:text-ink"}`}>
      {children}
    </button>
  );
}
