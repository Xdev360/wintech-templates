import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./ui";

/* The marketing page behind the sign-up and log-in modal (Figma page 24, SU1 to SU8). */
export function AuthBackdrop({ children }: { children: ReactNode }) {
  return (
    <main className="v4 bg-grid min-h-screen">
      <div aria-hidden="true">
        <header className="border-b border-[var(--v4-line)]">
          <div className="wrap flex h-[74px] items-center justify-between">
            <Logo />
            <nav className="flex gap-8 text-[14px] font-medium max-sm:hidden">
              <Link href="/templates" tabIndex={-1}>Templates</Link>
              <Link href="/pricing" tabIndex={-1}>Pricing</Link>
              <Link href="/sell" tabIndex={-1}>For designers</Link>
            </nav>
          </div>
        </header>
        <section className="wrap pt-[110px]">
          <h1 className="h1">Your business online today.</h1>
          <p className="intro mt-5 max-w-[640px]">Pick a template, tell Wintech AI about your business, and start selling with Paystack.</p>
        </section>
      </div>
      {children}
    </main>
  );
}
