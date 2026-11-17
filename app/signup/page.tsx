import type { Metadata } from "next";
import { AuthBackdrop } from "@/components/v4/AuthBackdrop";
import { AuthModal } from "@/components/v4/AuthModal";
import { nextFor } from "@/lib/next-path";

export const metadata: Metadata = { title: "Create your free account · Wintech Templates" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ template?: string; name?: string; ref?: string; next?: string }> }) {
  const params = await searchParams;
  return (
    <AuthBackdrop>
      <AuthModal mode="signup" next={nextFor(params)} referral={params.ref} />
    </AuthBackdrop>
  );
}
