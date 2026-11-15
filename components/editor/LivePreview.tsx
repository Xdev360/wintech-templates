"use client";

import { useRef, useState } from "react";
import { ImagePlus, Pencil } from "lucide-react";
import { TemplateSite } from "@/components/templates/TemplateSite";
import type { SiteContent } from "@/lib/site-model";
import { writeAtPath } from "@/lib/site-path";
import type { TemplateDef } from "@/lib/templates";

/* ──────────────────────────────────────────────────────────────
   The site, editable where you see it.

   Click any word on the page and type over it. Click any photo and
   pick a new one. Nothing here knows about particular fields: each
   element carries the name of the content it came from, so this works
   for every template and every section, now and later.

   The side panel still exists for the things a page cannot show:
   reordering sections, deleting a row, the colour picker.
   ────────────────────────────────────────────────────────────── */

export function LivePreview({
  template,
  content,
  slug,
  onChange,
  onPickImage,
  onSelect,
  editing,
}: {
  template: TemplateDef;
  content: SiteContent;
  /** Shown so the owner sees the message form their visitors get. */
  slug: string;
  onChange: (next: SiteContent) => void;
  /** Asks the page above for a file, and returns where it ended up. */
  onPickImage: (path: string) => void;
  /** Which part of the page was clicked: "hero", "items", "brand"… */
  onSelect?: (id: string) => void;
  editing: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("");

  /** Put the caret in a word and let the browser handle typing. */
  function startEditing(el: HTMLElement, path: string) {
    setActive(path);
    el.contentEditable = "plaintext-only";
    el.spellcheck = false;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  function stopEditing(el: HTMLElement, path: string) {
    const text = (el.innerText || "").replace(/\s+\n/g, "\n").trim();
    el.contentEditable = "false";
    setActive("");
    // Quotation marks are drawn by the template, not stored in the content.
    const clean = path.includes(".quote") ? text.replace(/^[“"]|[”"]$/g, "") : text;
    if (clean !== readText(content, path)) onChange(writeAtPath(content, path, clean));
  }

  function onClick(e: React.MouseEvent) {
    if (!editing) return;
    const target = e.target as HTMLElement;

    // Tell the editor which part of the page was clicked, so its panel can
    // show that part's settings. The header counts as the brand.
    const part = target.closest<HTMLElement>("section[id], header.tpl-nav, footer.tpl-foot");
    if (part) onSelect?.(part.tagName === "SECTION" ? part.id : "brand");

    const picture = target.closest<HTMLElement>("[data-edit-image]");
    if (picture) {
      e.preventDefault();
      onPickImage(picture.dataset.editImage || "");
      return;
    }

    const word = target.closest<HTMLElement>("[data-edit]");
    if (!word) return;
    e.preventDefault();
    const path = word.dataset.edit || "";
    if (path && path !== active) startEditing(word, path);
  }

  function onBlur(e: React.FocusEvent) {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-edit]");
    if (el?.isContentEditable) stopEditing(el, el.dataset.edit || "");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-edit]");
    if (!el?.isContentEditable) return;
    if (e.key === "Escape") {
      el.innerText = readText(content, el.dataset.edit || "");
      el.blur();
    }
    // Enter finishes a heading; long copy keeps multi-line editing.
    if (e.key === "Enter" && !e.shiftKey && !/\.(body|sub|a|line|note)$/.test(el.dataset.edit || "")) {
      e.preventDefault();
      el.blur();
    }
  }

  return (
    <div
      ref={box}
      onClick={onClick}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className={editing ? "edit-live" : undefined}
      data-editing={editing || undefined}
    >
      <TemplateSite template={template} content={content} slug={slug} editable={editing} />
    </div>
  );
}

/** The stored value behind a marked element, for Escape and comparison. */
function readText(content: SiteContent, path: string) {
  // Kept local so the component has one import less; same rules as readAtPath.
  let node: unknown = content;
  for (const key of path.split(".")) {
    if (node === null || typeof node !== "object") return "";
    node = Array.isArray(node) ? node[Number(key)] : (node as Record<string, unknown>)[key];
  }
  return typeof node === "string" ? node : "";
}

/** The bar that says what the page is in, shown above the preview. */
export function EditHint({ editing }: { editing: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-mute">
      {editing ? (
        <>
          <Pencil className="h-3.5 w-3.5" /> Click any words to change them
          <span className="mx-1 text-mute-2">·</span>
          <ImagePlus className="h-3.5 w-3.5" /> click a photo to replace it
        </>
      ) : (
        "Preview"
      )}
    </span>
  );
}
