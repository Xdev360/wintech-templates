import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { GUIDES, guide } from "@/components/v4/guides";
import { Helpful } from "@/components/v4/help";
import { PageShell } from "@/components/v4/PageShell";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guide((await params).slug);
  return g ? { title: `${g.title} · Wintech Templates help`, description: g.intro } : {};
}

/* Guide article (Figma "Desktop / Guide article"). */
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guide((await params).slug);
  if (!g) notFound();
  const i = GUIDES.indexOf(g);
  const prev = GUIDES[i - 1];
  const next = GUIDES[i + 1];
  const toc = g.body.filter((b): b is { h: string; id: string } => "h" in b);

  return (
    <PageShell cta={false}>
      <div className="wrap grid gap-12 py-12 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-[130px] lg:self-start max-lg:hidden">
          <Link href="/help" className="link !text-[13px]"><ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Back to Help center</Link>
          <p className="eyebrow mt-8">On this page</p>
          <ul className="mt-3 flex flex-col border-l border-[var(--v4-line)]">
            {toc.map((t) => (
              <li key={t.id}><a href={`#${t.id}`} className="block py-1.5 pl-3 text-[13px] text-[var(--v4-m75)] hover:text-[var(--v4-ink)]">{t.h}</a></li>
            ))}
          </ul>
        </aside>

        <article className="max-w-[720px]">
          <nav aria-label="Breadcrumb" className="flex gap-2 text-[13px] text-[var(--v4-m62)]">
            <Link href="/help" className="hover:text-[var(--v4-ink)]">Help center</Link><span>/</span><span>{g.category}</span>
          </nav>
          <h1 className="h2 mt-5 !text-[48px] !leading-[1.1] max-md:!text-[34px]">{g.title}</h1>
          <p className="intro mt-5">{g.intro}</p>
          <div className="mt-5 flex gap-2"><span className="tag tag-sm">{g.category}</span><span className="tag tag-sm">{g.meta}</span></div>

          <div className="mt-10 flex flex-col gap-5">
            {g.body.map((b, k) => {
              if ("h" in b) return <h2 key={k} id={b.id} className="mt-6 scroll-mt-32 text-[24px] font-semibold tracking-[-0.01em]">{b.h}</h2>;
              if ("p" in b) return <p key={k} className="text-[16px] leading-[26px] text-[var(--v4-m75)]">{b.p}</p>;
              if ("tip" in b) return (
                <p key={k} className="flex gap-3 border-l-2 border-[var(--v4-blue)] bg-[var(--v4-soft)] px-4 py-3 text-[14px] leading-[21px]">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--v4-blue)]" strokeWidth={1.5} /> {b.tip}
                </p>
              );
              if ("shot" in b) return (
                <figure key={k} className="hair flex h-[300px] items-center justify-center bg-[var(--v4-panel)] text-[13px] text-[var(--v4-m62)]">
                  <figcaption>Screenshot: {b.shot}</figcaption>
                </figure>
              );
              return (
                <ol key={k} className="flex flex-col gap-3">
                  {b.steps.map((s, j) => (
                    <li key={s} className="flex gap-3 text-[16px] leading-6 text-[var(--v4-m75)]">
                      <span className="hair flex h-6 w-6 shrink-0 items-center justify-center text-[12px] font-medium text-[var(--v4-ink)]">{j + 1}</span> {s}
                    </li>
                  ))}
                </ol>
              );
            })}
          </div>

          <div className="mt-14"><Helpful /></div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/help/${prev.slug}`} className="hair flex flex-col gap-1 p-5 hover:border-[var(--v4-line-2)]">
                <span className="text-[12px] text-[var(--v4-m62)]">Previous</span><span className="text-[15px] font-semibold">{prev.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/help/${next.slug}`} className="hair flex flex-col items-end gap-1 p-5 text-right hover:border-[var(--v4-line-2)]">
                <span className="text-[12px] text-[var(--v4-m62)]">Next</span><span className="text-[15px] font-semibold">{next.title}</span>
              </Link>
            )}
          </div>
        </article>
      </div>
    </PageShell>
  );
}
