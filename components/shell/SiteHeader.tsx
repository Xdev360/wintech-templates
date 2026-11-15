import Link from "next/link";
import { Mark } from "./Mark";

/* Fixed glass navigation, as on wintechstudio.com: clear over the hero so
   the illustration's blue shows through, frosted once you scroll. Pages
   without a full-bleed hero get a spacer so nothing hides under it. */
export function SiteHeader({ signedIn = false, overlay = false }: { signedIn?: boolean; overlay?: boolean }) {
  return (
    <>
      <header className="glass-nav fixed inset-x-0 top-0 z-40" data-overlay={overlay || undefined}>
        <div className="mx-auto grid h-[56px] max-w-[1180px] grid-cols-[1fr_auto] items-center px-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-ink">
            <Mark />
            Wintech <span className="hidden font-normal text-mute sm:inline">Templates</span>
          </Link>
          <nav className="hidden items-center gap-1 text-[13px] text-ink md:flex">
            {[
              { href: "/templates", label: "Templates" },
              { href: "/#how", label: "How it works" },
              { href: "/sell", label: "Sell templates" },
              { href: "/#faq", label: "Questions" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-[9px] px-2.5 py-1.5 transition-colors hover:bg-ink/[0.06]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-2">
            {signedIn ? (
              <Link href="/dashboard" className="btn-primary whitespace-nowrap">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn-soft whitespace-nowrap">Log in</Link>
                <Link href="/signup" className="btn-primary whitespace-nowrap">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>
      {overlay ? null : <div className="h-[56px]" aria-hidden="true" />}
    </>
  );
}
