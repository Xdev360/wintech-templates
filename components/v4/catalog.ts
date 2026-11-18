import type { Kind } from "@/lib/templates";

/* How the v4 marketing pages label each template (Figma page 17,
   "Desktop / Templates" and "Desktop / Template detail"). Plain data, so
   both server and client components can import it. Order = newest first. */

export type Group = "Salons and beauty" | "Fashion" | "Bakeries and food" | "Restaurants" | "Services" | "Portfolios" | "Events";

export type CatalogEntry = { id: string; name: string; tag: string; group: Group; text: string; bestFor: string };

export const CATALOG: CatalogEntry[] = [
  { id: "booking-salon", name: "Salon booking", tag: "Salons", group: "Salons and beauty", text: "Take bookings and deposits for your salon.", bestFor: "Hair salons, barbers, nail and makeup artists" },
  { id: "store-fashion", name: "Fashion store", tag: "Fashion", group: "Fashion", text: "Sell your pieces with sizes and checkout.", bestFor: "Clothing, shoes, bags, accessories" },
  { id: "store-food", name: "Food and bakery", tag: "Bakeries", group: "Bakeries and food", text: "Menu, WhatsApp orders and delivery areas.", bestFor: "Bakeries, small chops, home kitchens" },
  { id: "booking-restaurant", name: "Restaurant", tag: "Restaurants", group: "Restaurants", text: "Show your menu and take table bookings.", bestFor: "Restaurants, lounges and cafés" },
  { id: "booking-consultant", name: "Consultant", tag: "Services", group: "Services", text: "Book calls and take payment up front.", bestFor: "Coaches, consultants, therapists and tutors" },
  { id: "store-skincare", name: "Skincare store", tag: "Beauty", group: "Salons and beauty", text: "A clean shop for beauty products.", bestFor: "Skincare brands, beauty shops, body-care makers" },
  { id: "landing-business", name: "Business landing", tag: "Services", group: "Services", text: "One page that explains what you do.", bestFor: "Logistics firms, agencies and service companies" },
  { id: "landing-event", name: "Event page", tag: "Events", group: "Events", text: "Sell tickets and share the details.", bestFor: "Conferences, launches and community events" },
  { id: "landing-waitlist", name: "Waitlist", tag: "Launch", group: "Services", text: "Collect emails before you open.", bestFor: "App launches, new products, early access" },
  { id: "portfolio-designer", name: "Designer portfolio", tag: "Portfolios", group: "Portfolios", text: "Show your design work and get hired.", bestFor: "Product, brand and graphic designers" },
  { id: "portfolio-developer", name: "Developer portfolio", tag: "Portfolios", group: "Portfolios", text: "Projects, stack and a contact form.", bestFor: "Frontend, backend and full-stack engineers" },
  { id: "portfolio-photographer", name: "Photographer portfolio", tag: "Portfolios", group: "Portfolios", text: "Full-bleed galleries and bookings.", bestFor: "Wedding, portrait and brand photographers" },
];

export const GROUPS: Group[] = ["Salons and beauty", "Fashion", "Bakeries and food", "Restaurants", "Services", "Portfolios", "Events"];

export const entry = (id: string) => CATALOG.find((c) => c.id === id);

/** The fact rows on a template's detail page, by kind. */
export function facts(kind: Kind, bestFor: string): [string, string][] {
  const head: [string, string] = ["Best for", bestFor];
  switch (kind) {
    case "store":
      return [head, ["Pages", "Home, Shop, Product, Cart, About, Contact"], ["Payments", "Bank transfer, confirmed by you"], ["Orders", "Checkout or WhatsApp"], ["Delivery", "Set areas and a fee for each"]];
    case "booking":
      return [head, ["Pages", "Home, Services, Book a slot, Contact"], ["Payments", "Deposits by bank transfer"], ["Bookings", "Pick a service, a day and a time"], ["Reminders", "Booking confirmed by email"]];
    case "portfolio":
      return [head, ["Pages", "Home, Work, About, Contact"], ["Enquiries", "A form that lands in your dashboard"], ["Work", "Projects with photos and a short story"], ["Address", "Free name.wintechstudio.com or your own domain"]];
    default:
      return [head, ["Pages", "One page with your offer and a form"], ["Leads", "Sign-ups and messages in your dashboard"], ["Sharing", "A link preview made for WhatsApp and Instagram"], ["Address", "Free name.wintechstudio.com or your own domain"]];
  }
}

export const PREVIEW_TABS: Record<Kind, string[]> = {
  store: ["Home", "Shop", "Product", "Checkout"],
  booking: ["Home", "Services", "Book", "Deposit"],
  portfolio: ["Home", "Work", "About", "Contact"],
  landing: ["Top", "Details", "Proof", "Sign up"],
};
