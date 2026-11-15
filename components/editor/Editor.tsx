"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Eye, EyeOff, Monitor, Palette, Plus, Smartphone, Sparkles } from "lucide-react";
import { saveSiteContent } from "@/app/actions/sites";
import { ROOT_DOMAIN } from "@/lib/config";
import { sectionSeed } from "@/lib/section-seed";
import { SECTION_KEYS, templateFor, type SectionKey, type SiteContent } from "@/lib/site-model";
import { writeAtPath } from "@/lib/site-path";
import { createClient } from "@/lib/supabase/client";
import type { Site } from "@/lib/types";
import { Inspector, type Part } from "./Inspector";
import { LivePreview } from "./LivePreview";

/* ──────────────────────────────────────────────────────────────
   The site editor.

     ┌ name · link ──────────────── desktop/phone ──── saved · Save ┐
     │ parts of the page │ the page itself      │ the selected part │
     │  Brand            │ (click words to      │ (only its fields) │
     │  Top of the page  │  type, click photos  │                   │
     │  Products         │  to change them)     │                   │
     │  About …          │                      │                   │
     │  + Add a section  │                      │                   │
     └───────────────────┴──────────────────────┴───────────────────┘

   Three columns and one idea: you are always looking at the page, and
   the panel only ever shows the part you are on. Click a part on the
   page or in the list — either way the other two follow.
   ────────────────────────────────────────────────────────────── */

const CANVAS = 1280;
const PHONE = 390;

const FIXED: { id: Part; label: string; icon: typeof Palette }[] = [
  { id: "brand", label: "Brand & colours", icon: Palette },
  { id: "hero", label: "Top of the page", icon: Sparkles },
];

const ITEM_WORD = { store: "Products", booking: "Services", portfolio: "Projects", landing: "Points" } as const;

