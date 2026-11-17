"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Download, MessageCircle, Phone, Receipt as ReceiptIcon, ShieldCheck, X } from "lucide-react";
import { cancelOrder, confirmOrder, type Receipt } from "@/app/actions/orders";
import { naira } from "@/lib/money";

/* ──────────────────────────────────────────────────────────────
   Orders (Figma page 24, ST4). Tabs by status, one table, and a panel
   for the order you open.

   Customers pay by bank transfer straight to the owner, so Wintech
   cannot see the money. The decision that matters is the owner's: did
   it arrive? Orders where the customer says they paid come first.
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

const CHIP: Record<Order["status"], [string, string]> = {
  claimed: ["Says they paid", "bg-[rgba(249,115,22,0.16)] text-[#c2410c]"],
  awaiting: ["Waiting for payment", "bg-[rgba(59,91,255,0.1)] text-[#2f4be6]"],
  confirmed: ["Paid", "bg-[#dcfce7] text-[#15803d]"],
  cancelled: ["Cancelled", "bg-[rgba(10,14,23,0.06)] text-[rgba(10,14,23,0.62)]"],
};
const TABS: [string, Order["status"] | "all"][] = [["To confirm", "claimed"], ["Waiting for payment", "awaiting"], ["Paid", "confirmed"], ["Cancelled", "cancelled"], ["All", "all"]];

export function OrdersView({ orders, siteId, hasBank }: { orders: Order[]; siteId: string; hasBank: boolean }) {
  const [pending, start] = useTransition();
  const [changed, setChanged] = useState<Record<string, Order["status"]>>({});
  const [receipts, setReceipts] = useState<Record<string, Receipt>>({});
  const list = useMemo(() => orders.map((o) => ({ ...o, status: changed[o.id] ?? o.status })), [orders, changed]);
  const count = (s: Order["status"]) => list.filter((o) => o.status === s).length;
  const [tab, setTab] = useState<Order["status"] | "all">(count("claimed") ? "claimed" : "all");
  const [open, setOpen] = useState<string | null>(null);
  const shown = tab === "all" ? list : list.filter((o) => o.status === tab);
  const current = list.find((o) => o.id === open) ?? null;

  function decide(o: Order, to: "confirmed" | "cancelled") {
    setChanged((c) => ({ ...c, [o.id]: to }));
    start(() => {
      if (to === "confirmed") confirmOrder(o.id, siteId).then((r) => r.receipt && setReceipts((m) => ({ ...m, [o.id]: r.receipt as Receipt })));
      else cancelOrder(o.id, siteId).then(() => {});
    });
  }

  function exportCsv() {
    const rows = [["Reference", "Customer", "Phone", "Email", "Items", "Total (NGN)", "Status", "Placed"], ...list.map((o) => [
      o.reference, o.customer_name, o.customer_phone, o.customer_email ?? "", o.items.map((i) => `${i.qty} x ${i.title}`).join("; "), String(o.total_kobo / 100), CHIP[o.status][0], new Date(o.created_at).toISOString(),
    ])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "orders.csv";
    a.click();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Orders</h1>
          <p className="mt-1 text-[15px] text-[rgba(10,14,23,0.75)]">Customers pay by bank transfer straight to your account. Confirm each one when the money arrives.</p>
        </div>
        {orders.length > 0 && <button type="button" onClick={exportCsv} className="btn btn-secondary btn-sm"><Download className="h-4 w-4" strokeWidth={1.5} /> Export</button>}
      </div>

      {!hasBank && (
        <div className="flex items-start gap-3 border border-[rgba(249,115,22,0.35)] bg-[rgba(249,115,22,0.08)] p-4">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#f97316]" />
          <div>
            <p className="text-[14px] font-medium">Add your bank details first</p>
            <p className="mt-1 text-[13px] text-[rgba(10,14,23,0.75)]">Until you do, customers can order but have nowhere to send the money. Settings → Where customers pay you.</p>
          </div>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto border-b border-[var(--v4-line)]" role="tablist">
        {TABS.map(([label, s]) => {
          const n = s === "all" ? list.length : count(s);
          const on = tab === s;
          return (
            <button key={label} type="button" role="tab" aria-selected={on} onClick={() => setTab(s)}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 text-[14px] ${on ? "border-[var(--v4-ink)] font-medium" : "border-transparent text-[rgba(10,14,23,0.62)] hover:text-[var(--v4-ink)]"}`}>
              {label}{n ? ` · ${n}` : ""}
            </button>
          );
        })}
      </div>

      {shown.length ? (
        <div className="hair overflow-x-auto bg-white">
          <table className="w-full min-w-[720px] text-[14px]">
            <thead><tr className="border-b border-[var(--v4-line)] bg-[#fafafa] text-left text-[12px] text-[rgba(10,14,23,0.62)]">
              {["Order", "Customer", "Total", "Payment", "Placed", ""].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {shown.map((o) => {
                const [label, cls] = CHIP[o.status];
                return (
                  <tr key={o.id} onClick={() => setOpen(o.id)} className={`cursor-pointer border-b border-[var(--v4-line)] last:border-0 hover:bg-[#fafafa] ${o.status === "claimed" ? "bg-[rgba(59,91,255,0.04)]" : ""}`}>
                    <td className="px-4 py-3.5 font-medium">{o.reference}</td>
                    <td className="px-4 py-3.5"><span className="block">{o.customer_name}</span><span className="block truncate text-[12px] text-[rgba(10,14,23,0.62)]">{o.items.map((i) => (i.qty > 1 ? `${i.title} x${i.qty}` : i.title)).join(", ")}</span></td>
                    <td className="px-4 py-3.5 tabular-nums">{naira(o.total_kobo)}</td>
                    <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-[2px] px-2 py-0.5 text-[12px] ${cls}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span></td>
                    <td className="px-4 py-3.5 text-[rgba(10,14,23,0.75)]">{when(o.created_at)}</td>
                    <td className="px-4 py-3.5 text-right">
                      {o.status === "claimed" && (
                        <span className="inline-flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button type="button" disabled={pending} onClick={() => decide(o, "confirmed")} className="btn btn-primary btn-sm !h-8 !px-3"><Check className="h-3.5 w-3.5" strokeWidth={2} /> Money arrived</button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2 border border-dashed border-[var(--v4-line-2)] p-8">
          <p className="text-[16px] font-semibold">{orders.length ? "Nothing here" : "No orders yet"}</p>
          <p className="max-w-[56ch] text-[14px] text-[rgba(10,14,23,0.75)]">{orders.length ? "No orders in this tab right now." : "When someone buys from your site, it appears here with their phone number, so you can confirm the transfer and call them."}</p>
        </div>
      )}

      <p className="flex items-center gap-3 border border-[var(--v4-line)] bg-[#fafafa] px-4 py-3 text-[13px] text-[rgba(10,14,23,0.75)]">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--v4-blue)]" strokeWidth={1.5} />
        Wintech never holds your money and takes 0% of your sales. Only confirm an order after you see the transfer in your bank app.
      </p>

      {current && (
        <div className="fixed inset-0 z-40 flex justify-end bg-[rgba(10,14,23,0.25)]" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={`Order ${current.reference}`}>
          <aside className="flex h-full w-full max-w-[440px] flex-col overflow-y-auto border-l border-[var(--v4-line)] bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-[rgba(10,14,23,0.62)]">Order</p>
                <h2 className="text-[22px] font-semibold">{current.reference}</h2>
              </div>
              <button type="button" onClick={() => setOpen(null)} aria-label="Close"><X className="h-5 w-5" strokeWidth={1.5} /></button>
            </div>
            <span className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-[2px] px-2 py-0.5 text-[12px] ${CHIP[current.status][1]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{CHIP[current.status][0]}</span>
            <div className="mt-6 border-t border-[var(--v4-line)] pt-4">
              <p className="text-[15px] font-medium">{current.customer_name}</p>
              <p className="text-[13px] text-[rgba(10,14,23,0.62)]">{current.customer_phone}{current.customer_email ? ` · ${current.customer_email}` : ""}</p>
              <div className="mt-3 flex gap-2">
                <a href={`https://wa.me/${current.customer_phone.replace(/[^\d+]/g, "").replace(/^\+/, "").replace(/^0/, "234")}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><MessageCircle className="h-4 w-4" strokeWidth={1.5} /> WhatsApp</a>
                <a href={`tel:${current.customer_phone}`} className="btn btn-secondary btn-sm"><Phone className="h-4 w-4" strokeWidth={1.5} /> Call</a>
              </div>
            </div>
            <ul className="mt-6 flex flex-col gap-2 border-t border-[var(--v4-line)] pt-4 text-[14px]">
              {current.items.map((it) => (
                <li key={it.title} className="flex justify-between gap-3"><span className="text-[rgba(10,14,23,0.75)]">{it.qty} × {it.title}</span><span className="tabular-nums">{naira(it.price_kobo * it.qty)}</span></li>
              ))}
              <li className="mt-2 flex justify-between border-t border-[var(--v4-line)] pt-3 font-semibold"><span>Total</span><span className="tabular-nums">{naira(current.total_kobo)}</span></li>
            </ul>
            {current.note && <p className="mt-4 bg-[#fafafa] p-3 text-[13px] leading-[20px]">{current.note}</p>}
            <p className="mt-4 text-[12px] text-[rgba(10,14,23,0.62)]">Placed {new Date(current.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
            <div className="mt-auto flex flex-col gap-2 pt-6">
              {current.status === "claimed" && (
                <>
                  <button type="button" disabled={pending} onClick={() => decide(current, "confirmed")} className="btn btn-primary w-full"><Check className="h-4 w-4" strokeWidth={2} /> The money arrived</button>
                  <button type="button" disabled={pending} onClick={() => decide(current, "cancelled")} className="btn btn-secondary w-full"><X className="h-4 w-4" strokeWidth={1.5} /> It did not</button>
                </>
              )}
              {current.status === "confirmed" && <a href={`/o/${current.reference}`} target="_blank" rel="noreferrer" className="btn btn-secondary w-full"><ReceiptIcon className="h-4 w-4" strokeWidth={1.5} /> Invoice</a>}
              {receipts[current.id] && <p className="text-[12px] text-[rgba(10,14,23,0.62)]">{RECEIPT_WORDS[receipts[current.id]](current)}</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

const RECEIPT_WORDS: Record<Receipt, (o: Order) => string> = {
  sent: (o) => `Receipt emailed to ${o.customer_email}.`,
  "no-email": () => "They left no email address. Send them the invoice link on WhatsApp.",
  off: () => "Receipt emails are not switched on yet, so nothing was sent. Send them the invoice link.",
  failed: () => "The receipt email did not go out. Send them the invoice link instead.",
};

function when(iso: string) {
  const then = new Date(iso);
  const day = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
  const now = new Date();
  const time = then.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" });
  if (day(then) === day(now)) return `Today ${time}`;
  const y = new Date(now.getTime() - 864e5);
  if (day(then) === day(y)) return "Yesterday";
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
