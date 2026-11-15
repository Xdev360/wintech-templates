import { headers } from "next/headers";
import { ROOT_DOMAIN } from "./config";

/* ──────────────────────────────────────────────────────────────
   Where things live, as full addresses.

   A customer's site is served from their own host, but anything the
   platform serves — the link preview image, for one — comes from the
   app's host. On a laptop both are localhost, so this works there too.
   ────────────────────────────────────────────────────────────── */

async function host() {
  return (await headers()).get("host") || `app.${ROOT_DOMAIN}`;
}

function isLocal(h: string) {
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(h);
}

/** The platform's own address: where the app and its API answer. */
export async function appOrigin() {
  const h = await host();
  return isLocal(h) ? `http://${h}` : `https://app.${ROOT_DOMAIN}`;
}

/** A published site's address. */
export async function siteUrl(slug: string) {
  const h = await host();
  return isLocal(h) ? `http://${h}/view/${slug}` : `https://${slug}.${ROOT_DOMAIN}`;
}
