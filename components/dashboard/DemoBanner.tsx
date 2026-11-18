import Link from "next/link";
import { Eye } from "lucide-react";

/* Strip on the demo dashboard: sample data, nothing saves. */
export function DemoBanner() {
  return (
    <div className="v4 mb-6 flex flex-wrap items-center gap-3 border border-[rgba(59,91,255,0.25)] bg-[rgba(59,91,255,0.06)] px-4 py-3 text-[14px]">
      <Eye className="h-4 w-4 text-[var(--v4-blue)]" strokeWidth={1.5} />
      <span className="flex-1"><b className="font-semibold">Demo.</b> You are looking around a sample store, Glow &amp; Grace. Nothing you change here is saved.</span>
      <Link href="/create" className="btn btn-primary btn-sm">Build my own site</Link>
    </div>
  );
}
