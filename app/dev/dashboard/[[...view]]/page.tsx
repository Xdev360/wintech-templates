import { notFound } from "next/navigation";
import Link from "next/link";
import { AssistantChat } from "@/components/dashboard/AssistantChat";
import { ConnectorPanel } from "@/components/dashboard/ConnectorPanel";
import { DesktopOnly } from "@/components/dashboard/DesktopOnly";
import { PluginDetail } from "@/components/dashboard/PluginDetail";
import { getPlugin } from "@/components/dashboard/plugins";
import { InboxView } from "@/components/dashboard/InboxView";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { OrdersView } from "@/components/dashboard/OrdersView";
import { PluginsView } from "@/components/dashboard/PluginsView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { Shell } from "@/components/dashboard/Shell";
import { MODULES, SoonView } from "@/components/dashboard/SoonView";
import { PageHeader } from "@/components/dashboard/ui";
import { Editor } from "@/components/editor/Editor";
import { toShellSite, withDefaults } from "@/lib/dashboard";
import { SAMPLE_MESSAGES, SITE, OTHER, USER } from "../../sample";

/* ──────────────────────────────────────────────────────────────
   DEVELOPMENT ONLY. Every dashboard screen with sample data, so the
   design can be checked without signing in. Returns 404 in production.
   Nothing here touches the database; buttons that save will fail.
   ────────────────────────────────────────────────────────────── */

export default async function DevDashboard({ params }: { params: Promise<{ view?: string[] }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const [view = "", sub] = (await params).view ?? [];
  const base = "/dev/dashboard";
  const url = `https://${SITE.slug}.wintechstudio.com`;

  let body;
  if (view === "") body = <OverviewView base={base} user={USER} site={toShellSite(SITE)} content={withDefaults(SITE).content} template={SITE.template} siteUrl={url} credits={18} />;
  else if (view === "site") body = <DesktopOnly what="Editing your site" base={base}><Editor site={withDefaults(SITE)} userId="sample-user" /></DesktopOnly>;
  else if (view === "ai") body = (<div className="flex flex-col gap-7"><PageHeader title="Wintech AI" sub="Your assistant for Glow & Grace." /><AssistantChat siteId="sample" siteName="Glow & Grace" credits={18} base={base} /></div>);
  else if (view === "inbox") body = <InboxView siteName={SITE.name} enquiries={SAMPLE_MESSAGES} />;
  else if (view === "plugins" && !sub) body = <PluginsView base={base} />;
  else if (view === "plugins") {
    const plugin = getPlugin(sub);
    if (!plugin) notFound();
    body = plugin.slug === "claude" ? (
      <PluginDetail base={base} plugin={plugin} action={<a href="#connect" className="btn-primary">Connect</a>}>
        <ConnectorPanel origin="http://localhost:3000" links={[]} local />
      </PluginDetail>
    ) : plugin.slug === "wintech-ai" ? (
      <PluginDetail base={base} plugin={plugin} action={<Link href={`${base}/ai`} className="btn-primary">Open Wintech AI</Link>} />
    ) : (
      <PluginDetail base={base} plugin={plugin} />
    );
  }
  else if (view === "orders") body = <OrdersView siteId="sample" hasBank orders={[
    { id: "1", reference: "WT-K4M2QP", customer_name: "Bisi Adeyemi", customer_phone: "08031234567", customer_email: null,
      items: [{ title: "Hydrating Cleanser", qty: 1, price_kobo: 850000 }, { title: "Vitamin C Serum", qty: 2, price_kobo: 1400000 }],
      total_kobo: 3650000, note: "Please deliver to Lekki Phase 1 after 4pm.", status: "claimed",
      created_at: "2026-09-16T09:10:00Z", claimed_at: "2026-09-16T09:44:00Z" },
    { id: "2", reference: "WT-B7NRXA", customer_name: "Funke Okon", customer_phone: "08079876543", customer_email: "funke@example.com",
      items: [{ title: "SPF 50 Sunscreen", qty: 1, price_kobo: 1100000 }],
      total_kobo: 1100000, note: null, status: "confirmed",
      created_at: "2026-09-15T07:20:00Z", claimed_at: null },
  ]} />;
  else if (view === "settings") body = <SettingsView base={base} siteId="sample" siteName={SITE.name} slug={SITE.slug} siteUrl={url} accent={withDefaults(SITE).content.theme.accent} published bank={{ bank: "GTBank", account_name: "Glow & Grace Ltd", account_number: "0123456789", note: "" }} />;
  else if (MODULES[view]) body = <SoonView module={view} base={base} />;
  else notFound();

  return (
    <Shell base={base} site={toShellSite(SITE)} sites={[toShellSite(SITE), toShellSite(OTHER)]} user={USER} credits={18}>
      {body}
    </Shell>
  );
}
