import Link from "next/link";
import { LayoutTemplate } from "lucide-react";
import { GalleryCard } from "@/components/templates/TemplateCard";
import { KINDS, TEMPLATES, type Kind } from "@/lib/templates";
import { Dashed, Label, PageHeader, Pill } from "./ui";

/* Templates inside the account: the ones your sites use, and the whole
   library to preview. Buying and applying a template to a site arrives
   with the section editor, and the page says so. */

export function TemplatesView({
  base,
  kind,
  used,
}: {
  base: string;
  kind: Kind | null;
  used: { name: string; kind: string; count: number }[];
}) {
  const shown = kind ? TEMPLATES.filter((t) => t.kind === kind) : TEMPLATES;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Templates"
        sub="Look at any template. These twelve are free. Premium ones are coming."
        actions={<Pill tone="warn">Buying opens soon</Pill>}
      />

      <section>
        <Label>Yours</Label>
        <ul className="mt-3 flex flex-wrap gap-3">
          {used.length ? used.map((t) => (
            <li key={t.name} className="flex items-center gap-3 rounded-[12px] px-4 py-3 shadow-[0_0_0_1px_var(--line)]">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-accent-3/40 text-accent"><LayoutTemplate className="h-4 w-4" /></span>
              <span>
                <span className="block text-[13px] font-medium">{t.name}</span>
                <span className="block text-[12px] text-mute">{t.kind} · used by {t.count} {t.count === 1 ? "site" : "sites"}</span>
              </span>
            </li>
          )) : <li className="text-[13px] text-mute">None yet. Create a site to get your first.</li>}
        </ul>
      </section>

      <Dashed />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>The library</Label>
          <nav className="flex flex-wrap gap-1.5" aria-label="Filter by kind">
            <Tab href={`${base}/templates`} on={!kind}>All · {TEMPLATES.length}</Tab>
            {KINDS.map((k) => (
              <Tab key={k.id} href={`${base}/templates?kind=${k.id}`} on={kind === k.id}>{k.plural}</Tab>
            ))}
          </nav>
        </div>
        <div className="mt-5 grid gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((t) => <GalleryCard key={t.id} t={t} />)}
        </div>
      </section>
    </div>
  );
}

function Tab({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={on ? "page" : undefined}
      className={`inline-flex h-8 items-center rounded-[10px] px-3 text-[12px] font-medium ${on ? "bg-accent text-accent-ink" : "bg-soft text-mute hover:text-ink"}`}>
      {children}
    </Link>
  );
}
