import Link from "next/link";
import { LayoutTemplate, Plus } from "lucide-react";
import { HomeView } from "@/components/dashboard/HomeView";
import { loadAccount } from "@/lib/dashboard";

/* Where everyone lands after logging in. */
export default async function AccountHome() {
  const a = await loadAccount();

  if (a.rows.length === 0) {
    return (
      <div className="mx-auto flex max-w-[520px] flex-col items-center py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-[16px] bg-accent text-accent-ink"><Plus className="h-6 w-6" /></span>
        <h1 className="mt-6 text-[26px] font-medium tracking-[-0.02em]">Welcome, {a.user.name.split(" ")[0]}</h1>
        <p className="mt-2 text-[15.5px] leading-relaxed text-mute">
          Create your first site. It goes live at yourname.wintechstudio.com, and everything else is managed from here.
        </p>
        <div className="mt-7 flex gap-2">
          <Link href="/dashboard/templates" className="btn-soft"><LayoutTemplate className="h-4 w-4" /> See templates</Link>
          <Link href="/dashboard/new" className="btn-primary">Create a site</Link>
        </div>
      </div>
    );
  }

  return (
    <HomeView
      base="/dashboard"
      user={a.user}
      rows={a.rows}
      sites={a.sites}
      credits={a.credits}
      aiEdits={a.aiEdits}
      siteHref={(id) => `/dashboard/${id}`}
    />
  );
}
