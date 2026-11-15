"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, MessageCircle, Phone, Share2 } from "lucide-react";
import { inkFor, safeAccent } from "@/lib/color";
import { naira } from "@/lib/money";
import { createClient } from "@/lib/supabase/client";

/* ──────────────────────────────────────────────────────────────
   One order, seen by the person who bought.

   Three states, and the page is honest about which one it is in:
   waiting for the transfer, waiting for the shop to confirm, or paid.
   Only the last one produces an invoice — a receipt for money that has
   not arrived would be a lie a customer could wave at a seller.
   ────────────────────────────────────────────────────────────── */

type Order = {
  found: boolean;
  reference?: string;
  status?: "awaiting" | "claimed" | "confirmed" | "cancelled";
  items?: { title: string; qty: number; price_kobo: number }[];
  total_kobo?: number;
  customer_name?: string;
  customer_phone?: string;
  note?: string | null;
  created_at?: string;
  confirmed_at?: string | null;
  business?: string;
  slug?: string;
  business_email?: string | null;
  business_phone?: string | null;
  payment?: { bank?: string; account_name?: string; account_number?: string; note?: string };
};

export function OrderView({ reference }: { reference: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [theme, setTheme] = useState({ accent: "#232732", logo: "" });
  const [saying, setSaying] = useState(false);

  async function load() {
    const { data } = await createClient().rpc("order_status", { p_reference: reference });
    setOrder((data as Order) || { found: false });
  }

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const { data } = await createClient().rpc("order_status", { p_reference: reference });
        if (live) setOrder((data as Order) || { found: false });
      } catch {
        if (live) setOrder({ found: false });
      }
    })();
    return () => {
      live = false;
    };
  }, [reference]);

  // The shop's own colours. A receipt in Wintech's colours would feel like
  // it came from a stranger; this came from the shop they bought from.
  useEffect(() => {
    const slug = order?.slug;
    if (!slug) return;
    let live = true;
    (async () => {
      try {
        const { data } = await createClient().from("sites").select("content").eq("slug", slug).maybeSingle();
        const c = (data?.content || {}) as { theme?: { accent?: string }; brand?: { logoUrl?: string } };
        if (live && c.theme?.accent) {
          setTheme({ accent: safeAccent(c.theme.accent), logo: c.brand?.logoUrl || "" });
        }
      } catch {
        // The shop may be hidden. Wintech's own colours then, which is fine.
      }
    })();
    return () => {
      live = false;
    };
  }, [order?.slug]);

  if (!order) return <Frame><p className="text-[13.5px] text-mute">Loading…</p></Frame>;

  if (!order.found) {
    return (
      <Frame>
        <h1 className="text-[22px] font-semibold tracking-[-0.025em]">We cannot find that order</h1>
        <p className="mt-2 text-[13.5px] leading-[1.6] text-mute">
          Check the reference — it looks like <b>WT-XXXXXX</b>. If you have just placed the order,
          give it a moment and reload.
        </p>
      </Frame>
    );
  }

  const paid = order.status === "confirmed";
  const p = order.payment || {};
  const hasBank = Boolean(p.account_number && p.bank);

  return (
    <Frame>
      {/* Screen only: the state of things. Print shows the invoice alone. */}
      <div className="print:hidden">
        <p className="text-[12px] font-medium uppercase tracking-[0.09em] text-mute-2">Order {order.reference}</p>
        <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.025em]">
          {paid ? "Paid and confirmed" : order.status === "claimed" ? "Waiting for confirmation" : order.status === "cancelled" ? "This order was cancelled" : `Send ${naira(order.total_kobo || 0)}`}
        </h1>
        <p className="mt-2 max-w-[52ch] text-[13.5px] leading-[1.6] text-mute">
          {paid
            ? `${order.business} has confirmed your payment. Your receipt is below — keep it.`
            : order.status === "claimed"
              ? `${order.business} is checking their account. This usually takes a few hours, and they will call you on ${order.customer_phone}.`
              : order.status === "cancelled"
                ? `If you think this is wrong, contact ${order.business} with your reference.`
                : `Transfer the money to ${order.business}, then press the button below.`}
        </p>

        {!paid && order.status === "awaiting" && hasBank ? (
          <div className="mt-5 rounded-[13px] p-4 shadow-[0_0_0_1px_var(--line)]">
            <Row label="Bank" value={p.bank || ""} />
            <Row label="Account name" value={p.account_name || ""} />
            <Row label="Account number" value={p.account_number || ""} copy />
            <Row label="Amount" value={naira(order.total_kobo || 0)} copy />
            {p.note ? <p className="pt-2 text-[12px] text-mute">{p.note}</p> : null}
            <button
              type="button"
              className="btn-primary mt-3 w-full"
              disabled={saying}
              onClick={async () => {
                setSaying(true);
                try {
                  await createClient().rpc("claim_order_paid", { p_reference: reference });
                  await load();
                } finally {
                  setSaying(false);
                }
              }}
            >
              {saying ? "One moment…" : "I have sent the money"}
            </button>
            <p className="mt-2 text-[12px] text-mute-2">Only press this once the transfer has left your account.</p>
          </div>
        ) : null}

        {!paid && order.status !== "cancelled" ? (
          <Actions reference={reference} order={order} accent={theme.accent} />
        ) : null}

        {!paid && order.status === "awaiting" && !hasBank ? (
          <p className="mt-5 rounded-[13px] bg-amber-500/10 p-4 text-[13px] leading-[1.6]">
            {order.business} has not added their account details yet. Call them on{" "}
            {order.business_phone || "the number on their site"} and quote {order.reference}.
          </p>
        ) : null}
      </div>

      {/* The invoice. On screen once paid; on paper, the whole page. */}
      {paid ? (
        <div className="mt-6 rounded-[13px] p-5 shadow-[0_0_0_1px_var(--line)] print:mt-0 print:p-0 print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[16px] font-semibold tracking-[-0.02em]">{order.business}</p>
              <p className="text-[12px] text-mute">
                {order.slug}.wintechstudio.com
                {order.business_email ? ` · ${order.business_email}` : ""}
                {order.business_phone ? ` · ${order.business_phone}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium uppercase tracking-[0.09em] text-mute-2">Receipt</p>
              <p className="text-[13px] tabular-nums">{order.reference}</p>
              <p className="text-[12px] text-mute">
                {order.confirmed_at ? new Date(order.confirmed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-line pt-3">
            <p className="text-[12px] text-mute">Billed to</p>
            <p className="text-[13.5px]">{order.customer_name} · {order.customer_phone}</p>
          </div>

          <table className="mt-4 w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[12px] text-mute">
                <th className="py-2 font-normal">Item</th>
                <th className="py-2 text-center font-normal">Qty</th>
                <th className="py-2 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it) => (
                <tr key={it.title} className="border-b border-dashed border-line">
                  <td className="py-2">{it.title}</td>
                  <td className="py-2 text-center tabular-nums">{it.qty}</td>
                  <td className="py-2 text-right tabular-nums">{naira(it.price_kobo * it.qty)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-3 font-medium" colSpan={2}>Total paid</td>
                <td className="py-3 text-right text-[15px] font-medium tabular-nums">{naira(order.total_kobo || 0)}</td>
              </tr>
            </tbody>
          </table>

          {order.note ? <p className="mt-2 text-[12.5px] text-mute">Note: {order.note}</p> : null}
          <p className="mt-4 text-[11.5px] text-mute-2">
            Paid by bank transfer. Confirmed by {order.business}.
          </p>

          <Actions reference={reference} order={order} accent={theme.accent} />
        </div>
      ) : null}
    </Frame>
  );
}

/* Download, share, and chase — the three things someone does with a
   receipt on a phone. */
function Actions({ reference, order, accent }: { reference: string; order: Order; accent: string }) {
  const [shared, setShared] = useState(false);
  const file = `/api/receipt/${reference}`;
  const phone = (order.business_phone || "").replace(/[^\d+]/g, "").replace(/^\+/, "").replace(/^0/, "234");
  const ask = encodeURIComponent(
    `Hello ${order.business || ""}. This is ${order.customer_name || ""}, about my order ${reference}. Please could you give me an update?`,
  );

  async function share() {
    const url = typeof window === "undefined" ? "" : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Receipt ${reference}`, text: `Receipt from ${order.business}`, url });
      } else {
        await navigator.clipboard?.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1600);
      }
    } catch {
      // They closed the share sheet. Nothing to say about that.
    }
  }

  return (
    <div className="mt-5 flex flex-col gap-2 print:hidden">
      <a
        href={file}
        download
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] text-[14px] font-medium"
        style={{ background: accent, color: inkFor(accent) }}
      >
        <Download className="h-4 w-4" /> {order.status === "confirmed" ? "Download receipt" : "Download order"}
      </a>
      <div className="flex gap-2">
        {phone ? (
          <a href={`https://wa.me/${phone}?text=${ask}`} target="_blank" rel="noreferrer" className="btn-soft flex-1">
            <MessageCircle className="h-4 w-4" /> Ask about my order
          </a>
        ) : null}
        {order.business_phone ? (
          <a href={`tel:${order.business_phone}`} className="btn-soft"><Phone className="h-4 w-4" /> Call</a>
        ) : null}
        <button type="button" onClick={share} className="btn-soft">
          <Share2 className="h-4 w-4" /> {shared ? "Copied" : "Share"}
        </button>
      </div>
      <p className="text-[11.5px] leading-[1.5] text-mute-2">
        The receipt saves to your phone as a picture, so you can send it on WhatsApp or show it on
        delivery.
      </p>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-[560px] px-5 py-10 print:max-w-none print:py-0">{children}</main>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0 text-[13.5px]">
      <span className="text-mute">{label}</span>
      <span className="flex items-center gap-2 font-medium tabular-nums">
        {value}
        {copy ? (
          <button
            type="button"
            aria-label={`Copy the ${label.toLowerCase()}`}
            className="grid h-7 w-7 place-items-center rounded-[8px] bg-soft text-mute hover:text-ink"
            onClick={() => {
              navigator.clipboard?.writeText(value.replace(/[^\d]/g, "") || value);
              setDone(true);
              setTimeout(() => setDone(false), 1400);
            }}
          >
            {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </span>
    </div>
  );
}
