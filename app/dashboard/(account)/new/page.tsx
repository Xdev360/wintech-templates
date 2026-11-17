import { redirect } from "next/navigation";

/* The new-site flow now lives at /create (Figma page 24, CS1 to CS5). */
export default async function NewSite({ searchParams }: { searchParams: Promise<{ template?: string; name?: string }> }) {
  const { template, name } = await searchParams;
  const q = new URLSearchParams();
  if (template) q.set("template", template);
  if (name) q.set("name", name);
  redirect(`/create${q.size ? `?${q}` : ""}`);
}
