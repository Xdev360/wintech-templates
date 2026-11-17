import type { Metadata } from "next";
import { AuthBackdrop } from "@/components/v4/AuthBackdrop";
import { AuthModal } from "@/components/v4/AuthModal";
import { nextFor } from "@/lib/next-path";

export const metadata: Metadata = { title: "Log in · Wintech Templates" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ template?: string; name?: string; next?: string }> }) {
  return (
    <AuthBackdrop>
      <AuthModal mode="login" next={nextFor(await searchParams)} />
    </AuthBackdrop>
  );
}
