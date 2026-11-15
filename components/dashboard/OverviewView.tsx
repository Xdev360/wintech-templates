import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import type { ShellSite, ShellUser } from "@/lib/dashboard-types";
import { defaultContent, templateFor, type SiteContent } from "@/lib/site-model";
import { Label, Pill, TickBar } from "./ui";

/* ──────────────────────────────────────────────────────────────
   The first screen for a site. Three things, and room around them:
   the site as it looks right now, what is left to finish, and a box
   to ask Wintech AI. Plugins, credits, and templates have their own
   pages; they are not repeated here.

   No invented numbers. Everything shown is read from the site.
   ────────────────────────────────────────────────────────────── */

export type Step = { label: string; done: boolean; href: string };

const ITEMS_WORD = { store: "products", booking: "services", portfolio: "projects", landing: "points" } as const;

export function setupSteps(content: SiteContent, published: boolean, base: string, template: string): Step[] {
  const def = templateFor(template);
  const sample = defaultContent(def);
  const titles = (c: SiteContent) => c.items.list.map((i) => i.title).join("|");
  const word = def.engine === "reservation" ? "menu" : ITEMS_WORD[def.kind];
  return [
    { label: "Write your headline", done: content.hero.headline.trim() !== "" && content.hero.headline !== sample.hero.headline, href: `${base}/site` },
    { label: `Replace the sample ${word}`, done: content.items.list.length === 0 || titles(content) !== titles(sample), href: `${base}/site#items` },
    { label: "Add your logo", done: Boolean(content.brand.logoUrl), href: `${base}/site#brand` },
    { label: "Add a main photo", done: Boolean(content.hero.image), href: `${base}/site#hero` },
    { label: "Say how to reach you", done: Boolean(content.brand.email || content.brand.phone), href: `${base}/site#brand` },
    { label: "Publish your site", done: published, href: `${base}/settings` },
  ];
}

export function OverviewView({
  base,
  user,
  site,
  content,
  template,
  siteUrl,
  credits,
}: {
  base: string;
  user: ShellUser;
  site: ShellSite;
  content: SiteContent;
  template: string;
  siteUrl: string;
  credits: number | null;
}) {
  const steps = setupSteps(content, site.published, base, template);
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  const first = user.name.split(" ")[0];
  const host = siteUrl.replace(/^https?:\/\//, "");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[18px] font-semibold tracking-[-0.025em]">{site.name}</h1>
            <Pill tone={site.published ? "good" : "warn"}>{site.published ? "Live" : "Hidden"}</Pill>
          </div>
          <a href={siteUrl} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] text-mute hover:text-ink">
            {host} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="flex gap-2">
          <a href={siteUrl} target="_blank" rel="noreferrer" className="btn-soft">View site</a>
          <Link href={`${base}/site`} className="btn-primary">Edit site</Link>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        {/* The site, as it is right now. Clicking it opens the editor. */}
        <div className="group relative overflow-hidden rounded-[13px] shadow-[0_0_0_1px_var(--line)]">
          <div className="transition-transform duration-500 ease-out group-hover:scale-[1.01]">
            <ScaledPreview initial={0.5} ratio={16 / 10.5}>
              <TemplateSite template={templateFor(template)} content={content} />
            </ScaledPreview>
          </div>
          <Link href={`${base}/site`} className="absolute inset-0" aria-label="Edit your site" />
        </div>

        <div className="flex flex-col gap-5">
          {/* What is left to finish. */}
          <section className="rounded-[13px] p-4 shadow-[0_0_0_1px_var(--line)]">
            <div className="flex items-baseline justify-between">
              <Label>Finish setting up</Label>
              <span className="text-[12px] tabular-nums text-mute">{done} of {steps.length}</span>
            </div>
            <div className="mt-3"><TickBar value={done} total={steps.length} /></div>
            <ul className="mt-3 flex flex-col">
              {steps.map((s) => (
                <li key={s.label}>
                  <Link href={s.href} className="flex items-center gap-2.5 py-2 text-[13px] hover:text-accent">
                    <span className={`grid h-[18px] w-[18px] place-items-center rounded-full ${s.done ? "bg-accent text-accent-ink" : "shadow-[inset_0_0_0_1.5px_var(--line-2)]"}`}>
                      {s.done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span className={s.done ? "text-mute-2 line-through" : ""}>{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {next ? (
              <Link href={next.href} className="btn-soft mt-2 w-full">Next: {next.label}</Link>
            ) : (
              <p className="mt-2 text-[12.5px] text-emerald-600">All done. Share your link.</p>
            )}
          </section>

          {/* Ask Wintech AI. */}
          <section className="rounded-[13px] p-4 shadow-[0_0_0_1px_var(--line)]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-accent" /><Label>Wintech AI</Label></span>
              <span className="text-[12px] text-mute">{credits === null ? "" : `${credits} credits`}</span>
            </div>
            <p className="mt-2 text-[13px] leading-[1.5] text-mute">
              Tell it what to change, {first}. It shows you the change before anything goes live.
            </p>
            <form action={`${base}/ai`} className="mt-3 flex gap-1.5 rounded-[11px] bg-soft p-1">
              <label htmlFor="ask" className="sr-only">Ask Wintech AI</label>
              <input id="ask" name="q" placeholder="Make my headline shorter" className="min-w-0 flex-1 bg-transparent px-2.5 text-[13px] outline-none placeholder:text-mute-2" />
              <button className="btn-primary !h-8">Ask</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
