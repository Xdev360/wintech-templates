import { DesktopOnly } from "@/components/dashboard/DesktopOnly";
import { Editor } from "@/components/editor/Editor";
import type { Part } from "@/components/editor/Inspector";
import { loadDashboard } from "@/lib/dashboard";
import { SECTION_KEYS } from "@/lib/site-model";

/* The editor can open on a particular part of the page — "Products" in
   the sidebar lands you on the products, not on the headline. */
function partFrom(value: string | undefined): Part {
  if (value === "brand" || value === "hero" || value === "add") return value;
  return SECTION_KEYS.find((k) => k === value) ?? "hero";
}

export default async function SitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ part?: string }>;
}) {
  const { id } = await params;
  const { part } = await searchParams;
  const d = await loadDashboard(id);
  const { data } = await d.supabase.auth.getUser();
  return (
    <DesktopOnly what="Editing your site" base={`/dashboard/${id}`}>
      <Editor site={d.site} userId={data.user!.id} initialPart={partFrom(part)} />
    </DesktopOnly>
  );
}
