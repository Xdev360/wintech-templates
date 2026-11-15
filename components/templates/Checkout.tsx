"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, ShoppingBag, X } from "lucide-react";
import { addToBag, clearBag, clearOpenOrder, countBag, getBag, getOpenOrder, onBagChange, setOpenOrder, setQty, type CartLine } from "@/lib/cart";
import { naira, priceToKobo } from "@/lib/money";
import type { SiteItem } from "@/lib/site-model";
import { createClient } from "@/lib/supabase/client";

/* ──────────────────────────────────────────────────────────────
   Buying, the way it actually happens here: the customer picks what
   they want, gets the shop's account number, sends the money from
   their bank app, and says they have sent it. The owner checks their
   own bank and confirms. No card, no fees, nobody holding the money.

   The browser never decides a price. It sends the titles and the
   quantities; the server reads the prices off the shop's own page.

   In a preview nothing is clickable — an owner looking at their own
   design should not be able to place an order against themselves.
   ────────────────────────────────────────────────────────────── */

type Placed = {
  reference: string;
  total_kobo: number;
  items: { title: string; qty: number; price_kobo: number }[];
  business: string;
  payment: Payment;
};

type Payment = { bank?: string; account_name?: string; account_number?: string; note?: string };

/* The snapshot must be stable between renders or React loops forever, so
   the parsed bag is remembered until its stored text changes. */
const EMPTY: CartLine[] = [];
let lastRaw = "";
let lastBag: CartLine[] = EMPTY;
function bagOf(slug: string): CartLine[] {
  const bag = getBag(slug);
  const raw = JSON.stringify(bag);
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastBag = bag;
  }
  return lastBag;
}

