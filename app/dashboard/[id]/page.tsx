import { OverviewView } from "@/components/dashboard/OverviewView";
import { ROOT_DOMAIN } from "@/lib/config";
import { loadDashboard } from "@/lib/dashboard";

export default async function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await loadDashboard(id);
  return (
    <OverviewView
      base={`/dashboard/${id}`}
      user={d.user}
      site={d.shellSite}
      content={d.site.content}
      template={d.site.template}
      siteUrl={`https://${d.site.slug}.${ROOT_DOMAIN}`}
      credits={d.credits}
    />
  );
}
