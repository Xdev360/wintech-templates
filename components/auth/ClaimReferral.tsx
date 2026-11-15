"use client";

import { useEffect, useRef } from "react";
import { claimRef } from "@/lib/referral";
import { createClient } from "@/lib/supabase/client";

/* ──────────────────────────────────────────────────────────────
   Signing up with Google means leaving this site for Google and
   coming back, so the referral code cannot be claimed in the form
   the way a password sign-up claims it. It waits in the browser
   instead, and this claims it on the first dashboard page the new
   account sees.

   Claiming twice is harmless — the database refuses a second claim —
   and with no code waiting this does nothing at all.
   ────────────────────────────────────────────────────────────── */

export function ClaimReferral() {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    let waiting = "";
    try {
      waiting = localStorage.getItem("wt_ref") || "";
    } catch {
      return; // A private window keeps nothing. Nothing to claim.
    }
    if (!waiting) return;
    void claimRef(createClient());
  }, []);

  return null;
}
