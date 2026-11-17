import { SiteHome, type HomeEnquiry, type HomeOrder } from "@/components/dashboard/SiteHome";
import { ROOT_DOMAIN } from "@/lib/config";
import { loadDashboard } from "@/lib/dashboard";

/* A site's Home (Figma page 24, ST1). */
export default async function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await loadDashboard(id);
  const [{ data: orders }, { data: enquiries }] = await Promise.all([
    d.supabase.from("orders").select("id, reference, customer_name, total_kobo, status, created_at").eq("site_id", id).order("created_at", { ascending: false }).limit(50),
    d.supabase.from("enquiries").select("id, name, message, created_at, read_at").eq("site_id", id).order("created_at", { ascending: false }).limit(50),
  ]);
  return (
    <SiteHome
      base={`/dashboard/${id}`}
      user={d.user}
      site={d.shellSite}
      content={d.site.content}
      template={d.site.template}
      siteUrl={`https://${d.site.slug}.${ROOT_DOMAIN}`}
      orders={(orders || []) as HomeOrder[]}
      enquiries={(enquiries || []) as HomeEnquiry[]}
    />
  );
}
