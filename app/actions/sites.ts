"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FREE_SITE_LIMIT } from "@/lib/config";
import { normalizeSlug, slugError } from "@/lib/slugs";
import { createClient } from "@/lib/supabase/server";
import { applyPatch, defaultContent, readContent, sanitizeContent, templateFor, type SiteContent } from "@/lib/site-model";
import { getTemplate } from "@/lib/templates";

export async function createSite(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };

  const name = String(formData.get("name") || "").trim();
  const slug = normalizeSlug(String(formData.get("slug") || name));
  const chosen = String(formData.get("template") || "");
  const template = getTemplate(chosen) ? chosen : "landing-business";
  if (!name) return { error: "Give the site a name." };
  const bad = slugError(slug);
  if (bad) return { error: bad };

  const { count, error: countError } = await supabase
    .from("sites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countError) return { error: countError.message };
  if ((count || 0) >= FREE_SITE_LIMIT) {
    return { error: "The free plan is one live site. Paid plans come next." };
  }

  const { data, error } = await supabase
    .from("sites")
    .insert({
      user_id: user.id,
      name,
      slug,
      template,
      // A new site starts with the template's sample content, so it stays
      // hidden until the owner has made it theirs and presses Publish.
      published: false,
      content: { ...defaultContent(templateFor(template)), brand: { ...defaultContent(templateFor(template)).brand, name } },
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "That link is already taken." };
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { id: data.id };
}

/** Save content for a site you own. Whatever arrives is cleaned first:
 *  unknown keys dropped, text length-limited, links and images checked. */
export async function saveSiteContent(siteId: string, content: SiteContent, name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };

  const { data: row } = await supabase.from("sites").select("template, name, content").eq("id", siteId).eq("user_id", user.id).maybeSingle();
  if (!row) return { error: "That site was not found." };
  const clean = sanitizeContent(content, readContent(row.content, row.template, row.name));

  const { error } = await supabase
    .from("sites")
    .update({ content: clean, name: name.trim().slice(0, 60) || clean.brand.name })
    .eq("id", siteId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  // "layout" refreshes the sidebar too, so the dashboard picks up a new colour.
  revalidatePath(`/dashboard/${siteId}`, "layout");
  return { ok: true };
}

/** Apply a change Wintech AI proposed, after the owner pressed Apply.
 *  The patch is merged into what is stored now and cleaned again. */
export async function applySitePatch(siteId: string, patch: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };
  const { data: row } = await supabase.from("sites").select("template, name, content").eq("id", siteId).eq("user_id", user.id).maybeSingle();
  if (!row) return { error: "That site was not found." };
  const next = applyPatch(readContent(row.content, row.template, row.name), patch);
  const { error } = await supabase.from("sites").update({ content: next }).eq("id", siteId).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${siteId}`, "layout");
  return { ok: true };
}

async function owner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function setPublished(siteId: string, published: boolean) {
  const { supabase, user } = await owner();
  if (!user) return { error: "Sign in first." };
  const { error } = await supabase.from("sites").update({ published }).eq("id", siteId).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${siteId}`, "layout");
  return { ok: true };
}

export async function renameSite(siteId: string, name: string) {
  const { supabase, user } = await owner();
  if (!user) return { error: "Sign in first." };
  const clean = name.trim().slice(0, 60);
  if (!clean) return { error: "Give the site a name." };
  const { error } = await supabase.from("sites").update({ name: clean }).eq("id", siteId).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${siteId}`, "layout");
  return { ok: true };
}

/** Where customers send money. Kept out of the site's content, so that
 *  neither Wintech AI nor a Claude connector can ever write it. */
export async function saveBankDetails(
  siteId: string,
  bank: { bank: string; account_name: string; account_number: string; note: string },
) {
  const { supabase, user } = await owner();
  if (!user) return { error: "Sign in first." };

  const account = bank.account_number.replace(/[^0-9]/g, "");
  const name = bank.bank.trim().slice(0, 60);
  const holder = bank.account_name.trim().slice(0, 80);

  // Empty is allowed: it clears the details and turns checkout back off.
  const clearing = !account && !name && !holder;
  if (!clearing) {
    if (!name) return { error: "Which bank?" };
    if (!holder) return { error: "Put the name on the account." };
    if (account.length !== 10) return { error: "A Nigerian account number is ten digits." };
  }

  const payment = clearing
    ? {}
    : { bank: name, account_name: holder, account_number: account, note: bank.note.trim().slice(0, 200) };

  const { error } = await supabase.from("sites").update({ payment }).eq("id", siteId).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${siteId}`, "layout");
  return { ok: true };
}

/** Changes the address a site answers on.
 *
 *  The old address is kept in former_slugs, so links already shared on
 *  WhatsApp, printed on a flyer, or indexed by Google keep working: the
 *  site page redirects them to the new one. Nobody else can claim the old
 *  name afterwards. */
export async function changeSiteLink(siteId: string, next: string) {
  const { supabase, user } = await owner();
  if (!user) return { error: "Sign in first." };

  const slug = normalizeSlug(next);
  const bad = slugError(slug);
  if (bad) return { error: bad };

  const { data: site } = await supabase
    .from("sites")
    .select("slug, former_slugs")
    .eq("id", siteId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!site) return { error: "That site is not yours." };
  if (site.slug === slug) return { ok: true };

  const { data: free } = await supabase.rpc("slug_available", { p_slug: slug });
  if (free === false) return { error: "That name is taken. Try another." };

  const kept = [...new Set([...(site.former_slugs || []), site.slug])].slice(-10);
  const { error } = await supabase
    .from("sites")
    .update({ slug, former_slugs: kept })
    .eq("id", siteId)
    .eq("user_id", user.id);
  if (error) {
    return { error: /duplicate|unique/i.test(error.message) ? "That name is taken. Try another." : error.message };
  }

  revalidatePath(`/dashboard/${siteId}`, "layout");
  return { ok: true, slug };
}

/** Deletes a site for good. The caller must type the site's link to confirm. */
export async function deleteSite(siteId: string, confirmSlug: string) {
  const { supabase, user } = await owner();
  if (!user) return { error: "Sign in first." };
  const { data: site } = await supabase.from("sites").select("slug").eq("id", siteId).eq("user_id", user.id).maybeSingle();
  if (!site) return { error: "That site was not found." };
  if (confirmSlug.trim().toLowerCase() !== site.slug) return { error: "Type the link exactly to confirm." };
  const { error } = await supabase.from("sites").delete().eq("id", siteId).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
