import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewFrame } from "@/components/templates/PreviewFrame";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { isSignedIn } from "@/lib/session";
import { getTemplate, kindLabel } from "@/lib/templates";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const t = getTemplate((await params).id);
  if (!t) return {};
  return { title: `${t.name} template · Wintech Templates`, description: t.blurb };
}

/* Full-screen live preview, opened from a template's detail page. */
export default async function TemplatePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const t = getTemplate((await params).id);
  if (!t) notFound();
  const signedIn = await isSignedIn();

  return (
    <PreviewFrame
      name={t.name}
      kind={kindLabel(t.kind)}
      useHref={signedIn ? `/dashboard/new?template=${t.id}` : `/create?template=${t.id}`}
    >
      <TemplateSite template={t} slug="preview" />
    </PreviewFrame>
  );
}
