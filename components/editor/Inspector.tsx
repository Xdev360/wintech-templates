"use client";

import { ArrowDown, ArrowUp, EyeOff } from "lucide-react";
import { SectionPicker } from "@/components/SectionPicker";
import type { SectionKey, SiteContent, SiteItem } from "@/lib/site-model";
import type { TemplateDef } from "@/lib/templates";
import { area, ColourRow, Field, IconBtn, input, Rows, Upload } from "./fields";

/* ──────────────────────────────────────────────────────────────
   The panel on the right: the settings for whichever part of the page
   is selected, and nothing else. One part at a time is what keeps it
   calm — the whole site's worth of fields in one column is what made
   the old editor feel like a tax form.
   ────────────────────────────────────────────────────────────── */

export type Part = "brand" | "hero" | "add" | SectionKey;

export type Ops = {
  set: (next: SiteContent) => void;
  upload: (file: File | undefined, done: (url: string) => void) => void;
  move: (k: SectionKey, by: -1 | 1) => void;
  hide: (k: SectionKey) => void;
  add: (k: SectionKey) => void;
};

export function Inspector({
  part, c, def, labels, hidden, ops,
}: {
  part: Part; c: SiteContent; def: TemplateDef; labels: Record<SectionKey, string>; hidden: SectionKey[]; ops: Ops;
}) {
  const patch = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => ops.set({ ...c, [key]: value });
  const field = <K extends "brand" | "hero" | "items" | "about" | "contact">(key: K, name: keyof SiteContent[K], value: string) =>
    ops.set({ ...c, [key]: { ...c[key], [name]: value } });

  if (part === "add") {
    return (
      <Panel title="Add a section" sub={hidden.length ? "Tap one to put it on the page. You can move it after." : "Every section is already on the page."}>
        <SectionPicker def={def} content={c} available={hidden} labels={labels} onAdd={ops.add} />
      </Panel>
    );
  }

  if (part === "brand") {
    return (
      <Panel title="Brand" sub="Your name, how to reach you, and your two colours.">
        <Field label="Business name">
          <input className={input} value={c.brand.name} maxLength={60} onChange={(e) => field("brand", "name", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Email"><input type="email" className={input} value={c.brand.email} onChange={(e) => field("brand", "email", e.target.value)} /></Field>
          <Field label="Phone"><input className={input} value={c.brand.phone} onChange={(e) => field("brand", "phone", e.target.value)} /></Field>
        </div>
        <Upload label="Logo" url={c.brand.logoUrl} small onFile={(f) => ops.upload(f, (u) => field("brand", "logoUrl", u))} onClear={() => field("brand", "logoUrl", "")} />
        <Field label="Menu words" hint="Up to five, separated by commas. Each one jumps to the matching part of the page.">
          <input
            className={input}
            value={c.nav.join(", ")}
            onChange={(e) => patch("nav", e.target.value.split(",").map((w) => w.trim()).filter(Boolean).slice(0, 5))}
          />
        </Field>
        <ColourRow label="Main colour" hint="Buttons and the band near the bottom." value={c.theme.accent} fallback={def.theme.accent} onPick={(v) => patch("theme", { ...c.theme, accent: v })} />
        <ColourRow label="Second colour" hint="Product tiles, badges, small blocks." value={c.theme.accent2} fallback={def.theme.hues[1]} onPick={(v) => patch("theme", { ...c.theme, accent2: v })} />
      </Panel>
    );
  }

  if (part === "hero") {
    return (
      <Panel title="Top of the page" sub="The first thing a visitor reads. Keep the headline short.">
        <Field label="Small line above the headline"><input className={input} value={c.hero.eyebrow} maxLength={80} onChange={(e) => field("hero", "eyebrow", e.target.value)} /></Field>
        <Field label="Headline"><textarea rows={2} className={area} value={c.hero.headline} maxLength={140} onChange={(e) => field("hero", "headline", e.target.value)} /></Field>
        <Field label="Under the headline"><textarea rows={3} className={area} value={c.hero.sub} maxLength={400} onChange={(e) => field("hero", "sub", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Button says"><input className={input} value={c.hero.cta} maxLength={32} onChange={(e) => field("hero", "cta", e.target.value)} /></Field>
          <Field label="Button goes to" hint="Leave blank to open the message form."><input className={input} value={c.hero.ctaHref} placeholder="https://…" onChange={(e) => field("hero", "ctaHref", e.target.value)} /></Field>
        </div>
        <Upload label="Main photo" url={c.hero.image} onFile={(f) => ops.upload(f, (u) => field("hero", "image", u))} onClear={() => field("hero", "image", "")} />
      </Panel>
    );
  }

  // From here on, a section of the page: it can be moved or hidden.
  const k = part;
  const i = c.sections.indexOf(k);
  const controls = (
    <div className="flex gap-0.5">
      <IconBtn label="Move up" disabled={i <= 0} onClick={() => ops.move(k, -1)}><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
      <IconBtn label="Move down" disabled={i < 0 || i >= c.sections.length - 1} onClick={() => ops.move(k, 1)}><ArrowDown className="h-3.5 w-3.5" /></IconBtn>
      <IconBtn label="Hide this section" onClick={() => ops.hide(k)}><EyeOff className="h-3.5 w-3.5" /></IconBtn>
    </div>
  );

  if (k === "items") {
    const store = def.kind === "store";
    const word = labels.items.toLowerCase().replace(/s$/, "");
    return (
      <Panel title={labels.items} sub={store ? "Anything with a price can be bought. Leave the price empty for 'ask us'." : "What you offer."} controls={controls}>
        <Field label="Section title"><input className={input} value={c.items.title} maxLength={60} onChange={(e) => field("items", "title", e.target.value)} /></Field>
        {store ? (
          <>
            <datalist id="wt-categories">
              {Array.from(new Set(c.items.list.map((x) => (x.category || "").trim()).filter(Boolean))).map((cat) => <option key={cat} value={cat} />)}
            </datalist>
            <p className="text-[11.5px] leading-[1.5] text-mute-2">
              Give two or more products a category and filter buttons appear above the grid. Stock counts down as people order; blank means it never runs out.
            </p>
          </>
        ) : null}
        <Rows
          rows={c.items.list}
          max={12}
          name={word.charAt(0).toUpperCase() + word.slice(1)}
          blank={{ title: `New ${word}`, meta: "", price: "", image: "" }}
          onChange={(list) => patch("items", { ...c.items, list })}
          addLabel={`Add a ${word}`}
          render={(it: SiteItem, set) => (
            <>
              <input className={input} value={it.title} placeholder="Name" onChange={(e) => set({ ...it, title: e.target.value })} />
              <div className="grid grid-cols-[1fr_112px] gap-2">
                <input className={input} value={it.meta} placeholder={def.kind === "booking" ? "How long it takes" : "A few words"} onChange={(e) => set({ ...it, meta: e.target.value })} />
                <input className={input} value={it.price} placeholder="₦12,000" inputMode="numeric" onChange={(e) => set({ ...it, price: e.target.value })} />
              </div>
              {store ? (
                <div className="grid grid-cols-[1fr_112px] gap-2">
                  <input
                    className={input}
                    value={it.category || ""}
                    placeholder="Category, e.g. Cakes"
                    list="wt-categories"
                    maxLength={30}
                    onChange={(e) => set({ ...it, category: e.target.value })}
                  />
                  <input
                    className={input}
                    value={it.stock ?? ""}
                    placeholder="Stock"
                    inputMode="numeric"
                    title="How many you have. Leave blank if it never runs out."
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      set({ ...it, stock: v === "" ? null : Math.min(99999, Number(v)) });
                    }}
                  />
                </div>
              ) : null}
              {store || def.kind === "portfolio" ? (
                <Upload label="Photo" url={it.image} small onFile={(f) => ops.upload(f, (u) => set({ ...it, image: u }))} onClear={() => set({ ...it, image: "" })} />
              ) : null}
            </>
          )}
        />
        <Field label="A line under the list" hint="Delivery, deposits, opening hours — whatever a buyer should know."><input className={input} value={c.items.note} maxLength={160} onChange={(e) => field("items", "note", e.target.value)} /></Field>
      </Panel>
    );
  }

  if (k === "stats") {
    return (
      <Panel title="Numbers" sub="Only real ones. Years in business, orders delivered, clients served." controls={controls}>
        <Rows rows={c.stats} max={4} name="Number" blank={{ value: "", label: "" }} onChange={(stats) => patch("stats", stats)} addLabel="Add a number"
          render={(s, set) => (
            <div className="grid grid-cols-[96px_1fr] gap-2">
              <input className={input} value={s.value} placeholder="120+" onChange={(e) => set({ ...s, value: e.target.value })} />
              <input className={input} value={s.label} placeholder="happy customers" onChange={(e) => set({ ...s, label: e.target.value })} />
            </div>
          )} />
      </Panel>
    );
  }

  if (k === "about") {
    return (
      <Panel title="About" sub="Who you are, in a few honest lines." controls={controls}>
        <Field label="Title"><input className={input} value={c.about.title} maxLength={80} onChange={(e) => field("about", "title", e.target.value)} /></Field>
        <Field label="Text"><textarea rows={5} className={area} value={c.about.body} maxLength={800} onChange={(e) => field("about", "body", e.target.value)} /></Field>
      </Panel>
    );
  }

  if (k === "testimonials") {
    return (
      <Panel title="Reviews" sub="Real words from real customers. The samples are there to be replaced." controls={controls}>
        <Rows rows={c.testimonials} max={6} name="Review" blank={{ quote: "", name: "", role: "" }} onChange={(t) => patch("testimonials", t)} addLabel="Add a review"
          render={(t, set) => (
            <>
              <textarea rows={2} className={area} value={t.quote} placeholder="What they said" onChange={(e) => set({ ...t, quote: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className={input} value={t.name} placeholder="Their name" onChange={(e) => set({ ...t, name: e.target.value })} />
                <input className={input} value={t.role} placeholder="Customer, Lekki" onChange={(e) => set({ ...t, role: e.target.value })} />
              </div>
            </>
          )} />
      </Panel>
    );
  }

  if (k === "faq") {
    return (
      <Panel title="Questions" sub="The things people ask before they buy. Answer them here and they will not have to ask." controls={controls}>
        <Rows rows={c.faq} max={10} name="Question" blank={{ q: "", a: "" }} onChange={(faq) => patch("faq", faq)} addLabel="Add a question"
          render={(f, set) => (
            <>
              <input className={input} value={f.q} placeholder="How long does delivery take?" onChange={(e) => set({ ...f, q: e.target.value })} />
              <textarea rows={2} className={area} value={f.a} placeholder="Lagos in one to two days." onChange={(e) => set({ ...f, a: e.target.value })} />
            </>
          )} />
      </Panel>
    );
  }

  return (
    <Panel title="Get in touch" sub="The band near the bottom, with the message form under it." controls={controls}>
      <Field label="Title"><input className={input} value={c.contact.title} maxLength={80} onChange={(e) => field("contact", "title", e.target.value)} /></Field>
      <Field label="Line under it"><input className={input} value={c.contact.line} maxLength={160} onChange={(e) => field("contact", "line", e.target.value)} /></Field>
      <p className="text-[11.5px] leading-[1.5] text-mute-2">Messages sent from this form land in your Inbox.</p>
    </Panel>
  );
}

function Panel({ title, sub, controls, children }: { title: string; sub?: string; controls?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold tracking-[-0.01em]">{title}</h2>
          {sub ? <p className="mt-0.5 text-[12px] leading-[1.5] text-mute">{sub}</p> : null}
        </div>
        {controls}
      </div>
      {children}
    </div>
  );
}
