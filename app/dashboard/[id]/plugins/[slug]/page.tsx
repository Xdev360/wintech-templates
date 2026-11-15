import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ConnectorPanel, type ConnectorLink } from "@/components/dashboard/ConnectorPanel";
import { PluginDetail } from "@/components/dashboard/PluginDetail";
import { getPlugin } from "@/components/dashboard/plugins";
import { loadDashboard } from "@/lib/dashboard";

export default async function PluginPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) notFound();
  const base = `/dashboard/${id}`;

  if (plugin.slug === "wintech-ai") {
    return <PluginDetail base={base} plugin={plugin} action={<Link href={`${base}/ai`} className="btn-primary">Open Wintech AI</Link>} />;
  }

  if (plugin.slug === "claude") {
    const d = await loadDashboard(id);
    const { data, error } = await d.supabase
      .from("connector_tokens")
      .select("id, label, prefix, created_at, last_used_at, revoked_at")
      .order("created_at", { ascending: false });
    const host = (await headers()).get("host") || "app.wintechstudio.com";
    const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
    return (
      <PluginDetail base={base} plugin={plugin} action={<a href="#connect" className="btn-primary">Connect</a>}>
        <ConnectorPanel origin={`${local ? "http" : "https"}://${host}`} links={error ? null : ((data || []) as ConnectorLink[])} local={local} />
      </PluginDetail>
    );
  }

  return <PluginDetail base={base} plugin={plugin} />;
}
