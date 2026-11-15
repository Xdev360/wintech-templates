import type { Metadata } from "next";
import { OrderView } from "@/components/orders/OrderView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  // A receipt is nobody's business but the buyer's and the seller's.
  robots: { index: false, follow: false },
};

/* ──────────────────────────────────────────────────────────────
   The customer's own page for one order: what they bought, where to
   send the money, whether it has been confirmed, and their invoice
   once it has.

   The reference in the address is the key. It is short enough to read
   over the phone and carries nothing but what the customer typed.
   ────────────────────────────────────────────────────────────── */

export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return <OrderView reference={reference.toUpperCase().slice(0, 16)} />;
}