/** The button on a product or a service. */
export function BuyButton({
  slug,
  item,
  live,
  label,
  className = "",
  soldOut = false,
}: {
  slug: string;
  item: SiteItem;
  live?: boolean;
  label: string;
  className?: string;
  soldOut?: boolean;
}) {
  const [added, setAdded] = useState(false);
  const sellable = priceToKobo(item.price) > 0;

  if (soldOut) {
    // The one button that is meant to do nothing, and says so.
    return <span className={`tpl-btn tpl-btn--off ${className}`} aria-disabled="true">Sold out</span>;
  }

  if (!sellable) {
    // No price means "ask us": the button goes to the message form, so
    // it is never a dead label.
    return live
      ? <a href="#contact" className={`tpl-btn ${className}`}>{label}</a>
      : <span className={`tpl-btn ${className}`}>{label}</span>;
  }

  return (
    <button
      type="button"
      className={`tpl-btn ${className}`}
      disabled={!live}
      onClick={() => {
        if (!live) return;
        addToBag(slug, item.title);
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? "Added" : label}
    </button>
  );
}

/** The floating bag, the checkout, and the payment instructions. */
export function Checkout({ slug, live }: { slug: string; live?: boolean }) {
  const count = useSyncExternalStore(
    onBagChange,
    () => (live ? countBag(slug) : 0),
    () => 0,
  );
  const [open, setOpen] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  // Someone who wandered off mid-transfer comes back to their order.
  const resume = useSyncExternalStore(
    onBagChange,
    () => (live ? getOpenOrder(slug) : ""),
    () => "",
  );

  if (!live) return null;
  if (!count && !open && !resume) return null;

  return (
    <>
      <button type="button" className="tpl-bag" onClick={() => setOpen(true)}>
        <ShoppingBag className="h-4 w-4" />
        {resume && !count ? "Your order" : `${count} item${count === 1 ? "" : "s"}`}
      </button>

      {open ? (
        <div className="tpl-sheet" role="dialog" aria-modal="true" aria-label="Your order">
          <button type="button" className="tpl-sheet__bg" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="tpl-sheet__panel">
            <button type="button" className="tpl-sheet__x" aria-label="Close" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
            {placed ? (
              <Pay placed={placed} slug={slug} onDone={() => { setPlaced(null); setOpen(false); }} />
            ) : resume ? (
              <Resume reference={resume} onGone={() => clearOpenOrder(slug)} />
            ) : (
              <Bag
                slug={slug}
                onPlaced={(p) => {
                  setPlaced(p);
                  setOpenOrder(slug, p.reference);
                  clearBag(slug);
                }}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ── What is in the bag, and who is buying ────────────────────── */

function Bag({ slug, onPlaced }: { slug: string; onPlaced: (p: Placed) => void }) {
  const lines = useSyncExternalStore<CartLine[]>(
    onBagChange,
    () => bagOf(slug),
    () => EMPTY,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function place(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const { data, error: err } = await createClient().rpc("place_order", {
        p_slug: slug,
        p_name: String(form.get("name") || ""),
        p_phone: String(form.get("phone") || ""),
        p_email: String(form.get("email") || ""),
        p_items: lines,
        p_note: String(form.get("note") || ""),
      });
      if (err) throw new Error(err.message);
      onPlaced(data as Placed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not go through. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!lines.length) return <p className="tpl-sheet__lead">Your bag is empty.</p>;

  return (
    <>
      <h2 className="tpl-sheet__title">Your order</h2>
      <ul className="tpl-lines">
        {lines.map((l) => (
          <li key={l.title}>
            <span className="tpl-lines__name">{l.title}</span>
            <span className="tpl-qty">
              <button type="button" onClick={() => setQty(slug, l.title, l.qty - 1)} aria-label={`One less ${l.title}`}>−</button>
              <b>{l.qty}</b>
              <button type="button" onClick={() => setQty(slug, l.title, l.qty + 1)} aria-label={`One more ${l.title}`}>+</button>
            </span>
          </li>
        ))}
      </ul>

      <form className="tpl-form" onSubmit={place}>
        <div className="tpl-form__row">
          <input className="tpl-input" name="name" placeholder="Your name" required maxLength={60} autoComplete="name" />
          <input className="tpl-input" name="phone" placeholder="Phone number" required maxLength={20} autoComplete="tel" inputMode="tel" />
        </div>
        <input className="tpl-input" name="email" placeholder="Email (so we can send your receipt)" maxLength={120} autoComplete="email" type="email" />
        <textarea className="tpl-input tpl-input--area" name="note" rows={2} placeholder="Anything they should know: size, colour, address" maxLength={500} />
        {error ? <p className="tpl-form__error">{error}</p> : null}
        <button type="submit" className="tpl-btn tpl-btn--invert" disabled={busy}>
          {busy ? "Placing…" : "Place order"}
        </button>
        <p className="tpl-fine">You pay by bank transfer. The account details come next.</p>
      </form>
    </>
  );
}

/* ── Pay by transfer ──────────────────────────────────────────── */

function Pay({ placed, slug, onDone }: { placed: Placed; slug: string; onDone: () => void }) {
  const [said, setSaid] = useState(false);
  const [busy, setBusy] = useState(false);
  const p = placed.payment || {};
  const hasBank = Boolean(p.account_number && p.bank);

  async function iHavePaid() {
    setBusy(true);
    try {
      await createClient().rpc("claim_order_paid", { p_reference: placed.reference });
      setSaid(true);
    } catch {
      setSaid(true); // Saying so twice is harmless; leaving them stuck is not.
    } finally {
      setBusy(false);
    }
  }

  if (said) {
    return (
      <>
        <h2 className="tpl-sheet__title">Thank you</h2>
        <p className="tpl-sheet__lead">
          {placed.business} will check the transfer and confirm your order. Keep your reference:
          <b> {placed.reference}</b>. You can close this page.
        </p>
        <a className="tpl-btn tpl-btn--invert" href={`/o/${placed.reference}`} target="_blank" rel="noreferrer">
          Follow your order
        </a>
        <button type="button" className="tpl-link" onClick={() => { clearOpenOrder(slug); onDone(); }}>
          Done
        </button>
      </>
    );
  }

  return (
    <>
      <h2 className="tpl-sheet__title">Send {naira(placed.total_kobo)}</h2>
      <p className="tpl-sheet__lead">
        Transfer from your bank app, then press the button. Your reference is <b>{placed.reference}</b>.
      </p>

      {hasBank ? (
        <div className="tpl-bank">
          <Row label="Bank" value={p.bank || ""} />
          <Row label="Account name" value={p.account_name || ""} />
          <Row label="Account number" value={p.account_number || ""} copy />
          <Row label="Amount" value={naira(placed.total_kobo)} />
          {p.note ? <p className="tpl-fine">{p.note}</p> : null}
        </div>
      ) : (
        <p className="tpl-form__error">
          This shop has not added its account details yet. Your order is saved as {placed.reference} —
          contact them and they will tell you where to send the money.
        </p>
      )}

      <button type="button" className="tpl-btn tpl-btn--invert" onClick={iHavePaid} disabled={busy}>
        {busy ? "One moment…" : "I have sent the money"}
      </button>
      <p className="tpl-fine">Only press this after the transfer has left your account.</p>
    </>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <div className="tpl-bank__row">
      <span>{label}</span>
      <b>
        {value}
        {copy ? (
          <button
            type="button"
            aria-label={`Copy the ${label.toLowerCase()}`}
            onClick={() => {
              navigator.clipboard?.writeText(value);
              setDone(true);
              setTimeout(() => setDone(false), 1400);
            }}
          >
            {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </b>
    </div>
  );
}

/* ── An order already in flight ───────────────────────────────── */

function Resume({ reference, onGone }: { reference: string; onGone: () => void }) {
  const [state, setState] = useState<{ status?: string; total_kobo?: number; found?: boolean } | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const { data } = await createClient().rpc("order_status", { p_reference: reference });
        if (live) setState(data as { status?: string; found?: boolean });
      } catch {
        if (live) setState({ found: false });
      }
    })();
    return () => {
      live = false;
    };
  }, [reference]);

  const status = state?.status;
  return (
    <>
      <h2 className="tpl-sheet__title">Order {reference}</h2>
      <p className="tpl-sheet__lead">
        {!state ? "Checking…"
          : status === "confirmed" ? "Paid and confirmed. Thank you."
          : status === "claimed" ? "You said the money is sent. Waiting for the shop to confirm."
          : status === "cancelled" ? "This order was cancelled."
          : "Waiting for your transfer."}
      </p>
      <a className="tpl-btn tpl-btn--invert" href={`/o/${reference}`} target="_blank" rel="noreferrer">
        Open your order
      </a>
      <button type="button" className="tpl-link" onClick={onGone}>Start a new order</button>
    </>
  );
}
