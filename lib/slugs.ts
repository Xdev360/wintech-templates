import { RESERVED_SLUGS } from "./config";

export function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugError(slug: string) {
  if (slug.length < 3 || slug.length > 48) {
    return "Use 3 to 48 letters, numbers, or hyphens.";
  }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])$/.test(slug)) {
    return "Start and end with a letter or number.";
  }
  if (RESERVED_SLUGS.has(slug)) {
    return "That name is reserved. Try another.";
  }
  return null;
}

export function tenantSlugFromHost(host: string, rootDomain: string) {
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === `app.${rootDomain}` || hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }
  if (hostname.endsWith(`.${rootDomain}`)) {
    const slug = hostname.slice(0, -(rootDomain.length + 1));
    return slug.includes(".") ? null : slug;
  }
  if (hostname.endsWith(".localhost")) {
    return hostname.slice(0, -".localhost".length);
  }
  return null;
}
