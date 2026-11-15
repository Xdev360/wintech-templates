import type { Metadata } from "next";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { Gallery } from "@/components/templates/Gallery";
import { isSignedIn } from "@/lib/session";
import { TEMPLATES } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Templates · Wintech Templates",
  description: "Stores, booking sites, portfolios and landing pages. Preview any template free.",
};

/* The library. The page is a frame; the gallery does the work, in the
   browser, so filtering is instant. */

export default async function TemplatesPage() {
  const signedIn = await isSignedIn();

  return (
    <main>
      <SiteHeader signedIn={signedIn} />

      <section className="mx-auto max-w-[1320px] px-5 pb-24 pt-10 md:px-8 md:pt-14">
        <h1 className="text-[28px] font-semibold leading-[1.04] tracking-[-0.03em] md:text-[36px]">
          Start with a template
        </h1>
        <p className="mt-3 max-w-[48ch] text-[14px] leading-[1.6] text-mute">
          Every one is a real, working site. Look around as long as you like. You only make an
          account when you have found the one you want.
        </p>

        <Gallery templates={TEMPLATES} />
      </section>

      <SiteFooter />
    </main>
  );
}
