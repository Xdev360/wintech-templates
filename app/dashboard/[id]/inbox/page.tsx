import { InboxView, type Enquiry } from "@/components/dashboard/InboxView";
import { loadDashboard } from "@/lib/dashboard";

export default async function InboxPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await loadDashboard(id);

  // Empty until 005_enquiries.sql has been run, which is also the right
  // answer for a site that has had no messages yet.
  const { data } = await d.supabase
    .from("enquiries")
    .select("id, name, contact, message, source, created_at, read_at")
    .eq("site_id", id)
    .order("created_at", { ascending: false })
    .limit(200);

  return <InboxView enquiries={(data || []) as Enquiry[]} siteName={d.site.name} />;
}
