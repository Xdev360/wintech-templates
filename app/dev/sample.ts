import { defaultContent, templateFor } from "@/lib/site-model";
import type { SiteRow } from "@/lib/types";

/* Sample data for the development-only dashboard previews. */

export const SITE: SiteRow = {
  id: "sample",
  user_id: "sample-user",
  slug: "glowandgrace",
  name: "Glow & Grace",
  template: "store-skincare",
  custom_domain: null,
  published: true,
  created_at: "2026-09-01T10:00:00Z",
  updated_at: "2026-09-10T10:00:00Z",
  content: {
    ...defaultContent(templateFor("store-skincare")),
    theme: { accent: "#B5654A" },
    brand: { name: "Glow & Grace", logoUrl: "", email: "hello@glowandgrace.ng", phone: "" },
    hero: { ...defaultContent(templateFor("store-skincare")).hero, headline: "Gentle skincare that holds up in Lagos heat." },
  },
};

export const OTHER: SiteRow = { ...SITE, id: "sample-2", slug: "adastudio", name: "Ada Studio", template: "portfolio-designer", published: false, content: defaultContent(templateFor("portfolio-designer")) };
export const USER = { name: "Tolu Adebayo", email: "tolu@example.com", verified: true };


/* Messages, for checking the Inbox design without a published site. */
export const SAMPLE_MESSAGES = [
  {
    id: "m1",
    name: "Bisi Adeyemi",
    contact: "0803 555 0142",
    message: "Do you have the vitamin C serum in stock? I need two before Friday.",
    source: "site",
    created_at: new Date(Date.now() - 26 * 60000).toISOString(),
    read_at: null,
  },
  {
    id: "m2",
    name: "Tunde O.",
    contact: "tunde@example.com",
    message: "Can you deliver to Ikeja on a Sunday?",
    source: "site",
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    read_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
];
