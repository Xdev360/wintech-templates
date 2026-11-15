# Wintech Templates

A website builder that gets Nigerian small businesses online in minutes. Pick a template, add your products or services, and your site is live at `yourname.wintechstudio.com`, with orders, bookings and enquiries going to one dashboard.

**Live:** [wintechstudio.com/templates](https://wintechstudio.com/templates)

I designed and built the whole product: the templates, the dashboard, the editor, the AI features, payments and the database.

## Why it exists

Most small businesses in Lagos sell through Instagram DMs and WhatsApp. A custom website costs too much, and generic builders aren't made for how they sell. Wintech Templates offers designs built for real local business types, a dashboard that works on a phone, and payment and WhatsApp built in.

## What it does

- **One account, many sites.** Each site has a *kind* (store, booking, portfolio or landing page) that decides how it behaves, and a *template* that decides how it looks. There are four behaviours and many skins, instead of a separate CRM for every template.
- **Template finder.** Describe your business on the home page and it suggests matching templates. The full preview works on desktop and phone with no account.
- **Live subdomains.** `proxy.ts` sends `name.wintechstudio.com` to the right site.
- **Editor.** Edit every section, add photos, reorder or hide sections, and set a brand colour that recolours both the site and the dashboard.
- **AI site builder.** Describe your business and the AI writes a first version of the site. A chat assistant then suggests rewrites and layout changes, and nothing changes until you approve.
- **Connector for Claude.** Each site has its own token-secured MCP endpoint (`app/api/mcp/[token]`), so owners can manage their site from their own AI assistant.
- **Commerce.** Cart, orders, stock, receipts, enquiries and a credits system for AI usage, bought through Paystack.
- **Growth.** Referral links and an affiliate dashboard.

## Stack

| | |
| --- | --- |
| Design | Figma |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Lucide icons |
| Backend | Supabase (Postgres with row-level security, Auth, Storage), server actions |
| AI | Anthropic SDK, MCP |
| Payments | Paystack |
| Hosting | Vercel, with wildcard subdomains |

## How it's organised

```
app/
  page.tsx               home and template finder
  templates/             gallery and full previews
  dashboard/             account home and per-site dashboard
  view/[slug]/           the published sites
  api/                   AI builder, assistant, MCP connector, receipts, OG images
  actions/               server actions (sites, connector, orders)
components/              templates, dashboard views, editor, marketing
lib/                     site content model, colour system, cart, credits, matching
supabase/                schema and numbered migrations
docs/                    architecture, deployment, email and sign-in setup
```

Every site's content is one versioned JSON document (`lib/site-model.ts`). The templates, the editor, the AI assistant and the connector all read and write that same shape, and every write goes through server-side sanitising. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full picture.

## Run it locally

```bash
npm install
npm run dev
```

You need a Supabase project with the files in `supabase/` applied in order, plus the environment variables listed in [docs/DEPLOY.md](docs/DEPLOY.md).

## Contact

Built by [Ibraheem Oladele](https://github.com/Xdev360), design engineer and founder of [Wintech Studio](https://wintechstudio.com).
[xbigbrainnx@gmail.com](mailto:xbigbrainnx@gmail.com) · [X](https://x.com/xbigbrainnx) · [Behance](https://www.behance.net/xbigbrainnx)
