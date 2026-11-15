"use client";

import { useState, useTransition } from "react";
import { Check, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { deleteEnquiry, markEnquiryRead } from "@/app/actions/enquiries";
import { Dashed, Label, PageHeader, Pill } from "./ui";

/* ──────────────────────────────────────────────────────────────
   Messages from a site's own visitors.

   Every message shows how to answer it in one tap: WhatsApp or a call
   for a phone number, email for an address. Answering happens where
   the customer already is, not inside a dashboard nobody lives in.
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

export function InboxView({ enquiries, siteName }: { enquiries: Enquiry[]; siteName: string }) {
  const [pending, start] = useTransition();
  const [gone, setGone] = useState<string[]>([]);
  const rows = enquiries.filter((e) => !gone.includes(e.id));
  const unread = rows.filter((e) => !e.read_at).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Inbox"
        sub={`Messages people sent from ${siteName}.`}
        actions={unread ? <Pill tone="accent">{unread} unread</Pill> : undefined}
      />

      {rows.length === 0 ? (
        <div className="rounded-[13px] p-6 text-center shadow-[0_0_0_1px_var(--line)]">
          <p className="text-[15px] font-medium">No messages yet</p>
          <p className="mx-auto mt-1.5 max-w-[46ch] text-[13px] leading-[1.6] text-mute">
            The form at the bottom of your site sends messages here. Share your link and they will
            start arriving.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((e) => (
            <li
              key={e.id}
              className={`rounded-[13px] p-4 shadow-[0_0_0_1px_var(--line)] ${e.read_at ? "" : "bg-accent-3/10"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[13px] font-medium">
                    {e.read_at ? null : <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="Unread" />}
                    {e.name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-mute">
                    {e.contact} · {when(e.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {reply(e.contact).map((r) => (
                    <a
                      key={r.label}
                      href={r.href}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-soft !h-8 !px-2.5"
                      aria-label={`${r.label} ${e.name}`}
                    >
                      <r.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{r.label}</span>
                    </a>
                  ))}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => start(() => markEnquiryRead(e.id, !e.read_at).then(() => {}))}
                    className="btn-soft !h-8 !px-2.5"
                    aria-label={e.read_at ? "Mark unread" : "Mark read"}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setGone((g) => [...g, e.id]);
                      start(() => deleteEnquiry(e.id).then(() => {}));
                    }}
                    className="btn-soft !h-8 !px-2.5 text-mute hover:text-red-600"
                    aria-label={`Delete the message from ${e.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-[1.6]">{e.message}</p>
            </li>
          ))}
        </ul>
      )}

      <Dashed />
      <div>
        <Label>Where these come from</Label>
        <p className="mt-2 max-w-[70ch] text-[13px] leading-[1.6] text-mute">
          The last section of your site has a short form: name, phone or email, and a message. It
          works on every template. WhatsApp and Instagram messages will arrive here too once those
          plugins open.
        </p>
      </div>
    </div>
  );
}

/** A phone number gets WhatsApp and a call; an address gets email. */
function reply(contact: string) {
  const digits = contact.replace(/[^\d+]/g, "");
  if (contact.includes("@")) {
    return [{ label: "Email", href: `mailto:${contact}`, icon: Mail }];
  }
  if (digits.length >= 7) {
    const wa = digits.replace(/^\+/, "").replace(/^0/, "234");
    return [
      { label: "WhatsApp", href: `https://wa.me/${wa}`, icon: MessageCircle },
      { label: "Call", href: `tel:${digits}`, icon: Phone },
    ];
  }
  return [];
}

function when(iso: string) {
  const then = new Date(iso);
  const mins = Math.round((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return then.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
