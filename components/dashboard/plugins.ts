import { Bot, Camera, FileText, GitBranch, Globe, PlugZap, Send, Sparkles } from "lucide-react";
import type { Icon } from "./nav-types";

/* ──────────────────────────────────────────────────────────────
   The plugin catalogue. Every site gets the same store, whatever its
   kind. Shared by the sidebar (client) and the store pages (server),
   so it lives in a plain module.

   status: "active" works today, "soon" is being built, "later" is
   planned. Each says what it is waiting on, in plain words.
   ────────────────────────────────────────────────────────────── */

export type PluginStatus = "active" | "soon" | "later";

export type Plugin = {
  slug: string;
  label: string;
  icon: Icon;
  category: string;
  status: PluginStatus;
  tagline: string;
  about: string;
  does: string[];
  needs: string;
  sees: string;
  cost: string;
  /** Tile colour, as a CSS background. */
  tile: string;
  /** In the sidebar's Plugins group. */
  pinned?: boolean;
};

export const PLUGINS: Plugin[] = [
  {
    slug: "wintech-ai", label: "Wintech AI", icon: Sparkles, category: "Assistant", status: "active", pinned: true,
    tagline: "Powered by Claude. Rewrites and rearranges your site when you ask.",
    about: "Tell it what to change in plain words. It reads your whole site, proposes the change, and shows you exactly what will be different before anything goes live.",
    does: ["Rewrites any text on your page", "Adds, removes, and reorders products, services, and questions", "Moves and hides sections", "Changes your brand colour"],
    needs: "Nothing. It is on for every site.",
    sees: "This site's content. Not your other sites, and not your customers' messages.",
    cost: "One credit per message. Building a whole site from a description is five.",
    tile: "linear-gradient(135deg, #232732, #667897)",
  },
  {
    slug: "claude", label: "Connect to Claude", icon: PlugZap, category: "Connector", status: "active", pinned: true,
    tagline: "Run your Wintech sites from your own Claude chat.",
    about: "Add Wintech to Claude as a connector. Then, in any Claude conversation, ask it to build a site, rewrite a section, or publish, and it does it here.",
    does: ["Lists your sites and reads their content", "Builds new sites from any template", "Changes and moves what is there", "Publishes or hides a site"],
    needs: "A Claude account that can add custom connectors, and a personal link from this page.",
    sees: "All your sites, while the link is active. You can revoke it here at any time.",
    cost: "Free on Wintech. The AI runs on your own Claude plan.",
    tile: "linear-gradient(135deg, #D97757, #B5543A)",
  },
  {
    slug: "invoices", label: "Invoices", icon: FileText, category: "Payments", status: "active", pinned: true,
    tagline: "A receipt for every order, once you confirm the money arrived.",
    about: "Every order on your site becomes an invoice. The customer gets a page with your bank details and a reference; when you confirm the transfer arrived, that page turns into a receipt they can save or print. No payment company in the middle, no fees, and the money never leaves your own bank.",
    does: [
      "Bank details and a reference shown at checkout",
      "The customer presses 'I have sent the money'",
      "You confirm it from Orders, after checking your bank",
      "They get a receipt they can save or print",
    ],
    needs: "Your bank details, in Site settings.",
    sees: "This site's orders and the customers who placed them.",
    cost: "Free. Wintech takes nothing from your sales.",
    tile: "linear-gradient(135deg, #0F766E, #34D399)",
  },
  {
    slug: "whatsapp", label: "WhatsApp agent", icon: Bot, category: "Messaging", status: "soon", pinned: true,
    tagline: "Replies to customers and takes orders on WhatsApp, into your Inbox.",
    about: "Connect your WhatsApp Business number. The agent drafts replies for you to send, answers simple questions on its own once you trust it, and turns orders in chats into orders here.",
    does: ["Drafts replies from your products and prices", "Answers simple questions by itself, when you allow it", "Creates orders from chats", "Every conversation lands in Inbox"],
    needs: "Meta's business verification and app review for Wintech, then connecting your number.",
    sees: "Messages on the connected number, and this site's products.",
    cost: "One credit per AI reply. Meta charges for some messages outside the 24-hour window.",
    tile: "linear-gradient(135deg, #16A34A, #4ADE80)",
  },
  {
    slug: "telegram", label: "Telegram bot", icon: Send, category: "Messaging", status: "soon", pinned: true,
    tagline: "Change your site by chatting to Wintech AI on Telegram.",
    about: "Link your Telegram to this site with a one-time code, then ask for changes the same way you would in the dashboard. Every change still waits for your yes.",
    does: ["Connect with a one-time code", "Ask for changes from anywhere", "Approve or reject each change in the chat"],
    needs: "The Wintech bot, created with Telegram's BotFather.",
    sees: "This site's content, from the chat you linked.",
    cost: "One credit per message, same as the dashboard.",
    tile: "linear-gradient(135deg, #229ED9, #6CC7F0)",
  },
  {
    slug: "domain", label: "Custom domain", icon: Globe, category: "Website", status: "soon",
    tagline: "Buy yourbusiness.com here, and it connects itself.",
    about: "Search for a name, buy it, and your site moves to it with the HTTPS set up for you. Or connect a domain you already own.",
    does: ["Search .com, .ng, and .com.ng", "Buy and renew in one place", "DNS and HTTPS set up automatically", "Connect a domain you already own"],
    needs: "A domain reseller account for Wintech, and payments.",
    sees: "This site's address settings.",
    cost: "The domain's yearly price.",
    tile: "linear-gradient(135deg, #7C3AED, #A78BFA)",
  },
  {
    slug: "instagram", label: "Instagram DMs", icon: Camera, category: "Messaging", status: "later",
    tagline: "Your Instagram messages, in your Inbox, with replies drafted.",
    about: "Messages from your Instagram business account land in the same Inbox as your site and WhatsApp, so every customer is in one place.",
    does: ["DMs in your Inbox", "AI-drafted replies", "Orders from DMs"],
    needs: "Meta's app review for Instagram messaging.",
    sees: "Messages on the connected Instagram account.",
    cost: "One credit per AI reply.",
    tile: "linear-gradient(135deg, #F58529, #DD2A7B 55%, #8134AF)",
  },
  {
    slug: "github", label: "GitHub", icon: GitBranch, category: "Developer", status: "later",
    tagline: "Send your site's code to your own GitHub.",
    about: "Export your site as a real project into a repository you own, so a developer can take it further. Your Wintech site keeps working.",
    does: ["Create a repository on your account", "Push the site's code to it", "Keep it in sync when you publish"],
    needs: "The Wintech GitHub App.",
    sees: "Only the repository you choose.",
    cost: "Free.",
    tile: "linear-gradient(135deg, #111111, #3F3F46)",
  },
];

export function getPlugin(slug: string) {
  return PLUGINS.find((p) => p.slug === slug) ?? null;
}

/** Where a plugin opens: Wintech AI opens straight into its chat. */
export function pluginHref(base: string, p: Plugin) {
  if (p.slug === "wintech-ai") return `${base}/ai`;
  if (p.slug === "invoices") return `${base}/orders`;
  return `${base}/plugins/${p.slug}`;
}
