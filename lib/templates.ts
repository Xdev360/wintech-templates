/* ──────────────────────────────────────────────────────────────
   The template library.

   Templates live in code, not the database: they are versioned with
   the app, they load instantly, and a bad row cannot break one. A
   site stores only the template id (sites.template).

   Each description follows one formula, so the gallery reads evenly:
   "A [tone] [kind] template with [three things]. Perfect for [three
   audiences]."
   ────────────────────────────────────────────────────────────── */

export type Kind = "portfolio" | "landing" | "store" | "booking";

export const KINDS: { id: Kind; label: string; plural: string }[] = [
  { id: "portfolio", label: "Portfolio", plural: "Portfolios" },
  { id: "landing", label: "Landing page", plural: "Landing pages" },
  { id: "store", label: "Store", plural: "Stores" },
  { id: "booking", label: "Booking", plural: "Booking sites" },
];

export type Art =
  | "shapes"
  | "code"
  | "frames"
  | "orbs"
  | "ticket"
  | "phone"
  | "bottles"
  | "editorial"
  | "plates"
  | "calendar";

export type Theme = {
  bg: string;
  surface: string;
  ink: string;
  mute: string;
  line: string;
  accent: string;
  accentInk: string;
  display: "sans" | "serif" | "mono";
  displayWeight: number;
  radius: number;
  /** Four colours the drawn artwork and tiles are made from. */
  hues: [string, string, string, string];
};

export type Item = {
  title: string;
  meta?: string;
  price?: string;
  category?: string;
  stock?: number | null;
};

export type TemplateDef = {
  id: string;
  name: string;
  kind: Kind;
  /** Booking only: which booking engine the template runs on. */
  engine?: "appointment" | "reservation";
  blurb: string;
  keywords: string[];
  theme: Theme;
  site: {
    brand: string;
    nav: string[];
    cta: string;
    eyebrow: string;
    headline: string;
    sub: string;
    art: Art;
    itemsTitle: string;
    items: Item[];
    note?: string;
    stats?: [string, string][];
    aboutTitle: string;
    about: string;
    contactTitle: string;
    contactLine: string;
  };
};

