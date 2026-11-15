import { PageHeader, Pill } from "@/components/dashboard/ui";

/* Selling templates, from inside the account. Not open yet; it says what
   it will be so the sidebar item is not a dead end. */
export default function SellPage() {
  return (
    <div className="flex max-w-[760px] flex-col gap-5">
      <PageHeader title="Sell templates" sub="Design a template, list it, keep 70% of every sale." actions={<Pill>Opening soon</Pill>} />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Apply", "Show two designs. We look at craft."],
          ["Publish", "Build it, or build it with Claude. Set your price."],
          ["Get paid", "70% of each sale, monthly, by transfer."],
        ].map(([t, b]) => (
          <div key={t} className="rounded-[12px] p-3.5 shadow-[0_0_0_1px_var(--line)]">
            <p className="text-[13px] font-medium">{t}</p>
            <p className="mt-0.5 text-[12px] leading-[1.5] text-mute">{b}</p>
          </div>
        ))}
      </div>
      <p className="text-[12px] text-mute">
        Want to be in the first group? Send two designs to{" "}
        <a className="text-ink underline underline-offset-2" href="https://www.wintechstudio.com/contact.html">Wintech Studio</a>.
      </p>
    </div>
  );
}
