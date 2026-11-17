import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateSite } from "@/components/v4/CreateSite";
import { createClient } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/templates";

export const metadata: Metadata = { title: "Create your site · Wintech Templates" };
export const dynamic = "force-dynamic";

/* Create a site (Figma page 24, CS1 to CS5). Signed-in only. */
export default async function CreatePage({ searchParams }: { searchParams: Promise<{ template?: string; name?: string }> }) {
  const { template, name } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const q = new URLSearchParams();
    if (template) q.set("template", template);
    if (name) q.set("name", name);
    redirect(`/signup${q.size ? `?${q}` : ""}`);
  }
  return <CreateSite initialTemplate={template && getTemplate(template) ? template : ""} initialName={typeof name === "string" ? name.slice(0, 60) : ""} />;
}
