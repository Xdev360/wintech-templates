import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { nextFor } from "@/lib/next-path";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ template?: string; name?: string; next?: string }> }) {
  const next = nextFor(await searchParams);
  return (
    <AuthShell title="Welcome back" sub="Log in to keep building your site." step={0}>
      <AuthForm mode="login" next={next} />
    </AuthShell>
  );
}
