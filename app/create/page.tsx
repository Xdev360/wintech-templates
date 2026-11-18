import type { Metadata } from "next";
import { CreateSite } from "@/components/v4/CreateSite";
import { createClient } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/templates";

export const metadata: Metadata = { title: "Create your site · Wintech Templates" };
export const dynamic = "force-dynamic";

/* Create a site (Figma page 24, CS1 to CS5). Signed in, it builds a real
   site. Not signed in (sign-up is paused for now), it runs as a demo:
   every step plays through and nothing is saved. */
export default async function CreatePage({ searchParams }: { searchParams: Promise<{ template?: string; name?: string }> }) {
  const { template, name } = await searchParams;
  let user = null;
  try {
    const supabase = await createClient();
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    /* No session service reachable: run the demo. */
  }
  return <CreateSite demo={!user} initialTemplate={template && getTemplate(template) ? template : ""} initialName={typeof name === "string" ? name.slice(0, 60) : ""} />;
}
