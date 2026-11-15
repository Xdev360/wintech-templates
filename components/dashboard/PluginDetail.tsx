import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Check } from "lucide-react";
import type { Plugin } from "./plugins";
import { PluginTile, StatusPill } from "./PluginsView";

/* One plugin's page, like an app's page in a store: what it is, what it
   does, what it needs, what it can see, and what it costs. */
export function PluginDetail({ base, plugin, action, children }: { base: string; plugin: Plugin; action?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <Link href={`${base}/plugins`} className="inline-flex w-fit items-center gap-1.5 text-[12px] text-mute hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Plugins
      </Link>

      <header className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-center">
        <PluginTile plugin={plugin} className="h-20 w-20 rounded-[22px]" iconClass="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-medium tracking-[-0.02em]">{plugin.label}</h1>
            <StatusPill status={plugin.status} />
          </div>
          <p className="mt-1 text-[13px] text-mute">By Wintech · {plugin.category}</p>
          <p className="mt-2 max-w-[60ch] text-[13px] text-ink/85">{plugin.tagline}</p>
        </div>
        <div className="shrink-0">
          {action ?? (
            <button type="button" disabled className="btn-soft cursor-not-allowed opacity-60">
              {plugin.status === "soon" ? "Coming soon" : "Planned"}
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <section>
            <h2 className="text-[15px] font-medium">About</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-mute">{plugin.about}</p>
          </section>
          <section>
            <h2 className="text-[15px] font-medium">What it does</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {plugin.does.map((d) => (
                <li key={d} className="flex gap-2.5 rounded-[12px] bg-soft px-3.5 py-3 text-[13px]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-2" strokeWidth={2.4} />{d}
                </li>
              ))}
            </ul>
          </section>
          {children}
        </div>
        <aside className="flex flex-col gap-3 self-start">
          {[["Needs", plugin.needs], ["Can see", plugin.sees], ["Cost", plugin.cost]].map(([k, v]) => (
            <div key={k} className="rounded-[13px] p-4 shadow-[0_0_0_1px_var(--line)]">
              <p className="text-[12px] font-medium uppercase tracking-[0.07em] text-mute-2">{k}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed">{v}</p>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
