"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* Page change (Figma "00 · v5 changes", Loading and states): a 2px blue
   bar runs along the top while the next page loads. It waits 120ms, so a
   fast page never flashes it, and finishes when the new page is in. */
export function RouteBar() {
  const path = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "run" | "done">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("run"), 120);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  /* The page changed: finish the bar (state adjusted during render). */
  const key = `${path}?${search}`;
  const [seenKey, setSeenKey] = useState(key);
  if (key !== seenKey) {
    setSeenKey(key);
    if (state === "run") setState("done");
  }
  useEffect(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  }, [key]);
  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), state === "done" ? 600 : 10000);
    return () => clearTimeout(t);
  }, [state]);

  if (state === "idle") return null;
  return <div className={`route-bar ${state === "done" ? "done" : ""}`} role="progressbar" aria-label="Loading the next page" />;
}
