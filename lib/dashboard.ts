import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { ShellSite, ShellUser } from "./dashboard-types";
import { createClient, supabaseConfigured } from "./supabase/server";
import { readContent, templateFor } from "./site-model";
import { kindLabel, type Kind } from "./templates";
import type { Site, SiteRow } from "./types";

/* ──────────────────────────────────────────────────────────────
   Server-side loading for the dashboard. The layout and the page both
   ask for the same site; cache() makes that one database trip, not two.
   ────────────────────────────────────────────────────────────── */

export function siteKind(template: string): Kind {
  return templateFor(template).kind;
}

/** A row with its content read into the current shape. */
export function withDefaults(row: SiteRow | Site): Site {
  return { ...row, content: readContent(row.content, row.template, row.name) };
}

export function toShellSite(row: SiteRow | Site): ShellSite {
  const site = withDefaults(row);
  const def = templateFor(site.template);
  return {
    id: site.id,
    name: site.name,
    slug: site.slug,
    kind: def.kind,
    kindLabel: kindLabel(def.kind),
    templateName: def.name,
    published: site.published,
    accent: site.content.theme.accent,
    logoUrl: site.content.brand.logoUrl,
  };
}

export function toShellUser(user: User): ShellUser {
  // Our own sign-up writes full_name; Google sends name as well, and
  // which one arrives has changed before. Take whichever is there.
  const meta = (user.user_metadata || {}) as { full_name?: string; name?: string };
  const email = user.email || "";
  const fallback = email.split("@")[0]?.replace(/[._-]+/g, " ") || "there";
  return {
    name: meta.full_name?.trim() || meta.name?.trim() || fallback.replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    verified: Boolean(user.email_confirmed_at),
  };
}

/** Null when 003_credits.sql has not been run yet. */
export async function readCredits(supabase: SupabaseClient): Promise<number | null> {
  const { data, error } = await supabase.rpc("credit_balance");
  if (error) return null;
  return typeof data === "number" ? data : Number(data ?? 0);
}

export const loadDashboard = cache(async (siteId: string) => {
  if (!supabaseConfigured()) redirect("/");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("sites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const rows = ((data || []) as SiteRow[]).map(withDefaults);
  const site = rows.find((r) => r.id === siteId);
  if (!site) notFound();

  return {
    supabase,
    user: toShellUser(user),
    sites: rows.map(toShellSite),
    site,
    shellSite: toShellSite(site),
    credits: await readCredits(supabase),
  };
});

/* The account home: every site, the balance, and what Wintech AI has
   done for each site (read from the credit ledger, so it is real). */
export const loadAccount = cache(async () => {
  if (!supabaseConfigured()) redirect("/");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("sites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const rows = ((data || []) as SiteRow[]).map(withDefaults);

  const aiEdits: Record<string, number> = {};
  const { data: spends } = await supabase.from("credit_ledger").select("ref, delta").lt("delta", 0);
  for (const r of (spends || []) as { ref: string | null; delta: number }[]) {
    if (r.ref) aiEdits[r.ref] = (aiEdits[r.ref] || 0) - r.delta;
  }

  return {
    supabase,
    user: toShellUser(user),
    rows,
    sites: rows.map(toShellSite),
    credits: await readCredits(supabase),
    aiEdits,
  };
});