export function Editor({ site, userId, initialPart = "hero" }: { site: Site; userId: string; initialPart?: Part }) {
  const router = useRouter();
  const def = templateFor(site.template);
  const itemsLabel = def.engine === "reservation" ? "Menu" : ITEM_WORD[def.kind];
  const labels: Record<SectionKey, string> = {
    stats: "Numbers", items: itemsLabel, about: "About", testimonials: "Reviews", faq: "Questions", contact: "Get in touch",
  };

  const [c, setC] = useState<SiteContent>(site.content);
  const [saved, setSaved] = useState<SiteContent>(site.content);
  const [part, setPart] = useState<Part>(initialPart);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const dirty = c !== saved;

  const canvas = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.6);
  const photoFor = useRef("");
  const photoInput = useRef<HTMLInputElement>(null);
  const live = `https://${site.slug}.${ROOT_DOMAIN}`;

  /* The page is drawn at desktop width and shrunk to fit its column.
     `zoom` rather than a transform, so clicks and the typing caret land
     where the eye expects. */
  useLayoutEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const fit = () => setZoom(Math.min(1, (el.clientWidth - 2) / (device === "phone" ? PHONE : CANVAS)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [device]);

  /* The selected part wears a ring on the page, and comes into view when
     chosen from the list. */
  useEffect(() => {
    const root = canvas.current;
    if (!root) return;
    root.querySelectorAll(".is-selected").forEach((n) => n.classList.remove("is-selected"));
    const target =
      part === "brand" ? root.querySelector("header.tpl-nav")
      : part === "add" ? null
      : root.querySelector(`#${part}`);
    target?.classList.add("is-selected");
  }, [part, c]);

  function choose(next: Part) {
    setPart(next);
    const root = canvas.current;
    const target = next === "brand" ? root?.querySelector("header.tpl-nav") : next === "add" ? null : root?.querySelector(`#${next}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* Leaving with unsaved work asks first. */
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /* ⌘S saves, the way every editor on earth does. */
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  async function upload(file: File | undefined, done: (url: string) => void) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return setNote("That photo is over 8 MB. Try a smaller one.");
    setNote("Uploading…");
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${site.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-media").upload(path, file, { upsert: true });
    if (error) return setNote(error.message);
    done(supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl);
    setNote("");
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    setNote("");
    const result = await saveSiteContent(site.id, c, site.name);
    setBusy(false);
    if (result.error) return setNote(result.error);
    setSaved(c);
    router.refresh();
  }

  const hidden = SECTION_KEYS.filter((k) => !c.sections.includes(k));
  const ops = {
    set: setC,
    upload,
    move: (k: SectionKey, by: -1 | 1) => {
      const i = c.sections.indexOf(k), j = i + by;
      if (i < 0 || j < 0 || j >= c.sections.length) return;
      const next = [...c.sections];
      [next[i], next[j]] = [next[j], next[i]];
      setC({ ...c, sections: next });
    },
    hide: (k: SectionKey) => {
      setC({ ...c, sections: c.sections.filter((x) => x !== k) });
      setPart("hero");
    },
    add: (k: SectionKey) => {
      // New sections go above the contact band, which stays last.
      const rest = c.sections.filter((x) => x !== k && x !== "contact");
      const end: SectionKey[] = c.sections.includes("contact") && k !== "contact" ? ["contact"] : [];
      setC({ ...c, ...sectionSeed(c, def, k), sections: [...rest, k, ...end] });
      setPart(k);
    },
  };

  return (
    <div className="-mx-4 -my-5 flex h-[calc(100vh-52px-16px)] flex-col sm:-mx-6 lg:-mx-8 lg:-my-7">
      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const path = photoFor.current;
          upload(e.target.files?.[0], (url) => setC((x) => writeAtPath(x, path, url)));
          e.target.value = "";
        }}
      />

      {/* ── Top bar ────────────────────────────────────────────── */}
      <div className="flex h-[52px] shrink-0 items-center justify-between gap-4 border-b border-line px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-[13.5px] font-medium">{site.name}</span>
          <a href={live} target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-[12px] text-mute hover:text-ink sm:inline-flex">
            {site.slug}.{ROOT_DOMAIN} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="flex rounded-[10px] bg-soft p-0.5" role="group" aria-label="Screen size">
          {(["desktop", "phone"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              aria-pressed={device === d}
              className={`grid h-7 w-9 place-items-center rounded-[8px] transition ${device === d ? "bg-page text-ink shadow-[0_0_0_1px_var(--line)]" : "text-mute"}`}
              aria-label={d === "desktop" ? "Show on a computer" : "Show on a phone"}
            >
              {d === "desktop" ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {note ? <span className="max-w-[240px] truncate text-[12px] text-mute" role="status">{note}</span>
            : dirty ? <span className="text-[12px] text-mute">Unsaved changes</span>
            : <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600"><Check className="h-3.5 w-3.5" /> Saved</span>}
          <button type="button" onClick={save} disabled={busy || !dirty} className="btn-primary disabled:opacity-50">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* ── Three columns ──────────────────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-[224px_minmax(0,1fr)_336px]">
        {/* The parts of the page */}
        <nav className="overflow-y-auto border-r border-line p-3" aria-label="Parts of the page">
          <p className="px-2 pb-1.5 pt-1 text-[11px] font-medium text-mute-2">On the page</p>
          {FIXED.map((f) => (
            <Row key={f.id} active={part === f.id} onClick={() => choose(f.id)} icon={<f.icon className="h-3.5 w-3.5" />} label={f.label} />
          ))}
          {c.sections.map((k) => (
            <Row
              key={k}
              active={part === k}
              onClick={() => choose(k)}
              label={labels[k]}
              trailing={
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); ops.hide(k); }}
                  className="grid h-6 w-6 place-items-center rounded-[6px] text-mute-2 opacity-0 transition hover:bg-page hover:text-ink group-hover:opacity-100"
                  aria-label={`Hide ${labels[k]}`}
                  title="Hide"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                </button>
              }
            />
          ))}

          {hidden.length ? (
            <>
              <p className="px-2 pb-1.5 pt-4 text-[11px] font-medium text-mute-2">Not shown</p>
              {hidden.map((k) => (
                <Row
                  key={k}
                  muted
                  onClick={() => ops.add(k)}
                  label={labels[k]}
                  trailing={<Eye className="h-3.5 w-3.5 text-mute-2" />}
                />
              ))}
            </>
          ) : null}

          <button
            type="button"
            onClick={() => choose("add")}
            className={`mt-3 flex h-8 w-full items-center gap-2 rounded-[8px] px-2 text-[12.5px] ${part === "add" ? "bg-soft text-ink" : "text-mute hover:bg-soft hover:text-ink"}`}
          >
            <Plus className="h-3.5 w-3.5" /> Add a section
          </button>
        </nav>

        {/* The page */}
        <div ref={canvas} className="min-w-0 overflow-y-auto bg-soft/60 p-4">
          <div
            className="mx-auto overflow-hidden rounded-[14px] bg-page shadow-[0_0_0_1px_var(--line),0_24px_60px_-40px_rgba(0,0,0,0.5)]"
            style={{ width: (device === "phone" ? PHONE : CANVAS) * zoom }}
          >
            <div style={{ zoom, width: device === "phone" ? PHONE : CANVAS }}>
              <LivePreview
                template={def}
                content={c}
                slug={site.slug}
                editing
                onChange={setC}
                onPickImage={(path) => { photoFor.current = path; photoInput.current?.click(); }}
                onSelect={(id) => setPart(id as Part)}
              />
            </div>
          </div>
          <p className="mx-auto mt-3 max-w-[52ch] text-center text-[11.5px] text-mute-2">
            Click any words on the page to change them. Click a photo to swap it.
          </p>
        </div>

        {/* The selected part */}
        <aside className="overflow-y-auto border-l border-line">
          <Inspector part={part} c={c} def={def} labels={labels} hidden={hidden} ops={ops} />
        </aside>
      </div>
    </div>
  );
}

function Row({ label, icon, trailing, active, muted, onClick }: {
  label: string; icon?: React.ReactNode; trailing?: React.ReactNode; active?: boolean; muted?: boolean; onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={`group flex h-8 cursor-pointer items-center gap-2 rounded-[8px] px-2 text-[12.5px] transition-colors ${
        active ? "bg-page font-medium text-ink shadow-[0_0_0_1px_var(--line)]" : muted ? "text-mute-2 hover:bg-soft hover:text-mute" : "text-ink/80 hover:bg-soft hover:text-ink"
      }`}
    >
      {icon ? <span className={active ? "text-ink" : "text-mute"}>{icon}</span> : <span className="h-1.5 w-1.5 rounded-full bg-line-2" />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </div>
  );
}
