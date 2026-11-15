import type { SupabaseClient } from "@supabase/supabase-js";

/* A referral code travels from a link (?ref=CODE) to the moment an
   account exists. If sign-up needs an email confirmation, the code
   waits in the browser until the person is back and signed in. */

const KEY = "wt_ref";

export function rememberRef(code: string | undefined | null) {
  if (!code) return;
  try {
    localStorage.setItem(KEY, code.slice(0, 12).toUpperCase());
  } catch {
    // Private windows refuse storage. The link still works, the credit
    // is simply not claimed, which is better than an error.
  }
}

/** Claim whatever code is waiting. The database enforces the rules. */
export async function claimRef(supabase: SupabaseClient, code?: string | null) {
  let value = code || "";
  if (!value) {
    try {
      value = localStorage.getItem(KEY) || "";
    } catch {
      return;
    }
  }
  if (!value) return;
  try {
    await Promise.all([
      supabase.rpc("claim_referral", { p_code: value }),
      supabase.rpc("attach_affiliate", { p_code: value }),
    ]);
  } catch {
    // Not run yet, or already claimed. Neither is worth interrupting for.
  }
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clean up */
  }
}
