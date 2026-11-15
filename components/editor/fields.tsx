"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, ImagePlus, Plus, Trash2 } from "lucide-react";
import { ACCENT_PRESETS, isHex } from "@/lib/color";

/* ──────────────────────────────────────────────────────────────
   The controls the editor is made of. Small, quiet, and the same
   everywhere, so the owner learns them once.
   ────────────────────────────────────────────────────────────── */

export const input =
  "h-9 w-full rounded-[10px] bg-page px-3 text-[13px] shadow-[inset_0_0_0_1px_var(--line-2)] outline-none transition focus:shadow-[inset_0_0_0_1.5px_var(--accent)] placeholder:text-mute-2";
export const area = `${input} h-auto py-2 leading-[1.5]`;

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[12px] font-medium text-mute">{label}</span>
      {children}
      {hint ? <span className="text-[11.5px] leading-[1.45] text-mute-2">{hint}</span> : null}
    </label>
  );
}

export function IconBtn({ label, onClick, children, disabled }: { label: string; onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-[7px] text-mute transition-colors hover:bg-soft hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

/** A list the owner can add to, reorder, and remove from. */
export function Rows<T>({ rows, max, blank, onChange, render, addLabel, name }: {
  rows: T[]; max: number; blank: T; onChange: (rows: T[]) => void;
  render: (row: T, set: (row: T) => void, index: number) => ReactNode;
  addLabel: string;
  /** What one row is called, for the row header: "Product 3". */
  name: string;
}) {
  const swap = (i: number, j: number) => {
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="rounded-[11px] bg-page p-3 shadow-[inset_0_0_0_1px_var(--line)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11.5px] font-medium uppercase tracking-[0.07em] text-mute-2">{name} {i + 1}</span>
            <div className="flex gap-0.5">
              <IconBtn label="Move up" disabled={i === 0} onClick={() => swap(i, i - 1)}><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn label="Move down" disabled={i === rows.length - 1} onClick={() => swap(i, i + 1)}><ArrowDown className="h-3.5 w-3.5" /></IconBtn>
              <IconBtn label="Remove" onClick={() => onChange(rows.filter((_, k) => k !== i))}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
            </div>
          </div>
          <div className="flex flex-col gap-2">{render(row, (r) => onChange(rows.map((x, k) => (k === i ? r : x))), i)}</div>
        </div>
      ))}
      {rows.length < max ? (
        <button type="button" onClick={() => onChange([...rows, blank])} className="btn-soft w-full">
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      ) : (
        <p className="text-[11.5px] text-mute-2">That is the most this section holds.</p>
      )}
    </div>
  );
}

export function Upload({ label, url, onFile, onClear, small }: { label: string; url: string; onFile: (f: File | undefined) => void; onClear: () => void; small?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <span className="flex items-center justify-between text-[12px] font-medium text-mute">
        {label}
        {url ? <button type="button" onClick={onClear} className="text-[11.5px] font-normal underline underline-offset-2">Remove</button> : null}
      </span>
      <label className={`group relative grid cursor-pointer place-items-center overflow-hidden rounded-[10px] bg-page shadow-[inset_0_0_0_1px_var(--line-2)] transition hover:shadow-[inset_0_0_0_1.5px_var(--accent)] ${small ? "h-14" : "h-24"}`}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="flex items-center gap-1.5 text-[12px] text-mute"><ImagePlus className="h-4 w-4" /> Choose a photo</span>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
    </div>
  );
}

/** One brand colour: the presets, a colour wheel, and the code. */
export function ColourRow({ label, hint, value, fallback, onPick }: {
  label: string; hint: string; value: string; fallback: string; onPick: (hex: string) => void;
}) {
  const [text, setText] = useState(value);
  const swatches = Array.from(new Set([fallback.toUpperCase(), ...ACCENT_PRESETS]));
  return (
    <div>
      <p className="text-[12px] font-medium text-mute">{label}</p>
      <p className="mb-2 text-[11.5px] text-mute-2">{hint}</p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {swatches.map((col) => (
          <button
            key={col}
            type="button"
            role="radio"
            aria-checked={value.toUpperCase() === col}
            aria-label={col}
            onClick={() => { setText(col); onPick(col); }}
            className="grid h-7 w-7 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] transition hover:scale-105"
            style={{ background: col }}
          >
            {value.toUpperCase() === col ? <Check className="h-3.5 w-3.5 text-white mix-blend-difference" strokeWidth={3} /> : null}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={isHex(value) ? value : fallback}
          onChange={(e) => { const v = e.target.value.toUpperCase(); setText(v); onPick(v); }}
          className="h-9 w-10 cursor-pointer rounded-[9px] bg-page p-1 shadow-[inset_0_0_0_1px_var(--line-2)]"
          aria-label={`Pick any colour for ${label.toLowerCase()}`}
        />
        <input
          className={`${input} font-mono`}
          value={text}
          maxLength={7}
          aria-label={`${label} code`}
          onChange={(e) => { const v = e.target.value.trim(); setText(v); if (isHex(v)) onPick(v.toUpperCase()); }}
        />
      </div>
    </div>
  );
}
