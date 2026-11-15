import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageHeader, Pill } from "./ui";

/* A module that is designed but not built. It says plainly what it
   will do, so the sidebar shows the whole shape of the product without
   pretending the empty parts work. */

export const MODULES: Record<string, { title: string; what: string; points: string[] }> = {
  analytics: {
    title: "Analytics",
    what: "How many people visit, where they come from, and what they do next.",
    points: ["Visits by day", "Top pages and sources", "Messages and orders per visit"],
  },
  bookings: {
    title: "Bookings",
    what: "Your calendar of appointments and requests.",
    points: ["Confirm or decline", "Upcoming at a glance", "Reminders for your customers"],
  },
};

export function SoonView({ module, base }: { module: string; base: string }) {
  const m = MODULES[module];
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={m.title} sub={m.what} actions={<Pill>Coming soon</Pill>} />
      <div className="grid gap-3 md:grid-cols-3">
        {m.points.map((p, i) => (
          <div key={p} className="rounded-[13px] bg-soft p-4">
            <p className="text-[12px] font-medium text-accent">0{i + 1}</p>
            <p className="mt-1.5 text-[13px] leading-snug">{p}</p>
          </div>
        ))}
      </div>
      <p className="text-[13px] text-mute">
        Want this sooner?{" "}
        <Link href={`${base}/ai`} className="inline-flex items-center gap-1 font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Wintech AI
        </Link>{" "}
        can already change your site&apos;s words and colour.
      </p>
    </div>
  );
}
