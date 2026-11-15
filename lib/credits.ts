/* ──────────────────────────────────────────────────────────────
   Credits: the unit people buy to use Wintech AI.

   One message to Wintech AI costs one credit, in the dashboard or,
   later, on Telegram. New accounts get 20 (set in 003_credits.sql).

   The packs below are PLACEHOLDERS. Set the real prices once you know
   what a message costs you to run, then wire Paystack. Until then the
   Buy buttons stay disabled: nobody can pay for something that cannot
   be delivered.
   ────────────────────────────────────────────────────────────── */

export const AI_MESSAGE_COST = 1;

/** Writing a whole site from a description is one bigger request. */
export const AI_BUILD_COST = 5;

export const CREDIT_PACKS = [
  { id: "starter", credits: 100, price: "₦2,500", note: "About 100 edits" },
  { id: "growth", credits: 500, price: "₦10,000", note: "Most popular", featured: true },
  { id: "studio", credits: 2000, price: "₦35,000", note: "For several sites" },
];

export const PAYMENTS_LIVE = false;
