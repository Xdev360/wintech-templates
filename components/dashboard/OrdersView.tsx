"use client";

import { useState, useTransition } from "react";
import { Check, MessageCircle, Phone, Receipt as ReceiptIcon, X } from "lucide-react";
import { cancelOrder, confirmOrder, type Receipt } from "@/app/actions/orders";
import { naira } from "@/lib/money";
import { Dashed, Label, PageHeader, Pill } from "./ui";

/* ──────────────────────────────────────────────────────────────
   Orders, and the one decision that matters: did the money arrive?

   Wintech cannot know. The customer pressed "I have sent the money";
   the owner opens their bank app, sees it or does not, and says so
   here. Orders waiting on that decision sit at the top, because a
   customer is standing by with a receipt on their phone.
   ────────────────────────────────────────────────────────────── */

export type Order = {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: { title: string; qty: number; price_kobo: number }[];
  total_kobo: number;
  note: string | null;
  status: "awaiting" | "claimed" | "confirmed" | "cancelled";
  created_at: string;
  claimed_at: string | null;
};

const WORDS: Record<Order["status"], { label: string; tone?: "good" | "warn" | "accent" }> = {
  claimed: { label: "Says they paid", tone: "warn" },
  awaiting: { label: "Waiting for payment" },
  confirmed: { label: "Paid", tone: "good" },
  cancelled: { label: "Cancelled" },
};

export function OrdersView({ orders, siteId, hasBank }: { orders: Order[]; siteId: string; hasBank: boolean }) {
  const [pending, start] = useTransition();
  const waiting = orders.filter((o) => o.status === "claimed");
  const rest = orders.filter((o) => o.status !== "claimed");
  const paid = orders.filter((o) => o.status === "confirmed").reduce((n, o) => n + o.total_kobo, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Orders"
        sub="Money comes to your own bank account. Wintech never holds it and takes nothing."
        actions={waiting.length ? <Pill tone="warn">{waiting.length} to check</Pill> : undefined}
      />

      {!hasBank ? (
        <div className="rounded-[13px] bg-amber-500/10 p-4">
          <p className="text-[13px] font-medium">Add your bank details first</p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-mute">
            Until you do, customers can order but have nowhere to send the money. Site settings →
            Where customers pay you.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <Figure label="To check" value={String(waiting.length)} />
        <Figure label="Paid" value={naira(paid)} />
        <Figure label="Orders" value={String(orders.length)} />
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[13px] p-6 text-center shadow-[0_0_0_1px_var(--line)]">
          <p className="text-[15px] font-medium">No orders yet</p>
          <p className="mx-auto mt-1.5 max-w-[46ch] text-[13px] leading-[1.6] text-mute">
            When someone buys from your site, it appears here with their phone number, so you can
            confirm the transfer and call them.
          </p>
        </div>
      ) : null}

      {waiting.length ? (
        <section>
          <Label>Waiting for you</Label>
          <ul className="mt-3 flex flex-col gap-3">
            {waiting.map((o) => (
              <Card key={o.id} order={o} siteId={siteId} pending={pending} start={start} highlight />
            ))}
          </ul>
        </section>
      ) : null}

      {rest.length ? (
        <section>
          {waiting.length ? <Dashed /> : null}
          <div className={waiting.length ? "mt-5" : ""}>
            <Label>Everything else</Label>
            <ul className="mt-3 flex flex-col gap-3">
              {rest.map((o) => (
                <Card key={o.id} order={o} siteId={siteId} pending={pending} start={start} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Card({
  order, siteId, pending, start, highlight,
}: {
  order: Order; siteId: string; pending: boolean; start: (fn: () => void) => void; highlight?: boolean;
}) {
  const [gone, setGone] = useState<Order["status"] | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const status = gone || order.status;
  const word = WORDS[status];
  const wa = order.customer_phone.replace(/[^\d+]/g, "").replace(/^\+/, "").replace(/^0/, "234");

  return (
    <li className={`rounded-[13px] p-4 shadow-[0_0_0_1px_var(--line)] ${highlight && status === "claimed" ? "bg-amber-500/[0.06]" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-medium">
            {naira(order.total_kobo)} <span className="font-normal text-mute">· {order.customer_name}</span>
          </p>
          <p className="mt-0.5 text-[12px] text-mute">
            {order.reference} · {order.customer_phone} · {when(order.created_at)}
          </p>
        </div>
        <Pill tone={word.tone}>{word.label}</Pill>
      </div>

      <ul className="mt-3 flex flex-col gap-1 text-[13px]">
        {order.items.map((it) => (
          <li key={it.title} className="flex justify-between gap-3">
            <span className="min-w-0 truncate text-mute">{it.qty} × {it.title}</span>
            <span className="shrink-0 tabular-nums">{naira(it.price_kobo * it.qty)}</span>
          </li>
        ))}
      </ul>

      {order.note ? <p className="mt-2 rounded-[10px] bg-soft p-2.5 text-[12.5px] leading-[1.5]">{order.note}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {status === "claimed" ? (
          <>
            <button
              type="button"
              className="btn-primary"
              disabled={pending}
              onClick={() => {
                setGone("confirmed");
                start(() => { confirmOrder(order.id, siteId).then((r) => setReceipt(r.receipt ?? null)); });
              }}
            >
              <Check className="h-4 w-4" /> The money arrived
            </button>
            <button
              type="button"
              className="btn-soft"
              disabled={pending}
              onClick={() => { setGone("cancelled"); start(() => { cancelOrder(order.id, siteId).then(() => {}); }); }}
            >
              <X className="h-4 w-4" /> It did not
            </button>
          </>
        ) : null}
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn-soft">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <a href={`tel:${order.customer_phone}`} className="btn-soft"><Phone className="h-4 w-4" /> Call</a>
        {status === "confirmed" ? (
          <a href={`/o/${order.reference}`} target="_blank" rel="noreferrer" className="btn-soft">
            <ReceiptIcon className="h-4 w-4" /> Invoice
          </a>
        ) : null}
      </div>

      {receipt ? <p className="mt-2.5 text-[12px] leading-[1.5] text-mute">{RECEIPT_WORDS[receipt](order)}</p> : null}
    </li>
  );
}

/* After confirming, say plainly whether the receipt reached them. */
const RECEIPT_WORDS: Record<Receipt, (o: Order) => string> = {
  sent: (o) => `Receipt emailed to ${o.customer_email}.`,
  "no-email": () => "They left no email address. Send them the invoice link on WhatsApp.",
  off: () => "Receipt emails are not switched on yet, so nothing was sent. Send them the invoice link.",
  failed: () => "The receipt email did not go out. Send them the invoice link instead.",
};

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[13px] p-3.5 shadow-[0_0_0_1px_var(--line)]">
      <Label>{label}</Label>
      <p className="mt-1 truncate text-[17px] tabular-nums">{value}</p>
    </div>
  );
}

function when(iso: string) {
  const then = new Date(iso);
  const mins = Math.round((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
