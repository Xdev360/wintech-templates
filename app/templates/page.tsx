import type { Metadata } from "next";
import { Library } from "@/components/v4/library";
import { PageShell, PageTop } from "@/components/v4/PageShell";

export const metadata: Metadata = {
  title: "Templates · Wintech Templates",
  description: "Templates for salons, fashion stores, bakeries, restaurants, services and portfolios. Every one works on phones and takes Paystack.",
};

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const { group } = await searchParams;
  return (
    <PageShell>
      <PageTop
        eyebrow="Templates"
        title={<>Pick a template made for<br className="max-md:hidden" /> your business</>}
        intro="Every template works on phones, takes Paystack payments and can be edited by the AI assistant."
      />
      <Library initialGroup={group} />
    </PageShell>
  );
}
