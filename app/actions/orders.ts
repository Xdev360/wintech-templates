"use server";

import { revalidatePath } from "next/cache";
import { sendReceipt } from "@/lib/email";
import { appOrigin } from "@/lib/origin";
import { createClient } from "@/lib/supabase/server";

/* Only the owner, looking at their own bank app, decides that money
   arrived. Row-level security does the guarding: these can only ever
   touch orders belonging to the signer's own sites. */

/** What happened to the receipt email, so the owner is never left guessing. */
export type Receipt = "sent" | "no-email" | "off" | "failed";

export async function confirmOrder(orderId: string, siteId: string): Promise<{ error?: string; receipt?: Receipt }> {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("reference, customer_name, customer_email, items, total_kobo")
    .maybeSingle();
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${siteId}`, "layout");

  // The receipt goes out by email when the buyer left one. Quietly: a
  // failed email must never undo a confirmed payment.
  if (order?.customer_email) {
    const { data: site } = await supabase.from("sites").select("name, content").eq("id", siteId).maybeSingle();
    const brand = (site?.content as { brand?: { name?: string; email?: string } } | null)?.brand;
    const out = await sendReceipt({
      reference: order.reference,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      items: order.items as { title: string; qty: number; price_kobo: number }[],
      total_kobo: order.total_kobo,
      business: brand?.name || site?.name || "the shop",
      origin: await appOrigin(),
      replyTo: brand?.email || null,
    });
    return { receipt: out.sent ? "sent" : out.why === "no key" ? "off" : "failed" };
  }
  return { receipt: "no-email" };
}

export async function cancelOrder(orderId: string, siteId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${siteId}`, "layout");
  return {};
}
