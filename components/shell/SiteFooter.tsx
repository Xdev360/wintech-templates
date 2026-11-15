import Link from "next/link";
import { Mark } from "./Mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-8 text-[13px] text-mute md:flex-row md:items-center md:justify-between md:px-8">
        <span className="flex items-center gap-2 text-ink">
          <Mark className="h-[14px] w-auto" /> Wintech Templates
        </span>
        <nav className="flex gap-6">
          <Link href="/templates" className="hover:text-ink">Templates</Link>
          <Link href="/login" className="hover:text-ink">Log in</Link>
          <a href="https://www.wintechstudio.com" className="hover:text-ink">Wintech Studio</a>
        </nav>
        <span>© 2026 Wintech Studio, Lagos</span>
      </div>
    </footer>
  );
}
