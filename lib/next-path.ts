/** Where to send someone after they sign in. Only paths on this site:
 *  "/dashboard/new" is fine, "//evil.com" and "@evil.com" are not, since
 *  either would turn a login link into a redirect to someone else's site. */
export function safeNext(value: unknown, fallback = "/dashboard") {
  const v = typeof value === "string" ? value : "";
  return /^\/(?![/\\])[\w\-./?=&%]*$/.test(v) ? v : fallback;
}

/** The page to land on after sign-up.
 *
 *  An explicit `next` wins — someone who clicked "Become an affiliate"
 *  should arrive at the affiliate page, not at their sites. Otherwise it
 *  carries a chosen template or name to the new-site page. */
export function nextFor(params: { template?: string; name?: string; next?: string }) {
  if (params.next) return safeNext(params.next);
  const q = new URLSearchParams();
  if (params.template) q.set("template", params.template.slice(0, 60));
  if (params.name) q.set("name", params.name.slice(0, 60));
  return q.size ? `/dashboard/new?${q}` : "/dashboard";
}
