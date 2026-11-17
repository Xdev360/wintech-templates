import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { CATALOG, entry, facts } from "@/components/v4/catalog";
import { DetailFrame } from "@/components/v4/DetailFrame";
import { PageShell } from "@/components/v4/PageShell";
import { TCard } from "@/components/v4/TCard";
import { Btn, TextLink } from "@/components/v4/ui";
import { isSignedIn } from "@/lib/session";
import { getTemplate, kindLabel } from "@/lib/templates";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const t = getTemplate((await params).id);
  if (!t) return {};
  return { title: `${entry(t.id)?.name ?? t.name} template · Wintech Templates`, description: t.blurb };
}

/* Template detail (Figma "Desktop / Template detail"). */
export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getTemplate(id);
  const c = entry(id);
  if (!t || !c) notFound();
  const signedIn = await isSignedIn();
  const use = signedIn ? `/dashboard/new?template=${t.id}` : `/signup?template=${t.id}`;
  const host = `${c.name.toLowerCase().replace(/[^a-z]/g, "")}.wintechstudio.com`;
  const related = CATALOG.filter((x) => x.id !== id && getTemplate(x.id)?.kind === t.kind).concat(CATALOG.filter((x) => x.id !== id && getTemplate(x.id)?.kind !== t.kind)).slice(0, 3);

  return (
    <PageShell>
      <nav aria-label="Breadcrumb" className="wrap flex items-center gap-2 pt-6 text-[13px] text-[var(--v4-m62)]">
        <Link href="/templates" className="hover:text-[var(--v4-ink)]">Templates</Link>
        <span>/</span>
        <Link href={`/templates?group=${encodeURIComponent(c.group)}`} className="hover:text-[var(--v4-ink)]">{c.tag}</Link>
        <span>/</span>
        <span className="text-[var(--v4-ink)]">{c.name}</span>
      </nav>

      <section className="wrap grid gap-10 pb-[96px] pt-8 lg:grid-cols-[1fr_400px]">
        <DetailFrame id={id} host={host} />
        <div className="flex flex-col gap-5 lg:sticky lg:top-[130px] lg:self-start">
          <div className="flex gap-2">
            <span className="tag tag-sm">{c.tag}</span>
            <span className="tag tag-sm tag-blue">Works with AI</span>
          </div>
          <h1 className="h2s">{c.name}</h1>
          <p className="text-[16px] leading-6 text-[var(--v4-m75)]">{t.blurb}</p>
          <div className="flex flex-col gap-2">
            <Btn href={use} arrow className="w-full">Use this template</Btn>
            <Btn href={`/templates/${id}/preview`} kind="secondary" className="w-full">Preview live site</Btn>
          </div>
          <p className="text-[13px] text-[var(--v4-m62)]">Available on all plans. {kindLabel(t.kind)} template.</p>
          <dl className="border-t border-[var(--v4-line)]">
            {facts(t.kind, c.bestFor).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-3 border-b border-[var(--v4-line)] py-3 text-[14px]">
                <dt className="text-[var(--v4-m62)]">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-2 bg-[var(--v4-soft)] p-5">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <Sparkles className="h-4 w-4 text-[var(--v4-blue)]" strokeWidth={1.5} /> Start with AI
            </p>
            <p className="text-[14px] leading-[21px] text-[var(--v4-m75)]">Tell the assistant what you sell and it fills this template with your words, prices and photos.</p>
          </div>
        </div>
      </section>

      <section className="wrap pb-[120px] max-md:pb-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="h2s">More {kindLabel(t.kind).toLowerCase()} templates</h2>
          <TextLink href="/templates">See all templates</TextLink>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => <TCard key={r.id} c={r} />)}
        </div>
      </section>
    </PageShell>
  );
}
