import { Check, Send } from "lucide-react";
import { AssistantChat } from "@/components/dashboard/AssistantChat";
import { Label, PageHeader, Pill } from "@/components/dashboard/ui";
import { loadDashboard } from "@/lib/dashboard";

export default async function AssistantPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const d = await loadDashboard(id);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Wintech AI" sub={`Your assistant for ${d.site.name}. It reads your site and shows you changes you approve.`} />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
        <AssistantChat
          siteId={id}
          siteName={d.site.name}
          credits={d.credits}
          base={`/dashboard/${id}`}
          initialPrompt={typeof q === "string" ? q.slice(0, 500) : ""}
        />
        <aside className="flex flex-col gap-6">
          <section>
            <Label>It can change</Label>
            <ul className="mt-3 flex flex-col gap-2 text-[14px]">
              {["Every word on the page", "Products, services, and questions: add, remove, reorder", "The order of sections, and which show", "Your brand colour", "Email and phone, when you give them"].map((t) => (
                <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{t}</li>
              ))}
            </ul>
          </section>
          <section>
            <Label>Not yet</Label>
            <p className="mt-2 text-[14px] leading-relaxed text-mute">Photos. Upload them in the Site editor, and it will work around them.</p>
          </section>
          <section className="rounded-[16px] bg-soft p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[14px] font-medium"><Send className="h-4 w-4 text-[#229ED9]" /> On Telegram</span>
              <Pill>Soon</Pill>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-mute">The same assistant, in a chat with the Wintech bot. Same credits.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
