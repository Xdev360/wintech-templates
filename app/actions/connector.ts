"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Personal links for the Claude connector. The secret comes back once,
   from the database, and is never stored anywhere but as a hash. */

export async function createConnectorLink(label: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_connector_token", { p_label: label.slice(0, 40) || "Claude" });
  if (error) return { error: /function .* does not exist|schema cache/i.test(error.message) ? "Run supabase/004_connector.sql first." : error.message };
  revalidatePath("/dashboard", "layout");
  return { token: String(data) };
}

export async function revokeConnectorLink(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("revoke_connector_token", { p_id: id });
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
