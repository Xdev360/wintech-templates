import Link from "next/link";
import { Mark } from "@/components/shell/Mark";

/* ──────────────────────────────────────────────────────────────
   One frame for sign up, log in, and password reset. Only the form
   inside it changes.

   The page is the hero illustration, light or dark with the system.
   The left panel is glass: it blurs the illustration behind it, and
   that blur is where the colour comes from. No painted gradient.
   ────────────────────────────────────────────────────────────── */

const STEPS = [
  { n: 1, title: "Create your account", note: "An email and a password. Nothing else." },
  { n: 2, title: "Pick a template", note: "Twelve designs. Change the words and photos." },
  { n: 3, title: "Publish your site", note: "Live at your-name.wintechstudio.com." },
];

export function AuthShell({
  title,
  sub,
  step = 1,
  children,
}: {
  title: string;
  sub?: string;
  /** Which step is lit on the left. Log in lights none. */
  step?: number;
  children: React.ReactNode;
}) {
  return (
    <main className="hero-art relative min-h-screen px-3 py-3 sm:px-6 sm:py-8 lg:grid lg:place-items-center">
      <div className="relative mx-auto flex w-full max-w-[1140px] flex-col-reverse overflow-hidden rounded-[26px] shadow-[0_50px_120px_-55px_rgba(10,16,30,0.75)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(380px,42%)]">
        <section className="relative flex flex-col justify-between gap-8 p-6 text-white sm:p-8 lg:p-9">
          {/* The blur is its own layer behind the words. Put content inside a
              backdrop-filtered element and the browser blurs that too. */}
          <div aria-hidden="true" className="auth-glass absolute inset-0" />

          <Link href="/" className="relative z-10 flex items-center gap-2 text-[16px] font-semibold tracking-[-0.02em]">
            <Mark />
            Wintech <span className="font-normal text-white/70">Templates</span>
          </Link>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-[13px] font-medium">
              Join us to build 🚀
            </span>
            <h2 className="mt-4 text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[40px]">
              Start your journey
            </h2>
            <p className="mt-2.5 max-w-[44ch] text-[14.5px] leading-[1.6] text-white/80">
              Follow these simple steps to put your business online today.
            </p>
          </div>

          <ol className="relative z-10 grid gap-3 sm:grid-cols-3">
            {STEPS.map((s) => {
              const on = s.n === step;
              return (
                <li
                  key={s.n}
                  className={
                    on
                      ? "rounded-[16px] bg-white p-4 text-[#0a0a0a] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)]"
                      : "rounded-[16px] bg-white/12 p-4 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
                  }
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-[12.5px] font-semibold ${
                      on ? "bg-[#2f4fe0] text-white" : "bg-white/25 text-white"
                    }`}
                  >
                    {s.n}
                  </span>
                  <p className="mt-5 text-[13.5px] font-medium leading-[1.35]">{s.title}</p>
                  <p className={`mt-1 text-[12px] leading-[1.45] ${on ? "text-[#5b6170]" : "text-white/70"}`}>{s.note}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="relative z-10 flex items-center justify-center bg-white p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-[380px]">
            <h1 className="text-center text-[26px] font-semibold tracking-[-0.025em] text-[#0a0a0a]">{title}</h1>
            {sub ? <p className="mt-1.5 text-center text-[13.5px] text-[#5b6170]">{sub}</p> : null}
            <div className="mt-6">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
