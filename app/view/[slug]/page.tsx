import type { Metadata } from "next";
import { permanentRedirect, notFound } from "next/navigation";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { appOrigin, siteUrl } from "@/lib/origin";
import { readContent, templateFor } from "@/lib/site-model";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("slug, name, template, content, published")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data;
}

/** The address a site moved to, or nothing. */
async function movedTo(slug: string) {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("site_moved_to", { p_slug: slug });
  return typeof data === "string" && data ? data : null;
}

/* What WhatsApp, Instagram, and Google show when someone shares the link.
   Without this a shared site is a bare address with no picture, which is
   most of how these sites will travel. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return {};
  const c = readContent(data.content, data.template, data.name);
  const description = (c.hero.sub || c.about.body || `${c.brand.name}.`).slice(0, 160);
  const url = await siteUrl(slug);
  const image = `${await appOrigin()}/api/og/${slug}`;

  return {
    title: { default: c.brand.name, template: `%s · ${c.brand.name}` },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: c.brand.name,
      title: c.brand.name,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: c.brand.name }],
    },
    twitter: { card: "summary_large_image", title: c.brand.name, description, images: [image] },
  };
}

/* A customer's live site: their template's design with their content.

   If the address is not a site, it may be one a site used to answer on.
   Someone following a link from a flyer or an old WhatsApp message lands
   on the site rather than on a dead page. */
export default async function ViewSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) {
    const moved = await movedTo(slug);
    if (moved) permanentRedirect(await siteUrl(moved));
    notFound();
  }
  const content = readContent(data.content, data.template, data.name);
  return <TemplateSite template={templateFor(data.template)} content={content} slug={data.slug} live />;
}
