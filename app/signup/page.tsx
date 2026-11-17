import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { nextFor } from "@/lib/next-path";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ template?: string; name?: string; ref?: string; next?: string }> }) {
  const params = await searchParams;
  const next = nextFor(params);
  return (
    <AuthShell title="Create your free site" sub="Start on the Free plan. Upgrade when you want your own domain.">
      <SignupForm next={next} referral={params.ref} />
    </AuthShell>
  );
}
