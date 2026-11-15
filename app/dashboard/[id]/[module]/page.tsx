import { notFound } from "next/navigation";
import { MODULES, SoonView } from "@/components/dashboard/SoonView";

export default async function ModulePage({ params }: { params: Promise<{ id: string; module: string }> }) {
  const { id, module } = await params;
  if (!MODULES[module]) notFound();
  return <SoonView module={module} base={`/dashboard/${id}`} />;
}
