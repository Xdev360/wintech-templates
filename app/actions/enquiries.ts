"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Reading and clearing messages. Row-level security does the guarding:
   these only ever touch messages belonging to the signer's own sites. */

export async function markEnquiryRead(id: string, read: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enquiries")
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function deleteEnquiry(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return {};
}
