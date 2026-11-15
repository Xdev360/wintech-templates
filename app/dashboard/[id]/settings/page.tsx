import { SettingsView, type Bank } from "@/components/dashboard/SettingsView";
import { ROOT_DOMAIN } from "@/lib/config";
import { loadDashboard } from "@/lib/dashboard";

export default async function SiteSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await loadDashboard(id);
  const { data: row } = await d.supabase.from("sites").select("payment").eq("id", id).maybeSingle();
  return (
    <SettingsView
      base={`/dashboard/${id}`}
      siteId={id}
      siteName={d.site.name}
      slug={d.site.slug}
      siteUrl={`https://${d.site.slug}.${ROOT_DOMAIN}`}
      accent={d.site.content.theme.accent}
      bank={(row?.payment || {}) as Bank}
      published={d.site.published}
    />
  );
}
