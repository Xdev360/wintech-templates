import { ClaimReferral } from "@/components/auth/ClaimReferral";
import { Shell } from "@/components/dashboard/Shell";
import { loadDashboard } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function SiteDashboardLayout({ children, params }: LayoutProps<"/dashboard/[id]">) {
  const { id } = await params;
  const d = await loadDashboard(id);
  return (
    <Shell base={`/dashboard/${id}`} site={d.shellSite} sites={d.sites} user={d.user} credits={d.credits}>
      <ClaimReferral />
      {children}
    </Shell>
  );
}
