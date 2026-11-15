import Link from "next/link";
import { PLUGINS, pluginHref, type Plugin } from "./plugins";
import { PageHeader, Pill } from "./ui";

/* The plugin store: tap a plugin like tapping an app, and its own page
   opens. Grouped by what works today, what is next, and what is planned. */

const GROUPS: { status: Plugin["status"]; title: string; sub: string }[] = [
  { status: "active", title: "Ready to use", sub: "On for every site." },
  { status: "soon", title: "Coming next", sub: "Being built now." },
  { status: "later", title: "Planned", sub: "On the way." },
];

export function PluginTile({ plugin, className = "h-14 w-14 rounded-[13px]", iconClass = "h-6 w-6" }: { plugin: Plugin; className?: string; iconClass?: string }) {
  const Icon = plugin.icon;
  return (
    <span className={`grid shrink-0 place-items-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_20px_-12px_rgba(0,0,0,0.5)] ${className}`} style={{ background: plugin.tile }}>
      <Icon className={iconClass} strokeWidth={1.8} />
    </span>
  );
}

export function StatusPill({ status }: { status: Plugin["status"] }) {
  return status === "active" ? <Pill tone="good">Active</Pill> : status === "soon" ? <Pill>Soon</Pill> : <Pill>Planned</Pill>;
}

export function PluginsView({ base }: { base: string }) {
  return (
    <div className="flex flex-col gap-9">
      <PageHeader title="Plugins" sub="Extra tools for your site. Tap one to see what it does." />
      {GROUPS.map((g) => {
        const list = PLUGINS.filter((p) => p.status === g.status);
        if (!list.length) return null;
        return (
          <section key={g.status}>
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-[15px] font-medium tracking-[-0.01em]">{g.title}</h2>
              <p className="text-[12px] text-mute">{g.sub}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {list.map((p) => (
                <Link key={p.slug} href={p.slug === "wintech-ai" ? `${base}/plugins/${p.slug}` : pluginHref(base, p)}
                  className="group flex flex-col gap-4 rounded-[18px] p-4 shadow-[0_0_0_1px_var(--line)] transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--line-2),0_18px_40px_-26px_rgba(0,0,0,0.4)]">
                  <div className="flex items-start justify-between">
                    <PluginTile plugin={p} />
                    <StatusPill status={p.status} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium">{p.label}</p>
                    <p className="text-[12px] text-mute-2">{p.category}</p>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-mute">{p.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
