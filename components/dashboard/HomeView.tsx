import Link from "next/link";
import { ArrowUpRight, LayoutTemplate, Plus } from "lucide-react";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import type { ShellSite, ShellUser } from "@/lib/dashboard-types";
import { templateFor } from "@/lib/site-model";
import type { Site } from "@/lib/types";
import { setupSteps } from "./OverviewView";
import { Dashed, Initials, Label, Pill, TickBar } from "./ui";

/* ──────────────────────────────────────────────────────────────
   The account home. How all your businesses are doing, on one page.

   Everything shown is real. Messages and orders get a dash until
   Inbox and Orders exist, rather than a number nobody earned.
   ────────────────────────────────────────────────────────────── */

export function HomeView({
  base,
  user,
  rows,
  sites,
  credits,
  aiEdits,
  siteHref,
}: {
  base: string;
  user: ShellUser;
  rows: Site[];
  sites: ShellSite[];
  credits: number | null;
  aiEdits: Record<string, number>;
  siteHref: (id: string) => string;
}) {
  const live = sites.filter((s) => s.published).length;
  const edits = Object.values(aiEdits).reduce((a, b) => a + b, 0);
  const used = Array.from(new Map(sites.map((s) => [s.templateName, { name: s.templateName, kind: s.kindLabel, count: sites.filter((x) => x.templateName === s.templateName).length }])).values());

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Initials name={user.name} className="h-9 w-9 text-[12px]" />
          <div>
            <p className="text-[14px] font-medium tracking-[-0.015em]">Good to see you, {user.name.split(" ")[0]}</p>
            <p className="text-[13px] text-mute">Everything you run on Wintech, in one place.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`${base}/templates`} className="btn-soft"><LayoutTemplate className="h-4 w-4" /> Templates</Link>
          <Link href={`${base}/new`} className="btn-primary"><Plus className="h-4 w-4" /> New site</Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-y-6 md:grid-cols-4 md:divide-x md:divide-line">
        <Figure label="Sites" value={String(sites.length)} note={sites.length === 1 ? "One site" : `${sites.length} sites`} />
        <Figure label="Live" value={String(live)} note={live === sites.length ? "All published" : `${sites.length - live} hidden`} />
        <Figure label="Credits" value={credits === null ? "—" : credits.toLocaleString()} note={credits === null ? "Run 003_credits.sql" : "Across all sites"} />
        <Figure label="AI edits" value={edits.toLocaleString()} note="Wintech AI answers" />
      </div>

      <Dashed />

      <section>
        <div className="flex items-baseline justify-between">
          <Label>Your sites</Label>
          <Link href={`${base}/new`} className="text-[12px] text-mute hover:text-ink">+ New site</Link>
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row, i) => {
            const s = sites[i];
            const steps = setupSteps(row.content, row.published, "", row.template);
            const done = steps.filter((x) => x.done).length;
            return (
              <div key={row.id} className="group relative flex flex-col overflow-hidden rounded-[13px] shadow-[0_0_0_1px_var(--line)] transition-shadow hover:shadow-[0_0_0_1px_var(--line-2),0_18px_40px_-28px_rgba(0,0,0,0.35)]">
                <div className="border-b border-line">
                  <ScaledPreview initial={0.3}>
                    <TemplateSite template={templateFor(row.template)} content={row.content} />
                  </ScaledPreview>
                </div>
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">{s.name}</p>
                      <p className="truncate text-[12px] text-mute">{row.slug}.wintechstudio.com</p>
                    </div>
                    <Pill tone={s.published ? "good" : "warn"}>{s.published ? "Live" : "Hidden"}</Pill>
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between text-[12px] text-mute"><span>Setup</span><span className="tabular-nums">{done}/{steps.length}</span></div>
                    <TickBar value={done} total={steps.length} ticks={24} />
                  </div>
                </div>
                <Link href={siteHref(row.id)} className="absolute inset-0" aria-label={`Open ${s.name}`} />
              </div>
            );
          })}
          <Link href={`${base}/new`} className="grid min-h-[240px] place-items-center rounded-[13px] text-mute shadow-[inset_0_0_0_1.5px_var(--line-2)] [background-image:repeating-linear-gradient(135deg,transparent_0_10px,var(--soft)_10px_11px)] hover:text-ink">
            <span className="flex flex-col items-center gap-2 text-[13px]">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-page shadow-[0_0_0_1px_var(--line-2)]"><Plus className="h-5 w-5" /></span>
              New site
            </span>
          </Link>
        </div>
      </section>

      <Dashed />

      <section>
        <Label>How each business is doing</Label>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="text-left text-[12px] text-mute-2">
                <th className="py-2 font-normal">Site</th>
                <th className="py-2 font-normal">Status</th>
                <th className="py-2 font-normal">Setup</th>
                <th className="py-2 text-right font-normal">AI edits</th>
                <th className="py-2 text-right font-normal">Messages</th>
                <th className="py-2 text-right font-normal">Orders</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const steps = setupSteps(row.content, row.published, "", row.template);
                return (
                  <tr key={row.id} className="border-t border-dashed border-line">
                    <td className="py-3"><Link href={siteHref(row.id)} className="font-medium hover:underline">{sites[i].name}</Link></td>
                    <td className="py-3">{row.published ? "Live" : "Hidden"}</td>
                    <td className="py-3 tabular-nums text-mute">{steps.filter((x) => x.done).length}/{steps.length}</td>
                    <td className="py-3 text-right tabular-nums">{(aiEdits[row.id] || 0).toLocaleString()}</td>
                    <td className="py-3 text-right text-mute-2">—</td>
                    <td className="py-3 text-right text-mute-2">—</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-mute-2">Messages and orders fill in once Inbox and Orders open.</p>
      </section>

      <Dashed />

      <section>
        <div className="flex items-baseline justify-between">
          <Label>Your templates</Label>
          <Link href={`${base}/templates`} className="inline-flex items-center gap-1 text-[12px] text-mute hover:text-ink">Browse all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
        <ul className="mt-3 flex flex-wrap gap-3">
          {used.map((t) => (
            <li key={t.name} className="flex items-center gap-3 rounded-[12px] px-4 py-3 shadow-[0_0_0_1px_var(--line)]">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-accent-3/40 text-accent"><LayoutTemplate className="h-4 w-4" /></span>
              <span>
                <span className="block text-[13px] font-medium">{t.name}</span>
                <span className="block text-[12px] text-mute">{t.kind} · used by {t.count} {t.count === 1 ? "site" : "sites"}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Figure({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="md:px-6 md:first:pl-0">
      <Label>{label}</Label>
      <p className="mt-0.5 truncate text-[17px] font-normal tracking-[-0.02em] tabular-nums">{value}</p>
      <p className="mt-0.5 truncate text-[12px] text-mute">{note}</p>
    </div>
  );
}
