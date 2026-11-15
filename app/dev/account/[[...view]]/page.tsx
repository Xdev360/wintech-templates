import { notFound } from "next/navigation";
import { AccountSettingsView } from "@/components/dashboard/AccountSettingsView";
import { AffiliateDashboard } from "@/components/affiliate/AffiliateDashboard";
import { AccountShell } from "@/components/dashboard/AccountShell";
import { CreditsView } from "@/components/dashboard/CreditsView";
import { HomeView } from "@/components/dashboard/HomeView";
import { TemplatesView } from "@/components/dashboard/TemplatesView";
import { PageHeader } from "@/components/dashboard/ui";
import { NewSiteView } from "@/components/dashboard/NewSiteView";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { TEMPLATES } from "@/lib/templates";
import { toShellSite, withDefaults } from "@/lib/dashboard";
import { OTHER, SITE, USER } from "../../sample";

/* DEVELOPMENT ONLY. The account home and its pages with sample data.
   Returns 404 in production. */

const LEDGER = [
  { id: 3, delta: -1, reason: "ai_message", created_at: "2026-09-10T14:02:00Z" },
  { id: 2, delta: -1, reason: "ai_message", created_at: "2026-09-10T13:58:00Z" },
  { id: 1, delta: 20, reason: "welcome", created_at: "2026-09-01T10:00:00Z" },
];

export default async function DevAccount({ params }: { params: Promise<{ view?: string[] }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const view = (await params).view?.[0] ?? "";
  const base = "/dev/account";
  const rows = [SITE, OTHER].map(withDefaults);
  const sites = rows.map(toShellSite);

  let body;
  if (view === "") body = <HomeView base={base} user={USER} rows={rows} sites={sites} credits={18} aiEdits={{ sample: 2 }} siteHref={() => "/dev/dashboard"} />;
  else if (view === "templates") body = <TemplatesView base={base} kind={null} used={[{ name: "Skincare & beauty", kind: "Store", count: 1 }, { name: "Designer", kind: "Portfolio", count: 1 }]} />;
  else if (view === "credits") body = <CreditsView credits={18} history={LEDGER} />;
  else if (view === "settings") body = <AccountSettingsView userName={USER.name} email={USER.email} />;
  else if (view === "new") body = (<div className="flex flex-col gap-7"><PageHeader title="New site" sub="Pick a template, or tell Wintech AI about your business." /><NewSiteView templates={TEMPLATES.map(({ id, name, kind }) => ({ id, name, kind }))} cards={Object.fromEntries(TEMPLATES.map((x) => [x.id, <ScaledPreview key={x.id} initial={0.27}><TemplateSite template={x} /></ScaledPreview>]))} initialTemplate="" initialName="" /></div>);
  else if (view === "affiliate") body = <AffiliateDashboard />;
  else notFound();

  return <AccountShell base={base} sites={sites} user={USER} credits={18}>{body}</AccountShell>;
}
