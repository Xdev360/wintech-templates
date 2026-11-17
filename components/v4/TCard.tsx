import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { getTemplate } from "@/lib/templates";
import type { CatalogEntry } from "./catalog";

/* Template card (Figma "Card / Template"): live preview, name, tag, plan, one line, arrow. */
export function TCard({ c }: { c: CatalogEntry }) {
  const t = getTemplate(c.id);
  if (!t) return null;
  return (
    <Link href={`/templates/${c.id}`} className="tcard hair group flex flex-col bg-white transition-colors">
      <span className="block p-2 pb-0">
        <span className="relative block overflow-hidden bg-[var(--v4-panel)]">
          <ScaledPreview ratio={376 / 280} initial={0.29}>
            <TemplateSite template={t} />
          </ScaledPreview>
        </span>
      </span>
      <span className="flex items-center gap-2 border-b border-[var(--v4-line)] px-4 py-3">
        <span className="truncate text-[16px] font-semibold">{c.name}</span>
        <span className="tag !py-0.5 !text-[13px]">{c.tag}</span>
        <span className="ml-auto shrink-0 text-[13px] text-[var(--v4-m62)]">All plans</span>
      </span>
      <span className="flex items-center gap-3 px-4 py-3.5">
        <span className="flex-1 text-[14px] leading-[21px] text-[var(--v4-m75)]">{c.text}</span>
        <span className="hair flex h-8 w-8 shrink-0 items-center justify-center transition-colors group-hover:border-[var(--v4-ink)] group-hover:bg-[var(--v4-ink)] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </span>
      </span>
    </Link>
  );
}
