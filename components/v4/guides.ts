/* Help center content (Figma "Desktop / Help center" and "Desktop / Guide article").
   Guides describe the v4 app as designed on Figma pages 18 to 24; check each one
   against the live app before launch. */

export type Block =
  | { h: string; id: string }
  | { p: string }
  | { steps: string[] }
  | { tip: string }
  | { shot: string };

export type Guide = {
  slug: string;
  category: string;
  title: string;
  intro: string;
  meta: string;
  body: Block[];
};

export const GUIDES: Guide[] = [
  {
    slug: "build-your-first-site",
    category: "Getting started",
    title: "Build your first site",
    intro: "Go from sign up to a live site at name.wintechstudio.com in one sitting. You can change everything later.",
    meta: "Guide · All plans",
    body: [
      { h: "Create your account", id: "account" },
      { p: "Sign up with your email or Google. Your first site is free, and you get AI credits to start." },
      { h: "Pick a template", id: "template" },
      { p: "Choose one made for your kind of business: a salon, a store, a bakery, a restaurant or a service. Every template works on phones." },
      { h: "Let the assistant fill it in", id: "assistant" },
      { steps: ["Tell the assistant your business name and what you sell.", "Add your prices, opening hours and delivery areas.", "Upload a few photos, or keep the template's until you have yours."] },
      { tip: "You can ask in your own words, for example \"add my Lekki and Ajah delivery fees\"." },
      { h: "Publish", id: "publish" },
      { p: "Press Publish. Your site goes live at name.wintechstudio.com straight away. Share the link on WhatsApp and Instagram." },
    ],
  },
  {
    slug: "take-orders-and-payments",
    category: "Orders and payments",
    title: "Take orders and get paid",
    intro: "Customers order on your site or on WhatsApp and pay by bank transfer straight into your account. Wintech takes 0% of your sales.",
    meta: "Guide · All plans",
    body: [
      { h: "Add your bank details", id: "bank" },
      { steps: ["Open your site in the dashboard and go to Settings.", "Under Payments, add your bank, account name and account number.", "Save. Your checkout now shows these details with a reference for each order."] },
      { shot: "Settings, Payments" },
      { h: "How customers pay", id: "methods" },
      { p: "At checkout the customer sees the total, your bank details and an order reference. They pay by transfer and tap I have paid. They can also send the whole order to you on WhatsApp instead." },
      { tip: "Card and USSD checkout are coming later. Until then, transfer and WhatsApp work on every plan." },
      { h: "Confirm each payment", id: "confirm" },
      { p: "When a customer says they have paid, the order shows under Orders as Customer says paid. Check your bank app for the reference, then press Confirm. The customer gets the update." },
      { h: "When money arrives", id: "money" },
      { p: "The money goes straight from your customer to your own account. Wintech never holds it and takes no cut." },
    ],
  },
  {
    slug: "connect-your-domain",
    category: "Domains",
    title: "Connect a domain you own",
    intro: "Keep your domain where it is and point it at your Wintech site. Available on Starter and up.",
    meta: "Guide · Starter and up",
    body: [
      { h: "Type your domain", id: "type" },
      { p: "In the app, open Website, then Domains, then Connect one I own, and type the domain." },
      { h: "Add two records at your provider", id: "records" },
      { p: "We check where your domain is managed and show the exact records to add there: an A record for the bare domain and a CNAME record for www." },
      { steps: ["Sign in where you bought the domain.", "Open its DNS or Records settings.", "Add the two records exactly as Wintech shows them, then save."] },
      { tip: "Stuck? Message us on WhatsApp and we will add the records with you." },
      { h: "We check and switch it on", id: "check" },
      { p: "Once the records are found your site loads on your domain, with https added for you. It is usually quick, but some providers take a few hours." },
    ],
  },
  {
    slug: "how-credits-work",
    category: "AI assistant and credits",
    title: "How AI credits work",
    intro: "Credits pay for the AI work on your site. Small edits cost little and a full build costs more.",
    meta: "Guide · All plans",
    body: [
      { h: "What uses credits", id: "uses" },
      { steps: ["Changing a word or price: 1 credit.", "Rewriting a section: 3 credits.", "Making a product photo: 4 credits.", "Building a full site: 10 credits."] },
      { p: "Drafting a reply to a customer and your weekly report are free." },
      { h: "Credits on your plan", id: "plan" },
      { p: "Every plan includes credits each month. You can see what is left at the bottom of the sidebar in the app." },
      { h: "Topping up", id: "packs" },
      { p: "Buy a pack of 100, 500 or 2,000 credits. Packs never expire. If you run out, your site stays live and only the assistant pauses." },
    ],
  },
];

export const guide = (slug: string) => GUIDES.find((g) => g.slug === slug);

export const TOPICS: { title: string; icon: string; items: [string, string][] }[] = [
  { title: "Getting started", icon: "book", items: [["Create your account", "build-your-first-site#account"], ["Pick your first template", "build-your-first-site#template"], ["Publish your site", "build-your-first-site#publish"]] },
  { title: "Templates and editor", icon: "layout", items: [["Edit sections", "build-your-first-site#assistant"], ["Add products", "build-your-first-site#assistant"], ["Change template", "build-your-first-site#template"]] },
  { title: "AI assistant and credits", icon: "sparkles", items: [["What the assistant can do", "how-credits-work#uses"], ["How credits work", "how-credits-work#plan"], ["Buy a credit pack", "how-credits-work#packs"]] },
  { title: "Orders and payments", icon: "card", items: [["Add your bank details", "take-orders-and-payments#bank"], ["How customers pay", "take-orders-and-payments#methods"], ["Confirm a payment", "take-orders-and-payments#confirm"]] },
  { title: "Domains", icon: "globe", items: [["Your free address", "build-your-first-site#publish"], ["Buy a domain", "/domains"], ["Connect a domain you own", "connect-your-domain#type"]] },
  { title: "Account and billing", icon: "user", items: [["Change your plan", "/pricing"], ["Pay yearly", "/pricing"], ["Team seats", "/pricing"]] },
];

export const POPULAR: [string, string][] = [
  ["Take orders and get paid", "take-orders-and-payments"],
  ["Connect a domain", "connect-your-domain"],
  ["AI credits", "how-credits-work"],
  ["Change template", "build-your-first-site#template"],
];
