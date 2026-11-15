import { TemplatesView } from "@/components/dashboard/TemplatesView";
import { loadAccount } from "@/lib/dashboard";
import { KINDS, type Kind } from "@/lib/templates";

export default async function AccountTemplates({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const a = await loadAccount();
  const { kind: raw } = await searchParams;
  const kind = KINDS.some((k) => k.id === raw) ? (raw as Kind) : null;
  const used = Array.from(new Map(a.sites.map((s) => [s.templateName, {
    name: s.templateName, kind: s.kindLabel, count: a.sites.filter((x) => x.templateName === s.templateName).length,
  }])).values());
  return <TemplatesView base="/dashboard" kind={kind} used={used} />;
}
