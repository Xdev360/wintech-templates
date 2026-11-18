import Link from "next/link";
import type { ReactNode } from "react";
import { ScaledPreview } from "@/components/templates/ScaledPreview";
import { TemplateSite } from "@/components/templates/TemplateSite";
import { getTemplate } from "@/lib/templates";
import { Logo } from "./ui";

/* The page behind the sign-up and log-in modal (Figma "00 · v5 changes",
   Sign up, fuller background). A soft grid, a blue glow and four real
   templates floating at the edges, drifting slowly, so the modal never
   sits on an empty page. */
const FLOAT: { id: string; cls: string; r: number; delay: string }[] = [
  { id: "booking-salon", cls: "left-[4%] top-[16%]", r: -6, delay: "0s" },
  { id: "store-fashion", cls: "right-[4%] top-[12%]", r: 5, delay: "-2s" },
  { id: "store-food", cls: "left-[6%] bottom-[8%]", r: 4, delay: "-4s" },
  { id: "booking-restaurant", cls: "right-[5%] bottom-[10%]", r: -4, delay: "-1s" },
];

export function AuthBackdrop({ children }: { children: ReactNode }) {
  return (
    <main className="v4 relative min-h-screen overflow-hidden bg-[#f6f7fb]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(10,14,23,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(10,14,23,0.05) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[1100px] -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(closest-side, rgba(59,91,255,0.16), rgba(59,91,255,0.05) 60%, transparent)" }} />
        {FLOAT.map((f) => {
          const t = getTemplate(f.id);
          return t ? (
            <div key={f.id} className={`drift absolute w-[300px] max-xl:w-[240px] max-md:hidden ${f.cls}`} style={{ ["--r" as string]: `${f.r}deg`, animationDelay: f.delay }}>
              <div className="overflow-hidden border border-[rgba(10,14,23,0.1)] bg-white opacity-90 shadow-[0_20px_40px_-12px_rgba(10,14,23,0.18)]">
                <ScaledPreview ratio={300 / 200} initial={300 / 1280}><TemplateSite template={t} /></ScaledPreview>
              </div>
            </div>
          ) : null;
        })}
      </div>
      <header className="relative">
        <div className="wrap flex h-[74px] items-center justify-between">
          <Logo />
          <nav className="flex gap-8 text-[14px] font-medium max-sm:hidden">
            <Link href="/templates">Templates</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/demo">Dashboard demo</Link>
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
