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
    slug: "set-up-paystack-payments",
    category: "Payments with Paystack",
    title: "Set up Paystack payments",
    intro: "Let customers pay by card, bank transfer or USSD. Paystack sends the money to your bank account and Wintech takes 0% of your sales.",
    meta: "Guide · All plans",
    body: [
      { h: "Before you start", id: "before" },
      { p: "You need a Paystack account for your business. If you do not have one yet, create it on Paystack first and finish their business checks so you can receive live payments." },
      { h: "Connect Paystack", id: "connect" },
      { steps: ["Open the Wintech app and go to Settings, then Payments.", "Tap Connect Paystack and sign in to your Paystack account.", "Approve the connection. You come back to Wintech with Paystack switched on."] },
      { shot: "Settings, Payments" },
      { h: "Choose payment methods", id: "methods" },
      { p: "Card, bank transfer and USSD are on by default. Turn off any you do not want to offer. Customers see the methods you keep at checkout." },
      { tip: "Ask the assistant \"turn on WhatsApp orders too\" if you also want customers to order by chat." },
      { h: "Test with a sample order", id: "test" },
      { p: "Open your site, add a product to the cart and go to checkout. Use Paystack test mode to place a sample order, then check it shows under Orders." },
      { h: "When money arrives", id: "money" },
      { p: "Paystack pays out to your bank account on its normal schedule and charges its own processing fee. Wintech does not take a cut." },
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
      { p: "Buy a pack of 100, 500 or 2,000 credits with Paystack. Packs never expire. If you run out, your site stays live and only the assistant pauses." },
    ],
  },
];

export const guide = (slug: string) => GUIDES.find((g) => g.slug === slug);

export const TOPICS: { title: string; icon: string; items: [string, string][] }[] = [
  { title: "Getting started", icon: "book", items: [["Create your account", "build-your-first-site#account"], ["Pick your first template", "build-your-first-site#template"], ["Publish your site", "build-your-first-site#publish"]] },
  { title: "Templates and editor", icon: "layout", items: [["Edit sections", "build-your-first-site#assistant"], ["Add products", "build-your-first-site#assistant"], ["Change template", "build-your-first-site#template"]] },
  { title: "AI assistant and credits", icon: "sparkles", items: [["What the assistant can do", "how-credits-work#uses"], ["How credits work", "how-credits-work#plan"], ["Buy a credit pack", "how-credits-work#packs"]] },
  { title: "Payments with Paystack", icon: "card", items: [["Set up Paystack payments", "set-up-paystack-payments#connect"], ["Card, transfer and USSD", "set-up-paystack-payments#methods"], ["When you get paid", "set-up-paystack-payments#money"]] },
  { title: "Domains", icon: "globe", items: [["Your free address", "build-your-first-site#publish"], ["Buy a domain", "/domains"], ["Connect a domain you own", "connect-your-domain#type"]] },
  { title: "Account and billing", icon: "user", items: [["Change your plan", "/pricing"], ["Pay yearly", "/pricing"], ["Team seats", "/pricing"]] },
];

export const POPULAR: [string, string][] = [
  ["Set up Paystack", "set-up-paystack-payments"],
  ["Connect a domain", "connect-your-domain"],
  ["AI credits", "how-credits-work"],
  ["Change template", "build-your-first-site#template"],
];