export const TEMPLATES: TemplateDef[] = [
  /* ── Portfolio ─────────────────────────────────────────────── */
  {
    id: "portfolio-designer",
    name: "Designer",
    kind: "portfolio",
    blurb:
      "A calm designer portfolio with a case-study grid, a short about, and a book-a-call button. Perfect for product designers, brand designers, and illustrators.",
    keywords: [
      "design", "designer", "ui", "ux", "product designer", "brand designer",
      "graphic", "illustrator", "illustration", "creative", "figma", "portfolio",
    ],
    theme: {
      bg: "#F6F4EF", surface: "#ECE8DF", ink: "#141311", mute: "rgba(20,19,17,0.7)",
      line: "rgba(20,19,17,.12)", accent: "#FF5A1F", accentInk: "#FFFFFF",
      display: "sans", displayWeight: 600, radius: 14,
      hues: ["#FF5A1F", "#1F3BFF", "#FFC53D", "#141311"],
    },
    site: {
      brand: "Ada Studio",
      nav: ["Work", "About", "Contact"],
      cta: "Book a call",
      eyebrow: "Product and brand designer · Lagos",
      headline: "I design products people understand the first time.",
      sub: "Eight years shaping apps for fintech, logistics, and agritech teams. Currently taking two projects for the new year.",
      art: "shapes",
      itemsTitle: "Selected work",
      items: [
        { title: "Paylane", meta: "Checkout redesign · Fintech" },
        { title: "Harvest", meta: "Farm marketplace · Agritech" },
        { title: "Onward", meta: "Brand and site · Logistics" },
        { title: "Nest", meta: "Rental search · Proptech" },
      ],
      stats: [["8 yrs", "designing products"], ["30+", "launches"], ["2", "open slots"]],
      aboutTitle: "How I work",
      about: "A short discovery call, a written plan, then weekly reviews until it ships. You always see real screens, never mood boards alone.",
      contactTitle: "Have a project in mind?",
      contactLine: "Tell me what you are building. I reply within a day.",
    },
  },
  {
    id: "portfolio-developer",
    name: "Developer",
    kind: "portfolio",
    blurb:
      "A dark developer portfolio with a code-styled hero, a project list with stacks, and a hire-me form. Perfect for frontend, backend, and full-stack engineers.",
    keywords: [
      "developer", "dev", "engineer", "software", "programmer", "coder", "code",
      "frontend", "backend", "fullstack", "full stack", "web developer", "github", "portfolio",
    ],
    theme: {
      bg: "#0D1117", surface: "#161B22", ink: "#E6EDF3", mute: "rgba(230,237,243,0.7)",
      line: "rgba(230,237,243,.12)", accent: "#3FB950", accentInk: "#0D1117",
      display: "mono", displayWeight: 600, radius: 10,
      hues: ["#3FB950", "#58A6FF", "#D2A8FF", "#F78166"],
    },
    site: {
      brand: "tobi.dev",
      nav: ["Projects", "Stack", "Contact"],
      cta: "Hire me",
      eyebrow: "Full-stack engineer",
      headline: "I build fast web apps and ship them every week.",
      sub: "Next.js, Postgres, and payments. Five years building products for startups in Lagos, London, and Nairobi.",
      art: "code",
      itemsTitle: "Projects",
      items: [
        { title: "Ledgerly", meta: "Next.js · Postgres · Stripe" },
        { title: "Route Nine", meta: "React Native · Maps API" },
        { title: "Invoicer", meta: "Remix · Supabase" },
        { title: "Pulse", meta: "Go · WebSockets" },
      ],
      stats: [["5 yrs", "shipping"], ["14", "products live"], ["99.9%", "uptime kept"]],
      aboutTitle: "Stack",
      about: "TypeScript end to end, Postgres for anything that matters, and tests on the parts that take money.",
      contactTitle: "Need something built?",
      contactLine: "Send a short brief. You get a scope and a price in two days.",
    },
  },
  {
    id: "portfolio-photographer",
    name: "Photographer",
    kind: "portfolio",
    blurb:
      "An editorial photography portfolio with overlapping galleries, packages, and a booking request. Perfect for wedding, portrait, and brand photographers.",
    keywords: [
      "photo", "photos", "photographer", "photography", "videographer", "video",
      "wedding", "portrait", "portraits", "shoot", "filmmaker", "camera", "studio", "portfolio",
    ],
    theme: {
      bg: "#FAF8F4", surface: "#EFEAE2", ink: "#1A1714", mute: "rgba(26,23,20,0.7)",
      line: "rgba(26,23,20,.12)", accent: "#1A1714", accentInk: "#FAF8F4",
      display: "serif", displayWeight: 500, radius: 4,
      hues: ["#C9A27E", "#6B7F6A", "#2F2A26", "#D9C7B0"],
    },
    site: {
      brand: "Lens by Femi",
      nav: ["Galleries", "Packages", "Book"],
      cta: "Check a date",
      eyebrow: "Weddings · Portraits · Brands",
      headline: "Natural light, real moments, no stiff poses.",
      sub: "Photographing weddings and brands across Lagos and Abuja since 2016. Galleries delivered in two weeks.",
      art: "frames",
      itemsTitle: "Recent galleries",
      items: [
        { title: "Ikoyi Wedding", meta: "Full day · 620 photos" },
        { title: "Studio Portraits", meta: "Series · 2026" },
        { title: "Roastery Brand Shoot", meta: "Half day · Commercial" },
        { title: "Lagos Island", meta: "Street · Personal" },
      ],
      stats: [["200+", "weddings"], ["2 wks", "to your gallery"], ["4.9", "average review"]],
      aboutTitle: "Packages",
      about: "Portrait sessions from ₦80,000. Weddings from ₦650,000, second shooter included. Every package includes a private online gallery.",
      contactTitle: "Planning something?",
      contactLine: "Send your date and venue. I confirm availability the same day.",
    },
  },

  /* ── Landing page ──────────────────────────────────────────── */
  {
    id: "landing-business",
    name: "Business profile",
    kind: "landing",
    blurb:
      "A clean business landing page with a clear offer, three reasons to choose you, and a contact form. Perfect for logistics firms, agencies, and service companies.",
    keywords: [
      "business", "company", "firm", "agency", "corporate", "sme", "profile",
      "logistics", "services", "information", "info", "about us", "brand", "landing",
    ],
    theme: {
      bg: "#FFFFFF", surface: "#F2F5FB", ink: "#0B1220", mute: "rgba(11,18,32,0.7)",
      line: "rgba(11,18,32,.1)", accent: "#1E40AF", accentInk: "#FFFFFF",
      display: "sans", displayWeight: 600, radius: 12,
      hues: ["#1E40AF", "#60A5FA", "#A7F3D0", "#0B1220"],
    },
    site: {
      brand: "Northgate Logistics",
      nav: ["Services", "Coverage", "Contact"],
      cta: "Get a quote",
      eyebrow: "Delivery for Lagos businesses",
      headline: "Same-day delivery across Lagos, tracked to the door.",
      sub: "Forty riders, one dashboard, and a proof-of-delivery photo on every drop. Business accounts open in a day.",
      art: "orbs",
      itemsTitle: "Why teams switch to us",
      items: [
        { title: "Same day", meta: "Book before 1pm, delivered by 7pm, anywhere on the mainland or island." },
        { title: "Live tracking", meta: "Your customer gets a link. You stop answering “where is my order?”." },
        { title: "Business accounts", meta: "One invoice a month, bulk rates, and a named account manager." },
      ],
      stats: [["40", "riders"], ["12k", "drops a month"], ["98%", "on time"]],
      aboutTitle: "Coverage",
      about: "All of Lagos Mainland and Island, Lekki to Ikorodu. Interstate to Ibadan and Abeokuta three days a week.",
      contactTitle: "Moving parcels every week?",
      contactLine: "Tell us your volume and we will send bulk rates today.",
    },
  },
  {
    id: "landing-event",
    name: "Event",
    kind: "landing",
    blurb:
      "A bold event landing page with a ticket-style hero, the schedule at a glance, and a register button. Perfect for conferences, launches, and community events.",
    keywords: [
      "event", "events", "conference", "summit", "meetup", "concert", "party",
      "festival", "launch", "tickets", "ticket", "rsvp", "program", "programme", "church", "workshop",
    ],
    theme: {
      bg: "#150B26", surface: "#221338", ink: "#FFFFFF", mute: "rgba(255,255,255,0.7)",
      line: "rgba(255,255,255,.12)", accent: "#F5C518", accentInk: "#150B26",
      display: "sans", displayWeight: 700, radius: 16,
      hues: ["#F5C518", "#FF4D8D", "#7C5CFF", "#22D3EE"],
    },
    site: {
      brand: "Build Lagos ’26",
      nav: ["Speakers", "Schedule", "Venue"],
      cta: "Get a ticket",
      eyebrow: "14–15 November · Landmark Centre",
      headline: "Two days, forty speakers, one room full of builders.",
      sub: "Talks on day one, hands-on workshops on day two, and an after-party you will actually want to stay for.",
      art: "ticket",
      itemsTitle: "The two days",
      items: [
        { title: "Day one · Talks", meta: "Founders and engineers on what worked, what did not, and what they would do again." },
        { title: "Day two · Workshops", meta: "Small rooms, laptops open. Payments, AI, design, and hiring." },
        { title: "After-party", meta: "Rooftop, DJs, and the people you only met in the group chat." },
      ],
      stats: [["40", "speakers"], ["1,200", "seats"], ["2", "days"]],
      aboutTitle: "Venue",
      about: "Landmark Centre, Victoria Island. Parking on site, and a shuttle from Lekki Phase 1 every thirty minutes.",
      contactTitle: "Seats are limited.",
      contactLine: "Early tickets close on 1 October.",
    },
  },
  {
    id: "landing-waitlist",
    name: "Waitlist",
    kind: "landing",
    blurb:
      "A focused launch page with one promise, a phone mock-up, and an email waitlist. Perfect for app launches, new products, and early-access programmes.",
    keywords: [
      "waitlist", "wait list", "launch", "startup", "app", "coming soon", "early access",
      "pre-launch", "prelaunch", "beta", "new product", "mvp", "signup", "landing",
    ],
    theme: {
      bg: "#F7F7FC", surface: "#ECEBFA", ink: "#14122B", mute: "rgba(20,18,43,0.7)",
      line: "rgba(20,18,43,.1)", accent: "#6D4AFF", accentInk: "#FFFFFF",
      display: "sans", displayWeight: 600, radius: 18,
      hues: ["#6D4AFF", "#FF7AC6", "#7DD3FC", "#14122B"],
    },
    site: {
      brand: "Kora",
      nav: ["How it works", "FAQ"],
      cta: "Join the waitlist",
      eyebrow: "Launching in Lagos this December",
      headline: "Split rent with your flatmates, without the awkward messages.",
      sub: "Kora collects everyone’s share, pays the landlord on time, and reminds whoever is late. So you do not have to.",
      art: "phone",
      itemsTitle: "How it works",
      items: [
        { title: "Add your flat", meta: "Rent, due date, and who lives there. Two minutes." },
        { title: "Everyone pays in", meta: "Each flatmate gets their own share and their own reminder." },
        { title: "Landlord gets paid", meta: "In full, on time, with a receipt everyone can see." },
      ],
      aboutTitle: "Why we built it",
      about: "Because every flat has one person chasing everyone else, and that person is tired.",
      contactTitle: "Be first in.",
      contactLine: "Early members get their first three months free.",
    },
  },

  /* ── Store ─────────────────────────────────────────────────── */
  {
    id: "store-skincare",
    name: "Skincare & beauty",
    kind: "store",
    blurb:
      "A soft skincare store with a product grid, skin-type filters, and bank-transfer checkout. Perfect for skincare brands, beauty shops, and body-care makers.",
    keywords: [
      "skincare", "skin care", "skin", "beauty", "cosmetics", "makeup products", "serum",
      "cream", "lotion", "body", "glow", "organic", "soap", "perfume", "fragrance", "store", "shop",
    ],
    theme: {
      bg: "#FBF6F3", surface: "#F3E7E0", ink: "#2B1D18", mute: "rgba(43,29,24,0.7)",
      line: "rgba(43,29,24,.1)", accent: "#B5654A", accentInk: "#FFFFFF",
      display: "serif", displayWeight: 500, radius: 20,
      hues: ["#E8B4A0", "#B5654A", "#F3D9C8", "#8C9A7A"],
    },
    site: {
      brand: "Glow & Grace",
      nav: ["Shop", "Skin quiz", "About"],
      cta: "Shop now",
      eyebrow: "Made for Lagos heat",
      headline: "Gentle skincare that holds up in the humidity.",
      sub: "Small batches, clear ingredient lists, and delivery across Lagos in 48 hours.",
      art: "bottles",
      itemsTitle: "Bestsellers",
      items: [
        { title: "Hydrating Cleanser", price: "₦8,500", category: "Face" },
        { title: "Vitamin C Serum", price: "₦14,000", category: "Face" },
        { title: "Shea Body Butter", price: "₦6,500", category: "Body" },
        { title: "SPF 50 Sunscreen", price: "₦11,000", category: "Face" },
      ],
      note: "Pay by bank transfer at checkout · Delivery in 48 hours",
      aboutTitle: "What goes in",
      about: "Every ingredient is on the label in plain words. No fragrance in anything meant for your face.",
      contactTitle: "Not sure what suits you?",
      contactLine: "Send us a message with your skin type and we will put a routine together.",
    },
  },
  {
    id: "store-fashion",
    name: "Fashion",
    kind: "store",
    blurb:
      "An editorial fashion store with lookbook panels, sizes on every piece, and made-to-measure requests. Perfect for fashion designers, tailors, and boutiques.",
    keywords: [
      "fashion", "clothes", "clothing", "tailor", "tailoring", "dress", "dresses", "wear",
      "boutique", "fabric", "ankara", "agbada", "aso ebi", "shoes", "bags", "apparel", "store", "shop",
    ],
    theme: {
      bg: "#F2F0EB", surface: "#E4E0D7", ink: "#111111", mute: "rgba(17,17,17,0.7)",
      line: "rgba(17,17,17,.12)", accent: "#111111", accentInk: "#F2F0EB",
      display: "serif", displayWeight: 500, radius: 2,
      hues: ["#B24C2B", "#1E2A3A", "#D8C3A5", "#4A5A3C"],
    },
    site: {
      brand: "Maison Tolu",
      nav: ["New in", "Men", "Women", "Bespoke"],
      cta: "Shop the edit",
      eyebrow: "The harmattan edit",
      headline: "Made-to-measure pieces, cut in Lagos.",
      sub: "Linen, adire, and hand-finished seams. Every piece in standard sizes or cut to your measurements.",
      art: "editorial",
      itemsTitle: "New in",
      items: [
        { title: "Linen Agbada", price: "₦85,000" },
        { title: "Adire Wrap Dress", price: "₦42,000" },
        { title: "Boubou Set", price: "₦58,000" },
        { title: "Tailored Trousers", price: "₦28,000" },
      ],
      note: "Sizes XS to XXL · Custom fit on request",
      aboutTitle: "Bespoke",
      about: "Send your measurements or visit the studio in Yaba. Custom pieces take two to three weeks.",
      contactTitle: "Something specific in mind?",
      contactLine: "Tell us the occasion and the date. We will sketch it first.",
    },
  },
  {
    id: "store-food",
    name: "Food & bakery",
    kind: "store",
    blurb:
      "A warm food store with a menu grid, order-by times, and delivery zones. Perfect for bakeries, small-chops vendors, and home kitchens.",
    keywords: [
      "food", "bakery", "bake", "baker", "cake", "cakes", "pastry", "pastries", "snacks",
      "small chops", "chops", "bread", "kitchen", "meals", "meal prep", "chin chin", "catering", "store", "shop",
    ],
    theme: {
      bg: "#FFF8EE", surface: "#FBE9D2", ink: "#2A1A0A", mute: "rgba(42,26,10,0.7)",
      line: "rgba(42,26,10,.1)", accent: "#E4572E", accentInk: "#FFFFFF",
      display: "sans", displayWeight: 700, radius: 22,
      hues: ["#E4572E", "#F2A541", "#6B8F4E", "#8B4513"],
    },
    site: {
      brand: "Mama’s Oven",
      nav: ["Menu", "Cakes", "Delivery"],
      cta: "Order now",
      eyebrow: "Baked this morning",
      headline: "Fresh bakes, delivered warm across the mainland.",
      sub: "Meat pies, chin chin, banana bread, and birthday cakes. Order by 6pm for delivery tomorrow.",
      art: "plates",
      itemsTitle: "On the menu",
      items: [
        { title: "Meat Pie, box of 6", price: "₦4,800" },
        { title: "Chin Chin, 1kg", price: "₦5,500" },
        { title: "Banana Bread", price: "₦6,000" },
        { title: "Birthday Cake", price: "from ₦25,000" },
      ],
      note: "Order by 6pm for next-day delivery · Yaba, Surulere, Ikeja, Gbagada",
      aboutTitle: "Cakes to order",
      about: "Tell us the date, the flavour, and how many people. Custom cakes need three days’ notice.",
      contactTitle: "Planning a party?",
      contactLine: "Small chops trays for 20 to 200 guests. Message us the date.",
    },
  },

  /* ── Booking ───────────────────────────────────────────────── */
  {
    id: "booking-salon",
    name: "Salon & beauty",
    kind: "booking",
    engine: "appointment",
    blurb:
      "An elegant salon booking site with a service menu, prices and durations, and time-slot booking. Perfect for hair salons, barbers, and makeup artists.",
    keywords: [
      "salon", "hair", "braids", "braiding", "barber", "barbing", "barbershop", "nails", "lashes",
      "makeup", "makeup artist", "mua", "spa", "stylist", "wig", "wigs", "beauty", "appointment", "booking",
    ],
    theme: {
      bg: "#FAF5F2", surface: "#F1E4DF", ink: "#2A1420", mute: "rgba(42,20,32,0.7)",
      line: "rgba(42,20,32,.1)", accent: "#9D2B5A", accentInk: "#FFFFFF",
      display: "serif", displayWeight: 500, radius: 16,
      hues: ["#9D2B5A", "#E9B9C5", "#C58B6B", "#2A1420"],
    },
    site: {
      brand: "Crown Hair Studio",
      nav: ["Services", "Stylists", "Find us"],
      cta: "Book a slot",
      eyebrow: "Lekki Phase 1 · Open Tuesday to Sunday",
      headline: "Braids, silk press, and colour, booked in a minute.",
      sub: "Pick a service, pick a stylist, pick a time. A small deposit holds your slot.",
      art: "calendar",
      itemsTitle: "Services",
      items: [
        { title: "Knotless braids", meta: "4 to 5 hours", price: "₦35,000" },
        { title: "Silk press", meta: "2 hours", price: "₦18,000" },
        { title: "Wash and treatment", meta: "1 hour", price: "₦9,000" },
        { title: "Colour consultation", meta: "30 minutes", price: "Free" },
      ],
      note: "₦5,000 deposit by bank transfer holds your slot",
      aboutTitle: "Opening hours",
      about: "Tuesday to Saturday, 9am to 7pm. Sunday, 12pm to 6pm. Closed Mondays.",
      contactTitle: "Not sure which service you need?",
      contactLine: "Send a photo of your hair and we will tell you.",
    },
  },
  {
    id: "booking-consultant",
    name: "Consultant & coach",
    kind: "booking",
    engine: "appointment",
    blurb:
      "A focused consulting site with session types, a booking calendar, and a free intro call. Perfect for coaches, consultants, therapists, and tutors.",
    keywords: [
      "consultant", "consulting", "coach", "coaching", "therapist", "therapy", "counselling",
      "tutor", "tutoring", "lessons", "lawyer", "accountant", "advisor", "adviser", "mentor",
      "sessions", "session", "clinic", "doctor", "appointment", "booking",
    ],
    theme: {
      bg: "#F6F7F9", surface: "#E8EEF0", ink: "#0F172A", mute: "rgba(15,23,42,0.7)",
      line: "rgba(15,23,42,.1)", accent: "#0F766E", accentInk: "#FFFFFF",
      display: "sans", displayWeight: 600, radius: 12,
      hues: ["#0F766E", "#99F6E4", "#FDE68A", "#0F172A"],
    },
    site: {
      brand: "Clarity Coaching",
      nav: ["Sessions", "About", "Book"],
      cta: "Book a session",
      eyebrow: "Business coaching for founders",
      headline: "One hour that gets your business unstuck.",
      sub: "Pricing, hiring, and cash flow, worked through with someone who has run a company. Online or in Ikeja.",
      art: "calendar",
      itemsTitle: "Sessions",
      items: [
        { title: "Intro call", meta: "20 minutes · Online", price: "Free" },
        { title: "Strategy session", meta: "60 minutes · Online or in person", price: "₦50,000" },
        { title: "Monthly coaching", meta: "4 sessions a month", price: "₦180,000" },
      ],
      stats: [["120+", "founders coached"], ["15 yrs", "running businesses"], ["4.9", "average rating"]],
      aboutTitle: "About",
      about: "I built and sold two companies. Now I help founders avoid the mistakes I paid for.",
      contactTitle: "Not ready to book?",
      contactLine: "Send a question. I answer every one personally.",
    },
  },
  {
    id: "booking-restaurant",
    name: "Restaurant",
    kind: "booking",
    engine: "reservation",
    blurb:
      "A moody restaurant site with the menu up front, opening hours, and table reservations. Perfect for restaurants, lounges, and cafés.",
    keywords: [
      "restaurant", "cafe", "café", "lounge", "bar", "grill", "dining", "diner", "eatery",
      "bistro", "reservation", "reservations", "reserve", "table", "dinner", "brunch", "suya", "booking",
    ],
    theme: {
      bg: "#14100C", surface: "#1F1914", ink: "#F3EBDD", mute: "rgba(243,235,221,0.7)",
      line: "rgba(243,235,221,.12)", accent: "#D9A441", accentInk: "#14100C",
      display: "serif", displayWeight: 500, radius: 8,
      hues: ["#D9A441", "#8C2F1B", "#4E6B3A", "#F3EBDD"],
    },
    site: {
      brand: "Ember Grill",
      nav: ["Menu", "Private dining", "Find us"],
      cta: "Reserve a table",
      eyebrow: "Victoria Island · Dinner from 6pm",
      headline: "Wood-fired plates and a table waiting for you.",
      sub: "Nigerian flavours over open flame. Reserve online in under a minute, or walk in and take your chances.",
      art: "plates",
      itemsTitle: "From the grill",
      items: [
        { title: "Suya-spiced ribeye", price: "₦24,000" },
        { title: "Grilled croaker, pepper sauce", price: "₦18,500" },
        { title: "Smoked party jollof", price: "₦7,500" },
        { title: "Plantain tart, vanilla cream", price: "₦5,000" },
      ],
      aboutTitle: "Opening hours",
      about: "Tuesday to Sunday, 6pm to 11pm. Private dining for up to 24 guests.",
      contactTitle: "Celebrating something?",
      contactLine: "Tell us when you book and we will have the table ready.",
    },
  },
];

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}

export function kindLabel(kind: Kind) {
  return KINDS.find((k) => k.id === kind)?.label ?? kind;
}
