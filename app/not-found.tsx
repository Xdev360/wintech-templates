import Link from "next/link";
import { ROOT_DOMAIN } from "@/lib/config";

/* ──────────────────────────────────────────────────────────────
   Shown for a page that does not exist — including a customer's
   address that is not taken yet, or a site its owner has hidden.

   Most people who land here typed a name into the address bar, so the
   page answers the question they actually have: is this name free?
   ────────────────────────────────────────────────────────────── */

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-[440px] text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-mute-2">Not found</p>
        <h1 className="mt-3 text-[26px] font-semibold leading-[1.1] tracking-[-0.03em]">
          There is nothing here yet
        </h1>
        <p className="mx-auto mt-3 max-w-[38ch] text-[13.5px] leading-[1.6] text-mute">
          This page has moved, or this address has not been claimed. If it is a name you want, it
          may still be free.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/#domain" className="btn-primary">Check if the name is free</Link>
          <Link href="/templates" className="btn-soft">See the templates</Link>
        </div>
        <p className="mt-8 text-[12px] text-mute-2">
          Websites for small businesses, from Wintech Studio in Lagos · {ROOT_DOMAIN}
        </p>
      </div>
    </main>
  );
}
