import { CookieNotice } from "@/components/marketing/CookieNotice";
import { ClosingCTA, Footer } from "@/components/v4/Footer";
import { Header } from "@/components/v4/Header";
import { AIAssistant, Domains, Faq, Hero, HowItWorks, Payments, PricingTeaser, TemplateGallery } from "@/components/v4/home";
import { isSignedIn } from "@/lib/session";

/* v4 home (Figma: Wintech Templates, page 17, "Desktop / Home" and "Phone / Home"). */

export default async function HomePage() {
  const signedIn = await isSignedIn();
  return (
    <main className="v4">
      <Header signedIn={signedIn} />
      <div className="bg-grid">
        <Hero />
      </div>
      <HowItWorks />
      <TemplateGallery />
      <AIAssistant />
      <Payments />
      <Domains />
      <PricingTeaser />
      <Faq />
      <ClosingCTA />
      <Footer />
      <CookieNotice />
    </main>
  );
}
