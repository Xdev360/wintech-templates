import type { ReactNode } from "react";
import { isSignedIn } from "@/lib/session";
import { ClosingCTA, Footer } from "./Footer";
import { Header } from "./Header";

/* Header, page, closing band and footer: the frame every v4 marketing page shares. */
export async function PageShell({ children, cta = true }: { children: ReactNode; cta?: boolean }) {
  const signedIn = await isSignedIn();
  return (
    <main className="v4">
      <Header signedIn={signedIn} />
      {children}
      {cta && <ClosingCTA />}
      <Footer />
    </main>
  );
}

/* The centred page top: eyebrow, H1-sized title, intro. */
export function PageTop({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="wrap flex flex-col items-center pb-12 pt-[96px] text-center max-md:pt-14">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="h2 mt-5 max-w-[900px]">{title}</h1>
      {intro && <p className="intro mt-5 max-w-[640px]">{intro}</p>}
      {children}
    </section>
  );
}
