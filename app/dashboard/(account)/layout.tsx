import { ClaimReferral } from "@/components/auth/ClaimReferral";
import { AccountShell } from "@/components/dashboard/AccountShell";
import { loadAccount } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: LayoutProps<"/dashboard">) {
  const a = await loadAccount();
  return (
    <AccountShell sites={a.sites} user={a.user} credits={a.credits}>
      <ClaimReferral />
      {children}
    </AccountShell>
  );
}
