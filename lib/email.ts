import { naira } from "./money";

/* ──────────────────────────────────────────────────────────────
   Email, through Resend, over plain HTTP — no library to keep updated.

   It does nothing until RESEND_API_KEY exists in the environment, and
   never throws into the caller: a receipt that fails to send must not
   undo the confirmation that triggered it. The failure goes to the
   server log, where it can be seen.

   Needs, once: a Resend account, a domain verified there, and the key in
   Vercel. The from address must belong to the domain that was verified —
   RESEND_FROM overrides it, so whichever subdomain gets verified is the
   one that is used. See EMAIL.md.
   ────────────────────────────────────────────────────────────── */

const FROM = process.env.RESEND_FROM || "Wintech Templates <receipts@mail.wintechstudio.com>";

/* The buyer bought from the shop, not from us, so the shop's name is what
   they should see in their inbox. Only the address behind it is ours —
   that is the part the domain vouches for, and it cannot be the shop's
   own address unless the shop proves it owns it. Shopify does exactly
   this. A reply goes to the shop, not into our inbox. */
function fromFor(business: string) {
  const name = business.replace(/["\\\r\n]/g, "").trim().slice(0, 40);
  const address = FROM.match(/<(.+)>/)?.[1] || FROM;
  return name ? `${name} <${address}>` : FROM;
}

async function send(to: string, subject: string, html: string, text: string, opts: { from?: string; replyTo?: string } = {}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false as const, why: "no key" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: opts.from || FROM,
        to: [to],
        subject,
        html,
        text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("[wintech-email] resend refused", res.status, await res.text().catch(() => ""));
      return { sent: false as const, why: `resend ${res.status}` };
    }
    return { sent: true as const };
  } catch (err) {
    console.error("[wintech-email] send failed", err);
    return { sent: false as const, why: "unreachable" };
  }
}

const escape = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch] || ch);

/** The receipt, sent when the owner confirms the money arrived. */
export async function sendReceipt(order: {
  reference: string;
  customer_name: string;
  customer_email: string | null;
  items: { title: string; qty: number; price_kobo: number }[];
  total_kobo: number;
  business: string;
  origin: string;
  replyTo?: string | null;
}) {
  if (!order.customer_email) return { sent: false as const, why: "no email" };
  const link = `${order.origin}/o/${order.reference}`;
  const rows = order.items.map((it) => `${it.qty} × ${it.title} — ${naira(it.price_kobo * it.qty)}`);

  const text = [
    `Hello ${order.customer_name},`,
    ``,
    `${order.business} has confirmed your payment. Your receipt:`,
    ``,
    ...rows,
    `Total paid: ${naira(order.total_kobo)}`,
    ``,
    `Reference ${order.reference}`,
    `Save or share it here: ${link}`,
    ``,
    `Paid by bank transfer. Sent by Wintech Templates on behalf of ${order.business}.`,
  ].join("\n");

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0a0a0a">
      <p style="font-size:15px">Hello ${escape(order.customer_name)},</p>
      <p style="font-size:15px"><b>${escape(order.business)}</b> has confirmed your payment. Your receipt:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
        ${order.items.map((it) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${it.qty} × ${escape(it.title)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${naira(it.price_kobo * it.qty)}</td></tr>`).join("")}
        <tr><td style="padding:12px 0;font-weight:600">Total paid</td><td style="padding:12px 0;text-align:right;font-weight:600">${naira(order.total_kobo)}</td></tr>
      </table>
      <p style="font-size:14px;color:#555">Reference <b style="color:#0a0a0a">${escape(order.reference)}</b></p>
      <p><a href="${link}" style="display:inline-block;padding:11px 16px;border-radius:10px;background:#232732;color:#fff;text-decoration:none;font-size:14px">Save or share your receipt</a></p>
      <p style="font-size:12px;color:#888;margin-top:24px">Paid by bank transfer. Sent by Wintech Templates on behalf of ${escape(order.business)}.</p>
    </div>`;

  return send(order.customer_email, `Receipt ${order.reference} from ${order.business}`, html, text, {
    from: fromFor(order.business),
    // The shop's own inbox; failing that, a person at Wintech rather than
    // a bounce, since the sending address has no mailbox behind it.
    replyTo: order.replyTo?.trim() || process.env.RESEND_REPLY_TO || "hello@wintechstudio.com",
  });
}
