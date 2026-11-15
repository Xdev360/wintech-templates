"use client";

import { useEffect, useState } from "react";

/* The glass notice from the reference, with the truth in it. This site
   sets only the cookie that keeps you signed in, which needs no
   consent, so there is nothing to accept or decline. If analytics are
   added later, this becomes a real choice with a real Decline. */
export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("wt-cookies-seen")) {
        const t = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);
  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Cookies"
      className="glass fixed bottom-3 left-3 right-3 z-50 flex items-center gap-3 !rounded-[13px] p-2.5 shadow-[0_24px_50px_-20px_rgba(35,39,50,0.45)] sm:left-auto sm:bottom-5 sm:right-5 sm:max-w-[340px]"
    >
      <p className="min-w-0 flex-1 text-[12px] leading-[1.45] text-mute">
        One cookie, to keep you signed in. No tracking.
      </p>
      <button
        type="button"
        className="btn-primary shrink-0 !h-8 !px-3"
        onClick={() => {
          try { localStorage.setItem("wt-cookies-seen", "1"); } catch {}
          setShow(false);
        }}
      >
        Got it
      </button>
    </div>
  );
}
