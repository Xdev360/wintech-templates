import { OrdersView, type Order } from "@/components/dashboard/OrdersView";
import { loadDashboard } from "@/lib/dashboard";

export default async function OrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await loadDashboard(id);

  // Empty until 010_orders.sql has been run, which is also the right
  // answer for a shop that has had no orders yet.
  const { data } = await d.supabase
    .from("orders")
    .select("id, reference, customer_name, customer_phone, customer_email, items, total_kobo, note, status, created_at, claimed_at")
    .eq("site_id", id)
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: site } = await d.supabase.from("sites").select("payment").eq("id", id).maybeSingle();
  const bank = (site?.payment || {}) as { account_number?: string };

  return <OrdersView orders={(data || []) as Order[]} siteId={id} hasBank={Boolean(bank.account_number)} />;
}
