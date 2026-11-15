import type { SiteContent } from "./site-model";

/* ──────────────────────────────────────────────────────────────
   Read and write one field of a site by name: "hero.headline",
   "items.list.2.price", "faq.0.a".

   The inline editor marks each word on the page with its path, so a
   click on the page can change exactly that field and nothing else.
   Every write still goes through sanitizeContent before it is saved.
   ────────────────────────────────────────────────────────────── */

type Any = Record<string, unknown>;

export function readAtPath(content: SiteContent, path: string): string {
  let node: unknown = content;
  for (const key of path.split(".")) {
    if (node === null || typeof node !== "object") return "";
    node = Array.isArray(node) ? node[Number(key)] : (node as Any)[key];
  }
  return typeof node === "string" ? node : "";
}

/** A copy of the content with one field changed. Unknown paths change nothing. */
export function writeAtPath(content: SiteContent, path: string, value: string): SiteContent {
  const keys = path.split(".");

  function step(node: unknown, i: number): unknown {
    if (i === keys.length) return value;
    const key = keys[i];
    if (Array.isArray(node)) {
      const index = Number(key);
      if (!Number.isInteger(index) || index < 0 || index >= node.length) return node;
      const next = [...node];
      next[index] = step(node[index], i + 1);
      return next;
    }
    if (node && typeof node === "object") {
      const obj = node as Any;
      if (!(key in obj)) return node;
      return { ...obj, [key]: step(obj[key], i + 1) };
    }
    return node;
  }

  return step(content, 0) as SiteContent;
}
