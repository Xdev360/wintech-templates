import Link from "next/link";
import { Logo, WHATSAPP } from "@/components/v4/ui";

/* ──────────────────────────────────────────────────────────────
   One frame for sign up, log in and password reset (Figma page 17,
   "Desktop / Sign up", "Log in", "Reset password", "Check your email").
   White form on the left, the window-view illustration on a dark panel
   on the right. Only the form inside changes.
   ────────────────────────────────────────────────────────────── */

export function AuthShell({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  /** Kept for older callers; the v4 frame has no step list. */
  step?: number;
  children: React.ReactNode;
}) {
  return (
    <main className="v4 grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex min-h-screen flex-col px-10 py-8 max-sm:px-5 max-sm:py-5">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="text-[14px] text-[var(--v4-m75)] hover:text-[var(--v4-ink)]">
            Need help? WhatsApp us
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] max-sm:text-[32px]">{title}</h1>
            {sub ? <p className="mt-3 text-[16px] leading-6 text-[var(--v4-m75)]">{sub}</p> : null}
            <div className="mt-8">{children}</div>
          </div>
        </div>
        <div className="flex gap-6 text-[13px] text-[var(--v4-m62)]">
          <span>© {new Date().getFullYear()} Wintech Studio</span>
          <Link href="/terms" className="hover:text-[var(--v4-ink)]">Terms</Link>
          <Link href="/privacy" className="hover:text-[var(--v4-ink)]">Privacy</Link>
        </div>
      </section>
      <aside className="flex flex-col items-center justify-center gap-6 bg-[#0a0e17] p-12 text-center text-white max-lg:hidden" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero/hero-light.svg" alt="" className="w-full max-w-[540px] border border-white/10" />
        <div>
          <p className="text-[20px] font-medium">Your site, your prices, your customers.</p>
          <p className="mt-2 text-[14px] text-white/65">Free plan. 0% cut of sales. Paystack built in.</p>
        </div>
      </aside>
    </main>
  );
}
