"use client";

import Link from "next/link";
import { useEffect } from "react";

/* ──────────────────────────────────────────────────────────────
   Shown when something breaks.

   A customer must never see a stack trace on their own website, and a
   visitor must never see one at all. The details go to the server log,
   where we can read them; the page says what happened in one line and
   offers the two things that help: try again, or go home.
   ────────────────────────────────────────────────────────────── */

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[wintech] page error", error.digest, error.message);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-[440px] text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-mute-2">Something broke</p>
        <h1 className="mt-3 text-[26px] font-semibold leading-[1.1] tracking-[-0.03em]">
          That did not load
        </h1>
        <p className="mx-auto mt-3 max-w-[38ch] text-[13.5px] leading-[1.6] text-mute">
          It is our fault, not yours. Try again — and if it keeps happening, tell us and we will
          look at it.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-soft">Go home</Link>
        </div>
        {error.digest ? (
          <p className="mt-8 text-[12px] text-mute-2">Reference: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
