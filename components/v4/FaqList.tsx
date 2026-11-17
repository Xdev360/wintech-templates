import { Minus, Plus } from "lucide-react";

/* Centred FAQ list (Pricing questions, help pages). */
export function FaqList({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <section className="wrap py-[120px] max-md:py-20">
      <h2 className="h2s text-center">{title}</h2>
      <div className="mx-auto mt-12 flex max-w-[720px] flex-col gap-3">
        {items.map(([q, a], i) => (
          <details key={q} open={i === 0} className="bg-[var(--v4-soft)]">
            <summary className="flex items-center gap-4 px-5 py-5 text-[16px] font-medium">
              <span className="hair flex h-6 w-6 shrink-0 items-center justify-center bg-white">
                <Plus className="faq-plus h-[14px] w-[14px]" strokeWidth={1.5} />
                <Minus className="faq-minus h-[14px] w-[14px]" strokeWidth={1.5} />
              </span>
              {q}
            </summary>
            <p className="px-5 pb-6 pl-[60px] text-[15px] leading-[22px] text-[var(--v4-m75)]">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
