import { PluginsView } from "@/components/dashboard/PluginsView";

export default async function PluginsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PluginsView base={`/dashboard/${id}`} />;
}
