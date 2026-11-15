import { createBrowserClient } from "@supabase/ssr";

/* Pass cookieOptions to change how long the sign-in lasts: the login form
   uses a short one when "Remember me" is unticked. Without it, the default
   client is shared, which is what every other caller wants. */
export function createClient(cookieOptions?: { maxAge: number }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars are missing.");
  }
  return cookieOptions
    ? createBrowserClient(url, key, { cookieOptions, isSingleton: false })
    : createBrowserClient(url, key);
}
