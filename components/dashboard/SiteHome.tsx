import Link from "next/link";
import { ArrowRight, CircleAlert, ExternalLink, MessageSquare, Package, Plus, Sparkles } from "lucide-react";
import type { SiteContent } from "@/lib/site-model";
import type { ShellSite, ShellUser } from "@/lib/dashboard-types";
import { Mascot } from "@/components/v4/Mascot";
import { setupSteps } from "./OverviewView";

/* ──────────────────────────────────────────────────────────────
   A site's Home (Figma page 24, ST1 and the Home of each site type).
   Every number comes from the database: orders, enquiries, the setup
   checklist. Where Wintech has no data yet (visitors, payouts) the card
   says what it will show instead of a made-up figure.
   ────────────────────────────────────────────────────────────── */

export type HomeOrder = { id: string; reference: string; customer_name: string; total_kobo: number; status: string; created_at: string };
export type HomeEnquiry = { id: string; name: string; message: string; created_at: string; read_at: string | null };

const naira = (kobo: number) => `₦${Math.round(kobo / 100).toLocaleString("en-NG")}`;
const STATUS: Record<string, [string, string]> = {
  awaiting: ["Waiting for payment", "bg-[rgba(10,14,23,0.06)] text-[rgba(10,14,23,0.75)]"],
  claimed: ["Customer says paid", "bg-[rgba(249,115,22,0.16)] text-[#c2410c]"],
  confirmed: ["Paid", "bg-[#dcfce7] text-[#15803d]"],
  cancelled: ["Cancelled", "bg-[rgba(10,14,23,0.06)] text-[rgba(10,14,23,0.5)]"],
};

