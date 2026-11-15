import { createClient, supabaseConfigured } from "@/lib/supabase/server";

/** True when someone is signed in. Public pages use it only to swap
 *  "Log in" for "Dashboard", so a failure just means signed out. */
export async function isSignedIn() {
  if (!supabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return Boolean(data.user);
  } catch {
    return false;
  }
}
