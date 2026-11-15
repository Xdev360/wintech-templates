import { CreditsView, type HistoryRow } from "@/components/dashboard/CreditsView";
import { loadAccount } from "@/lib/dashboard";

export default async function AccountCredits() {
  const a = await loadAccount();
  const { data, error } = await a.supabase
    .from("credit_ledger")
    .select("id, delta, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  return <CreditsView credits={a.credits} history={error ? null : ((data || []) as HistoryRow[])} />;
}
