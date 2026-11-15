import { AccountSettingsView } from "@/components/dashboard/AccountSettingsView";
import { loadAccount } from "@/lib/dashboard";

export default async function AccountSettings() {
  const a = await loadAccount();
  return <AccountSettingsView userName={a.user.name} email={a.user.email} />;
}
