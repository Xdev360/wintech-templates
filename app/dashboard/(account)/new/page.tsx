import { NewSiteView } from "@/components/dashboard/NewSiteView";
import { PageHeader } from "@/components/dashboard/ui";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { getTemplate, TEMPLATES } from "@/lib/templates";

export default async function NewSite({ searchParams }: { searchParams: Promise<{ template?: string; name?: string }> }) {
  const { template, name } = await searchParams;
  const cards = Object.fromEntries(
    TEMPLATES.map((t) => [t.id, <ScaledPreview key={t.id} initial={0.27}><TemplateSite template={t} /></ScaledPreview>]),
  );
  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="New site" sub="Pick a template, or tell Wintech AI about your business and it writes the site for you." />
      <NewSiteView
        templates={TEMPLATES.map(({ id, name, kind }) => ({ id, name, kind }))}
        cards={cards}
        initialTemplate={template && getTemplate(template) ? template : ""}
        initialName={typeof name === "string" ? name.slice(0, 60) : ""}
      />
    </div>
  );
}
