"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Camera, Check, Copy, Loader2, Mail, MessageCircle, MoreHorizontal, PenLine, RefreshCw, Trash2 } from "lucide-react";
import { deleteEnquiry, markEnquiryRead } from "@/app/actions/enquiries";
import { Mascot } from "@/components/v4/Mascot";

/* ──────────────────────────────────────────────────────────────
   Inbox (Figma page 24, IN1 to IN4). Messages from the site's forms on
   the left; the open message on the right with a reply Wintech AI drafts
   from what the site says. The owner checks it, then replies by email
   or copies a short version for WhatsApp. WhatsApp and Instagram
   inboxes are marked as coming soon.
   ────────────────────────────────────────────────────────────── */

export type Enquiry = {
  id: string;
  name: string;
  contact: string;
  message: string;
  source: string;
  created_at: string;
  read_at: string | null;
};

type Draft = { email: string; whatsapp: string } | { error: string } | "loading";

const isEmail = (c: string) => c.includes("@");
const waNumber = (c: string) => c.replace(/[^\d+]/g, "").replace(/^\+/, "").replace(/^0/, "234");

function when(iso: string) {
  const d = new Date(iso), now = new Date();
  const day = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
  if (day(d) === day(now)) return d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" });
  if (day(d) === day(new Date(now.getTime() - 864e5))) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function InboxView({ enquiries, siteName }: { enquiries: Enquiry[]; siteName: string }) {
  const [list, setList] = useState(enquiries);
  const [openId, setOpenId] = useState<string | null>(enquiries[0]?.id ?? null);
  const [filter, setFilter] = useState("all");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [, start] = useTransition();
  const sources = useMemo(() => Array.from(new Set(list.map((e) => e.source || "site"))), [list]);
  const shown = filter === "all" ? list : list.filter((e) => (e.source || "site") === filter);
  const open = list.find((e) => e.id === openId) ?? null;

  async function draft(id: string) {
    setDrafts((d) => ({ ...d, [id]: "loading" }));
    try {
      const res = await fetch("/api/draft-reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error === "not_configured" ? "Wintech AI is not switched on yet." : data.error === "busy" ? "Wintech AI is busy. Try again in a minute." : "The draft did not come through. Try again.");
      setDrafts((d) => ({ ...d, [id]: data }));
    } catch (e) {
      setDrafts((d) => ({ ...d, [id]: { error: e instanceof Error ? e.message : "That did not work." } }));
    }
  }

  useEffect(() => {
    if (!open) return;
    if (!open.read_at) {
      setList((l) => l.map((e) => (e.id === open.id ? { ...e, read_at: new Date().toISOString() } : e)));
      start(() => { markEnquiryRead(open.id, true).catch(() => {}); });
    }
    if (!drafts[open.id]) draft(open.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const label = (s: string) => (s === "site" ? "Contact form" : s.replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase()));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Inbox</h1>
          <p className="mt-1 text-[15px] text-[rgba(10,14,23,0.75)]">Messages from your website forms. Wintech AI drafts every reply for you to check.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", ...sources].map((s) => (
            <button key={s} type="button" onClick={() => setFilter(s)}
              className={`h-9 rounded-[2px] border px-3.5 text-[14px] ${filter === s ? "border-[var(--v4-ink)] bg-[var(--v4-ink)] text-white" : "border-[var(--v4-line)] hover:border-[var(--v4-line-2)]"}`}>
              {s === "all" ? `All · ${list.length}` : label(s)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 text-[13px] text-[rgba(10,14,23,0.62)]">
          <span className="hair flex h-9 items-center gap-2 rounded-[2px] px-3"><MessageCircle className="h-4 w-4" strokeWidth={1.5} /> WhatsApp · Coming soon</span>
          <span className="hair flex h-9 items-center gap-2 rounded-[2px] px-3 max-sm:hidden"><Camera className="h-4 w-4" strokeWidth={1.5} /> Instagram · Coming soon</span>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-start gap-3 border border-dashed border-[var(--v4-line-2)] p-8">
          <Mascot eyes="open" size={40} />
          <p className="text-[16px] font-semibold">No messages yet</p>
          <p className="max-w-[56ch] text-[14px] text-[rgba(10,14,23,0.75)]">When someone fills the form on {siteName}, it lands here and Wintech AI drafts a reply for you.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <ul className="hair self-start bg-white">
            {shown.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => setOpenId(e.id)}
                  className={`flex w-full gap-3 border-b border-[var(--v4-line)] px-4 py-3.5 text-left last:border-0 ${openId === e.id ? "bg-[rgba(59,91,255,0.05)]" : "hover:bg-[#fafafa]"}`}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f3f4f6] text-[13px] font-medium">{e.name.slice(0, 1).toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-[14px] ${e.read_at ? "font-medium" : "font-semibold"}`}>{e.name}</span>
                      <span className="shrink-0 text-[12px] text-[rgba(10,14,23,0.62)]">{when(e.created_at)}</span>
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-[2px] bg-[rgba(10,14,23,0.06)] px-1.5 py-px text-[11px] text-[rgba(10,14,23,0.75)]"><span className="h-1 w-1 rounded-full bg-current" />{label(e.source || "site")}</span>
                    <span className={`mt-1 line-clamp-2 block text-[13px] ${e.read_at ? "text-[rgba(10,14,23,0.62)]" : "text-[var(--v4-ink)]"}`}>{e.message}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {open && <Thread key={open.id} e={open} draft={drafts[open.id]} redo={() => draft(open.id)} onDelete={() => {
            setList((l) => l.filter((x) => x.id !== open.id));
            setOpenId(list.find((x) => x.id !== open.id)?.id ?? null);
            start(() => { deleteEnquiry(open.id).catch(() => {}); });
          }} onUnread={() => {
            setList((l) => l.map((x) => (x.id === open.id ? { ...x, read_at: null } : x)));
            start(() => { markEnquiryRead(open.id, false).catch(() => {}); });
          }} />}
        </div>
      )}
    </div>
  );
}

function Thread({ e, draft, redo, onDelete, onUnread }: { e: Enquiry; draft?: Draft; redo: () => void; onDelete: () => void; onUnread: () => void }) {
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const ready = draft && draft !== "loading" && !("error" in draft) ? draft : null;
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const body = text || ready?.email || "";
  const email = isEmail(e.contact);

  return (
    <section className="hair flex flex-col gap-4 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold">{e.name}</h2>
          <p className="text-[13px] text-[rgba(10,14,23,0.62)]">{e.contact} · via {e.source === "site" || !e.source ? "your contact form" : e.source}</p>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setMenu((m) => !m)} aria-label="More" className="hair grid h-8 w-8 place-items-center rounded-[2px]"><MoreHorizontal className="h-4 w-4" strokeWidth={1.5} /></button>
          {menu && (
            <div className="hair absolute right-0 top-9 z-10 w-44 bg-white py-1 shadow-[0_12px_30px_rgba(10,14,23,0.12)]">
              <button type="button" onClick={() => { setMenu(false); onUnread(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-[#fafafa]"><Mail className="h-4 w-4" strokeWidth={1.5} /> Mark as unread</button>
              <button type="button" onClick={() => { setMenu(false); onDelete(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-[#b91c1c] hover:bg-[#fef2f2]"><Trash2 className="h-4 w-4" strokeWidth={1.5} /> Delete</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#fafafa] p-4">
        <p className="text-[12px] text-[rgba(10,14,23,0.62)]">{new Date(e.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" })}</p>
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[23px]">{e.message}</p>
      </div>

      <div className="border border-[var(--v4-blue)] p-4">
        <p className="flex items-center gap-2 text-[14px] font-semibold"><Mascot eyes={ready ? "happy" : "right"} size={22} /> Draft from Wintech AI <span className="tag tag-sm tag-blue">Uses what your site says</span></p>
        {draft === "loading" || !draft ? (
          <p className="mt-3 flex items-center gap-2 text-[14px] text-[rgba(10,14,23,0.62)]"><Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> Writing a reply…</p>
        ) : "error" in draft ? (
          <p className="mt-3 flex flex-wrap items-center gap-3 text-[14px] text-[rgba(10,14,23,0.75)]">{draft.error} <button type="button" onClick={redo} className="font-medium text-[var(--v4-blue)] underline">Try again</button></p>
        ) : editing ? (
          <textarea value={body} onChange={(x) => setText(x.target.value)} rows={8} className="mt-3 w-full rounded-[2px] border border-[var(--v4-line)] p-3 text-[14px] leading-[21px] outline-none focus:border-[var(--v4-blue)]" />
        ) : (
          <p className="mt-3 whitespace-pre-wrap text-[14px] leading-[21px]">{body}</p>
        )}
      </div>

      {ready && (
        <div className="bg-[#fafafa] p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold"><MessageCircle className="h-4 w-4" strokeWidth={1.5} /> Short version for WhatsApp</p>
          <p className="mt-2 text-[14px] leading-[21px] text-[rgba(10,14,23,0.75)]">{ready.whatsapp}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {email ? (
          <a href={`mailto:${e.contact}?subject=${encodeURIComponent("Re: your message")}&body=${encodeURIComponent(body)}`} className={`btn btn-primary btn-sm ${ready ? "" : "pointer-events-none opacity-50"}`}><Mail className="h-4 w-4" strokeWidth={1.5} /> Reply by email</a>
        ) : (
          <a href={`https://wa.me/${waNumber(e.contact)}?text=${encodeURIComponent(ready?.whatsapp || "")}`} target="_blank" rel="noreferrer" className={`btn btn-primary btn-sm ${ready ? "" : "pointer-events-none opacity-50"}`}><MessageCircle className="h-4 w-4" strokeWidth={1.5} /> Reply on WhatsApp</a>
        )}
        <button type="button" disabled={!ready} onClick={() => { navigator.clipboard?.writeText(ready?.whatsapp || ""); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="btn btn-secondary btn-sm">
          {copied ? <Check className="h-4 w-4 text-[#15803d]" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />} {copied ? "Copied" : "Copy for WhatsApp"}
        </button>
        <button type="button" disabled={!ready} onClick={() => setEditing((v) => !v)} className="btn btn-ghost btn-sm"><PenLine className="h-4 w-4" strokeWidth={1.5} /> {editing ? "Done" : "Edit"}</button>
        {ready && <button type="button" onClick={() => { setText(""); redo(); }} className="btn btn-ghost btn-sm"><RefreshCw className="h-4 w-4" strokeWidth={1.5} /> New draft</button>}
      </div>
    </section>
  );
}