function greeting(d: Date) {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Lagos" }).format(d));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function SiteHome({
  base, site, user, content, template, siteUrl, orders, enquiries,
}: {
  base: string; site: ShellSite; user: ShellUser; content: SiteContent; template: string; siteUrl: string;
  orders: HomeOrder[]; enquiries: HomeEnquiry[];
}) {
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Lagos" }).format(now);
  const dayKey = (d: string | Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date(d));
  const todays = orders.filter((o) => dayKey(o.created_at) === dayKey(now) && o.status !== "cancelled");
  const salesToday = todays.filter((o) => o.status === "confirmed").reduce((s, o) => s + o.total_kobo, 0);
  const toConfirm = orders.filter((o) => o.status === "claimed");
  const weekAgo = now.getTime() - 7 * 864e5;
  const paidWeek = orders.filter((o) => o.status === "confirmed" && +new Date(o.created_at) > weekAgo).reduce((s, o) => s + o.total_kobo, 0);
  const unread = enquiries.filter((e) => !e.read_at);
  const steps = setupSteps(content, site.published, base, template);
  const nextStep = steps.find((s) => !s.done);
  const first = user.name.split(/\s+/)[0] || "there";
  const store = site.kind === "store";
  const addLabel = store ? "Add product" : site.kind === "booking" ? "Add service" : site.kind === "portfolio" ? "Add project" : "Edit site";

  const stats: [string, string, string][] = store
    ? [
        ["Sales today", naira(salesToday), todays.length ? `${todays.length} order${todays.length === 1 ? "" : "s"} today` : "No orders yet today"],
        ["Orders", String(orders.filter((o) => o.status !== "cancelled").length), toConfirm.length ? `${toConfirm.length} to confirm` : "All caught up"],
        ["Enquiries", String(enquiries.length), unread.length ? `${unread.length} not read yet` : "All read"],
        ["Paid this week", naira(paidWeek), "Bank transfers you confirmed"],
      ]
    : [
        ["Enquiries", String(enquiries.length), unread.length ? `${unread.length} not read yet` : "All read"],
        ["This week", String(enquiries.filter((e) => +new Date(e.created_at) > weekAgo).length), "New messages from your site"],
        ["Setup", `${steps.filter((s) => s.done).length} of ${steps.length}`, nextStep ? `Next: ${nextStep.label}` : "All done"],
        ["Site", site.published ? "Live" : "Hidden", site.published ? `${site.slug}.wintechstudio.com` : "Publish when you are ready"],
      ];

  const todo: { icon: typeof Package; title: string; sub: string; href: string }[] = [];
  if (toConfirm.length) todo.push({ icon: Package, title: `Confirm ${toConfirm.length} payment${toConfirm.length === 1 ? "" : "s"}`, sub: "Customers say they have paid. Check your bank, then confirm.", href: `${base}/orders` });
  if (unread.length) todo.push({ icon: MessageSquare, title: `Reply to ${unread.length} enquir${unread.length === 1 ? "y" : "ies"}`, sub: "Wintech AI can draft the replies", href: `${base}/inbox` });
  steps.filter((s) => !s.done).slice(0, 3 - Math.min(todo.length, 2)).forEach((s) => todo.push({ icon: CircleAlert, title: s.label, sub: "Part of finishing your site", href: s.href }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">{greeting(now)}, {first}</h1>
          <p className="mt-1 text-[15px] text-[rgba(10,14,23,0.75)]">Here is {site.name} today, {today}.</p>
        </div>
        <div className="flex gap-2">
          <a href={siteUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><ExternalLink className="h-4 w-4" strokeWidth={1.5} /> View site</a>
          <Link href={store || site.kind !== "landing" ? `${base}/site?part=items` : `${base}/site`} className="btn btn-primary btn-sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> {addLabel}</Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([k, v, s]) => (
          <div key={k} className="hair bg-white p-5">
            <p className="text-[13px] text-[rgba(10,14,23,0.75)]">{k}</p>
            <p className="count-up mt-2 text-[28px] font-semibold tracking-[-0.02em] tabular-nums">{v}</p>
            <p className="mt-1 truncate text-[12px] text-[rgba(10,14,23,0.62)]">{s}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <section className="hair bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold">{store ? "Recent orders" : "Recent enquiries"}</h2>
            <Link href={store ? `${base}/orders` : `${base}/inbox`} className="flex items-center gap-1.5 text-[14px] font-medium text-[var(--v4-blue)] underline underline-offset-2">
              {store ? "All orders" : "Open inbox"} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
          {store ? (
            orders.length ? (
              <div className="hair mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-[14px]">
                  <thead><tr className="border-b border-[var(--v4-line)] bg-[#fafafa] text-left text-[12px] text-[rgba(10,14,23,0.62)]">
                    <th className="px-4 py-2.5 font-medium">Order</th><th className="px-4 py-2.5 font-medium">Customer</th><th className="px-4 py-2.5 font-medium">Total</th><th className="px-4 py-2.5 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {orders.slice(0, 6).map((o) => {
                      const [label, cls] = STATUS[o.status] ?? STATUS.awaiting;
                      return (
                        <tr key={o.id} className="border-b border-[var(--v4-line)] last:border-0">
                          <td className="px-4 py-3.5 font-medium">{o.reference}</td>
                          <td className="px-4 py-3.5">{o.customer_name}</td>
                          <td className="px-4 py-3.5 tabular-nums">{naira(o.total_kobo)}</td>
                          <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-[2px] px-2 py-0.5 text-[12px] ${cls}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <Empty text="No orders yet. Share your site link on WhatsApp and Instagram to get the first one." href={siteUrl} cta="Open your site" />
          ) : enquiries.length ? (
            <ul className="hair mt-4">
              {enquiries.slice(0, 6).map((e) => (
                <li key={e.id} className="flex items-start gap-3 border-b border-[var(--v4-line)] px-4 py-3 last:border-0">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.read_at ? "bg-transparent" : "bg-[var(--v4-blue)]"}`} />
                  <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{e.name}</span><span className="block truncate text-[13px] text-[rgba(10,14,23,0.62)]">{e.message}</span></span>
                </li>
              ))}
            </ul>
          ) : <Empty text="No enquiries yet. They land here when someone fills the form on your site." href={siteUrl} cta="Open your site" />}
        </section>

        <div className="flex flex-col gap-4">
          <section className="hair bg-white p-5">
            <h2 className="text-[17px] font-semibold">To do today</h2>
            {todo.length ? (
              <ul className="mt-3">
                {todo.map((t) => (
                  <li key={t.title} className="border-t border-[var(--v4-line)] first:border-0">
                    <Link href={t.href} className="flex items-start gap-3 py-3 hover:opacity-80">
                      <span className="hair grid h-8 w-8 shrink-0 place-items-center"><t.icon className="h-4 w-4" strokeWidth={1.5} /></span>
                      <span><span className="block text-[14px] font-medium">{t.title}</span><span className="block text-[12px] text-[rgba(10,14,23,0.62)]">{t.sub}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-[14px] text-[rgba(10,14,23,0.75)]">Nothing waiting. Good work.</p>}
          </section>
          <section className="flex flex-col gap-3 bg-[rgba(59,91,255,0.06)] p-5">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-[var(--v4-blue)]"><Mascot eyes="happy" size={22} /> Wintech AI</p>
            <p className="text-[14px] leading-[21px]">
              {nextStep ? `Your site is ${steps.filter((s) => s.done).length} of ${steps.length} steps done. I can do "${nextStep.label.toLowerCase()}" with you now.` : "Ask me to change any words, prices or sections. I show you the change before anything goes live."}
            </p>
            <Link href={`${base}/ai`} className="btn btn-outline btn-sm w-fit !bg-white"><Sparkles className="h-4 w-4 text-[var(--v4-blue)]" strokeWidth={1.5} /> Ask Wintech AI</Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="mt-4 flex flex-col items-start gap-3 border border-dashed border-[var(--v4-line-2)] p-6">
      <p className="text-[14px] text-[rgba(10,14,23,0.75)]">{text}</p>
      <a href={href} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">{cta}</a>
    </div>
  );
}
