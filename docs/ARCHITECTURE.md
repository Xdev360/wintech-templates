# Wintech Templates — how it fits together

The template platform behind `app.wintechstudio.com`. A person makes one
account, creates one or more sites from templates, and runs every site from
one dashboard. Each site is live at `name.wintechstudio.com`.

The studio site (`www.wintechstudio.com`, the repo root) is a separate Vercel
project and does not change.

---

## 1. What exists today

Built so far, working against the live Supabase project `owdagrdjlpyjxsoblcqr`:

| Piece | File | State |
|---|---|---|
| Public home: search box that suggests templates | `app/page.tsx`, `components/templates/TemplateFinder.tsx`, `lib/match.ts` | Works, no account needed |
| Template gallery, filter by kind | `app/templates/page.tsx` | Works, 12 templates |
| Full preview, desktop and phone | `app/templates/[id]/page.tsx` | Works, read only |
| Template library | `lib/templates.ts`, `components/templates/TemplateSite.tsx` | 12 sample sites |
| Account home: every site, templates, credits, account settings | `app/dashboard/(account)/`, `components/dashboard/AccountShell.tsx` | Works. Where login lands |
| Site dashboard: site switcher, grouped sidebar, phone drawer | `components/dashboard/Shell.tsx`, `app/dashboard/[id]/layout.tsx` | Works |
| Plugin store and a page per plugin | `components/dashboard/plugins.ts`, `PluginsView.tsx`, `PluginDetail.tsx`, `app/dashboard/[id]/plugins/[slug]` | Wintech AI and Connect to Claude live; the rest designed |
| Connect to Claude: Wintech as a connector in the user's own Claude | `app/api/mcp/[token]/route.ts`, `ConnectorPanel.tsx`, `supabase/004_connector.sql` | Run 004. Works once deployed |
| Describe your business, Claude builds the site | `app/api/build-site/route.ts`, `NewSiteView.tsx` | Needs `ANTHROPIC_API_KEY`, 5 credits |
| Content model shared by templates and sites | `lib/site-model.ts`, `lib/site-diff.ts` | Sections, reorder, hide |
| Overview: live preview, real figures, setup checklist | `components/dashboard/OverviewView.tsx` | Works |
| Brand colour that recolours the site and the dashboard | `lib/color.ts`, `components/SiteEditor.tsx` | Works |
| Wintech AI chat: rewrites and restructures, you approve | `app/api/assistant/route.ts`, `components/dashboard/AssistantChat.tsx` | Needs `ANTHROPIC_API_KEY` |
| Credits: balance, history, packs | `supabase/003_credits.sql`, `components/dashboard/CreditsView.tsx` | Run 003. Buying needs Paystack |
| Settings: profile, site name, password, delete | `components/dashboard/SettingsView.tsx` | Works |
| Design preview of every screen, no login | `app/dev/account`, `app/dev/dashboard` | Development only, 404 in production |
| Sign up, log in, log out | `components/AuthForm.tsx`, `app/actions/sites.ts` | Works |
| Create a site from any of the 12 templates | `components/dashboard/NewSiteView.tsx`, `app/actions/sites.ts` | Works, one free site |
| Editor: every section, photos, order, colour | `components/SiteEditor.tsx` | Works for all templates |
| Home: glass nav, collection, name search, Claude, big footer | `app/page.tsx`, `components/marketing/` | Works. Name search needs 004 |
| `name.wintechstudio.com` serves the site | `proxy.ts` → `app/view/[slug]` | Works |
| Database and photo storage | `supabase/schema.sql`, `002_hardening.sql`, `003_credits.sql`, `004_connector.sql` | Run all four, in order |

A site's `content` is one JSON document (version 2, `lib/site-model.ts`): brand, hero, and a list of sections in the order they show. Templates, the editor, Wintech AI, and the Claude connector all read and write that same shape, and every write goes through `sanitizeContent` on the server. Older sites saved in the first flat shape are read through `fromV1` and upgrade on their next save.

---

## 2. The core idea

```
Account ──┬── Site A  kind: store     template: store-skincare
          ├── Site B  kind: booking   template: booking-salon
          └── Site C  kind: portfolio template: portfolio-designer
```

- **One account, many sites.** `sites.user_id` already makes this true.
- **Every site has a kind and a template.** The *kind* decides how it behaves
  (does it take orders, bookings, or just messages). The *template* decides how
  it looks. Many templates share one kind.
- **One CRM, not four.** The dashboard is a single shell. Inbox, Contacts,
  and the editor are there for every site. Extra modules switch on by kind.

This is what keeps it buildable. You do not build 30 CRMs for 30 templates.
You build four behaviours and skin them.

---

## 3. Kinds, and who each one is for

### Portfolio — people selling a skill
Nobody buys on the page. They message you or book a call.
- Designer · Developer · Photographer / videographer · Writer / content
  creator · Social media manager

### Landing — information and one action
- Business profile · Event (date, venue, RSVP) · Product launch / waitlist ·
  Personal brand / speaker · Community, church, NGO

### Store — selling products
- Skincare and beauty · Fashion and tailoring (sizes, colours, made-to-measure
  requests) · Food and bakery (delivery zones, order-for-a-date) · General store

### Booking — selling time
Booking looks like one category but it is three different machines. Build the
machine once and every business that fits it comes free.

| Engine | How it works | Who it serves |
|---|---|---|
| **Appointment** | Pick a service, a person, a time slot | Hair salon · Barber · Makeup, lashes, nails · Spa and massage · Clinic, dental, physio · Personal trainer · Tutor, coach, consultant · Car wash and detailing |
| **Reservation** | Party size and a time, against seats available | Restaurant · Café · Lounge · Event space |
| **Request** | Date, address, details. Owner confirms and quotes | Event planner and decorator · Caterer · Cleaning · Home repair, AC, plumbing · Photo shoots |

A fourth engine, **Stay** (date ranges, for short-let apartments), is common in
Lagos but is its own problem. Leave it until the first three work.

### First launch set

Twelve templates, three per kind, chosen so each kind proves itself:

| Portfolio | Landing | Store | Booking |
|---|---|---|---|
| Designer | Business profile | Skincare and beauty | Salon and beauty (appointment) |
| Developer | Event | Fashion | Consultant and coach (appointment) |
| Photographer | Waitlist | Food and bakery | Restaurant (reservation) |

---

## 4. The CRM

One shell. The left rail shows what this site's kind needs.

| Module | Portfolio | Landing | Store | Booking | What it is |
|---|:-:|:-:|:-:|:-:|---|
| **Site** | ● | ● | ● | ● | Edit sections, photos, colours. Publish. |
| **Inbox** | ● | ● | ● | ● | Every form on the site lands here |
| **Contacts** | ● | ● | ● | ● | Everyone who messaged, booked, or bought, one record each |
| **Bookings** | ● | | | ● | Calendar, upcoming, confirm, cancel. Portfolio gets "book a call" |
| **Services** | | | | ● | What you offer, how long, price, deposit, opening hours |
| **Products** | | | ● | | Items, categories, sizes, stock, photos |
| **Orders** | | | ● | ● | Awaiting payment → paid → sent → done |
| **Payments** | | | ● | ● | Your bank details for checkout. See §7 |
| **Insights** | ● | ● | ● | ● | Visits, messages, sales. Later |
| **Settings** | ● | ● | ● | ● | Link, custom domain, SEO, delete |

Inbox and Contacts are the heart of it. Build those first and every template is
already useful, because every template has a contact form.

### Switching between sites

A site switcher sits at the top of the dashboard, like switching Slack
workspaces. Every CRM page lives under the site:

```
/dashboard                      all your sites
/dashboard/[siteId]             that site's overview
/dashboard/[siteId]/inbox
/dashboard/[siteId]/orders
/dashboard/[siteId]/site        the editor
```

Switching sites changes `[siteId]`. Nothing else in the app needs to know.

---

## 5. Editing and going live

### Sections, not pages

A site is an ordered list of sections. Templates share section types and style
them differently, which is how twelve templates stay cheap to make.

```jsonc
{
  "theme": { "accent": "#3B5BFF", "font": "satoshi" },
  "sections": [
    { "id": "s1", "type": "hero",     "fields": { "headline": "…", "image": "…" } },
    { "id": "s2", "type": "services", "fields": { "title": "…" } },
    { "id": "s3", "type": "contact",  "fields": { "email": "…" } }
  ]
}
```

Templates live in code, not the database: `templates/<kind>/<id>/` holds the
default sections, a preview image, and the section components. `sites.template`
points at one. Code means they are versioned, fast, and cannot be broken by a
bad row.

### Draft, then publish

Today every save goes straight to the live site, halfway through an edit.
Change that before real customers arrive:

- `sites.content` becomes the **draft**. The editor reads and writes it.
- New `sites.published_content`. The public site reads only this.
- **Publish** copies draft to published. **Discard** copies it back.

Then "edit everything and it goes live" is true, on purpose, when they press
the button.

---

## 6. Data model

Every CRM table carries `site_id`, and every one uses the same rule: *you can
touch a row if you own its site.* Write that rule once as a function and every
policy calls it.

```sql
create function public.owns_site(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from sites where id = sid and user_id = auth.uid());
$$;

-- then, on every table:
create policy "owner" on public.orders for all
  using (public.owns_site(site_id)) with check (public.owns_site(site_id));
```

When teams arrive, `owns_site` also checks a `site_members` table and nothing
else changes.

| Phase | Tables |
|---|---|
| Now | `sites` |
| CRM core | `messages`, `contacts` |
| Booking | `services`, `availability`, `time_off`, `bookings` |
| Store | `categories`, `products`, `product_variants`, `orders`, `order_items`, `delivery_zones` |
| Money | `payment_settings` |
| AI and finance | `ai_usage`, `expenses` |

Three rules that save pain later:

1. **Money is whole numbers in kobo** with a `currency` column. Never decimals.
2. **Visitors never write to the database directly.** Contact forms, bookings,
   and checkouts post to a server route that rate-limits and drops bots, then
   writes. The anon key is public; treat it that way.
3. **Nothing private goes in `sites.content`.** Anyone can read a published
   site's content. Messages, orders, and bank details get their own tables.

---

## 7. Money

There are two separate money flows. They have different answers.

### Buyers paying your customers — direct bank transfer, zero fees

Doable, and normal in Nigeria:

1. Checkout shows the merchant's bank, account number, account name, the
   amount, and an order reference like `WT-4821`.
2. The buyer transfers from their bank app and taps **I've paid**, optionally
   attaching the receipt.
3. The order sits in **Awaiting payment**. The merchant checks their bank app
   and marks it **Paid**. The buyer is notified.

No Paystack, no fee, and **Wintech never touches the money**. That last part
matters: the moment Wintech collects money and pays it out to merchants, that
is payment aggregation, and in Nigeria it needs a CBN licence. Direct transfer
keeps you out of that entirely.

What it cannot do:

- **Take cards.** Charging a card requires a licensed processor. There is no
  way around that.
- **Confirm itself.** Someone checks the bank app. Fake transfer screenshots
  are common, so the Orders screen should say plainly: confirm in your bank
  app, not from the screenshot.

Automatic confirmation (a virtual account per order) is possible later through
a provider. It has a fee, so make it an optional upgrade, not the default.

Store the bank name, account number, and account name. Buyers see those anyway.
Never store BVN, card numbers, or anyone's banking login.

### Your customers paying Wintech — a processor is fine here

Paid plans, extra sites, and custom domains are Wintech's own revenue. That is
where Paystack or similar belongs. It does not conflict with the above.

---

## 8. AI

Funded by the studio's Anthropic key, so it has to be fenced in.

- The key lives only in Vercel environment variables. Never in the browser.
- Every AI request goes through a server route that checks the user's monthly
  allowance and writes a row to `ai_usage`. Without a cap, one account, or a
  bot that signed up, can run up the bill.
- Use a small, cheap model for one-field rewrites and a larger one for
  generating a whole site.

In this order:

1. **Rewrite this** — a button beside any text field in the editor
2. **Write my site** — a short brief in, every section filled
3. **Money summary** — paid orders minus logged expenses, explained

---

## 9. Build order

| Step | What | Why here |
|---|---|---|
| 0 | Go live with what exists (§11) | Real links, real signups |
| 1 | Sections, draft/publish, template registry, Portfolio and Landing templates | No payments or scheduling needed, so the editor gets proven first |
| 2 | CRM shell, site switcher, **Inbox**, **Contacts** | The module every template uses |
| 3 | Appointment engine, then reservation, plus booking templates | No stock, delivery, or checkout to get right |
| 4 | Store: products, orders, bank-transfer checkout | Biggest surface. Built on a proven shell |
| 5 | AI rewrite, then AI site generation | Needs the section model from step 1 |
| 6 | Paid plans, custom domains, request engine, finance | Revenue once people rely on it |

---

## 10. The first thousand users

Nothing in this design needs to change for a thousand. Three things will stop
you at launch if they are left alone:

1. **Email.** Supabase's built-in email is for testing. It is heavily
   rate-limited and will not reliably reach real signups, so confirmation
   emails never arrive and people cannot get in. Add custom SMTP (Resend has a
   free tier) under Authentication → Emails before turning confirmation back
   on. The dashboard shows the current limit there.
2. **HTTPS on customer sites.** `*.wintechstudio.com` needs a wildcard
   certificate, and Vercel requires its own nameservers for wildcard domains
   so it can issue one. See §11, step 6.
3. **Free tiers.** Supabase's free plan pauses an idle project and has no
   backups, and this database will hold other people's businesses. Vercel's
   Hobby plan is for non-commercial use. Move both to paid before charging
   anyone. Check current prices on each site.

Later, not now: cache published sites and refresh the cache on Publish. Today
every visit reads the database, which is fine at this size.

---

## 11. Launch checklist

| # | Step | State |
|---|---|---|
| 1 | Supabase project `wintechstudio` | Done |
| 2 | Run `supabase/schema.sql` | Done: `sites` table and `site-media` bucket exist |
| 3 | Run `supabase/002_hardening.sql`, then `003_credits.sql`, then `004_connector.sql` | **To do** |
| 4 | Authentication → Providers → Email on | Done |
| 5 | Authentication → Confirm email **off** while testing | **To do**: still on |
| 6 | Authentication → URL configuration: Site URL `http://localhost:3000`, redirect `http://localhost:3000/auth/callback` | Check |
| 7 | `platform/.env.local` with URL and anon key | Done, app connects |
| 7b | Add `ANTHROPIC_API_KEY=` to `platform/.env.local` yourself, and to the Vercel project | For Wintech AI |
| 8 | Custom SMTP, then Confirm email back **on** | Before launch |
| 9 | Commit and push `platform/` | Before step 10 |
| 10 | New Vercel project, Root Directory `platform`, the three env vars, Pro plan | Before launch |
| 11 | Add `app.wintechstudio.com` and `*.wintechstudio.com` to that project | Before launch |
| 12 | DNS for the wildcard (below) | Before launch |
| 13 | URL configuration: add `https://app.wintechstudio.com` and `/auth/callback` | After step 11 |

### DNS, step 12

Vercel issues wildcard certificates only when it runs your DNS. When you add
`*.wintechstudio.com` in the Vercel project, its Domains page tells you which
method it needs. If it asks for nameservers:

1. In Vercel, open the domain's DNS records and **recreate every record you
   rely on first**: the studio site, and especially any **MX** records if your
   email runs on this domain. Miss those and your email stops.
2. Then, in Spaceship, change the nameservers to the two Vercel gives you.

This replaces the earlier note to add a `*` CNAME and leave nameservers alone.
That route leaves customer sites without HTTPS.

The studio site stays on its own Vercel project either way.


---

## 12. Credits, Wintech AI, and Telegram

### How credits work

- Every change to a balance is a row in `credit_ledger`. The balance is the sum.
- A browser can read its own rows and spend its own credits, and nothing else.
  Credits are only ever added by the server: the welcome grant (20, in
  `003_credits.sql`) and, later, the payment webhook.
- One Wintech AI message costs one credit (`lib/credits.ts`). The route checks
  the balance first, asks Claude, and takes the credit only once there is an
  answer, so a failed call never costs anyone.
- The pack prices in `lib/credits.ts` are placeholders. Work out what a
  message costs you to run, then set them. Buy stays disabled until payments
  exist.

### Wintech AI

`app/api/assistant/route.ts`. Claude Opus 5, low effort, structured JSON out:
a reply plus a patch to the site's content. It can rewrite any section, add or
remove items, and reorder or hide sections. The patch is merged and cleaned by
`applyPatch` on the server, the owner sees a before-and-after list
(`lib/site-diff.ts`), and nothing is saved until they press **Apply**.
Anthropic's server-side fallback is on, so if a request is declined it is
re-run on another model rather than failing.

`app/api/build-site/route.ts` does the same from a short description: Claude
picks one of the 12 templates, a name and a link, and writes the content. The
site is created hidden, and 5 credits are taken only after it exists.

Raw custom code written by AI and hosted on `*.wintechstudio.com` is paused on
purpose: one bad page on the shared domain could read other people's
sessions. If it comes back, it goes on a separate domain.

### Telegram: what is needed from you

One Wintech bot serves every customer. Nobody creates their own bot.

1. In Telegram, message **@BotFather**, send `/newbot`, name it
   **Wintech AI**, and pick a username such as `WintechAIBot`.
2. BotFather gives you a **token**. Do not paste it in chat. Put it in the
   Vercel project as `TELEGRAM_BOT_TOKEN`.
3. Tell me the **username**. That part is public.
4. Add the Supabase **service role key** to Vercel as
   `SUPABASE_SERVICE_ROLE_KEY`. The bot has no browser session, so it needs
   server-side database access. It must never be `NEXT_PUBLIC_`.
5. The app has to be deployed first. Telegram only calls public HTTPS
   addresses, so the webhook is `https://app.wintechstudio.com/api/telegram`.
6. Decide whether a Telegram message costs the same credit as a dashboard one.

Then the build is: `004_telegram.sql` (links a chat to one site, via a
one-time code that expires in fifteen minutes), the webhook route checking
Telegram's secret header, and the Connect button, which opens
`t.me/WintechAIBot?start=<code>`. It reuses the same assistant, so a change
asked for in Telegram shows the same before-and-after and waits for "yes".

### Payments for credits: what is needed from you

1. A Paystack business account, verified.
2. `PAYSTACK_SECRET_KEY` in Vercel. Never in chat, never `NEXT_PUBLIC_`.
3. The real pack prices.

Then: a checkout route that opens Paystack, and a webhook that verifies
Paystack's signature and adds credits through the service role. This is
Wintech's own income, which is why a processor is right here even though
customers' own sales go by direct bank transfer (§7).


---

## 13. Dashboard structure and brand

```
/dashboard                  account home: every site, how each is doing
/dashboard/templates        your templates, and the library
/dashboard/credits          balance, history, packs (credits are per account)
/dashboard/settings         your name, email, password
/dashboard/new              create a site
/dashboard/[site]           that site's overview
/dashboard/[site]/site      editor
/dashboard/[site]/plugins   plugin store
/dashboard/[site]/plugins/x one plugin's page (claude has the connector links)
/dashboard/[site]/settings  name, visibility, brand colour, delete
```

**Brand.** The dashboard and public pages wear Wintech's colours: navy
`#232732` for text and buttons (14.9:1 on white), slate `#667897` for icons
and marks only (4.47:1, just under the threshold for small text), light slate
`#C0C6D4` for decoration. In dark mode the light slate leads, with navy text
on it. A customer's own brand colour appears only on their site, its preview,
and its avatar.

---

## 14. Wintech in Claude (the connector)

A person makes a personal link in **Plugins → Connect to Claude**, then adds
it in Claude as a custom connector. The link is
`https://app.wintechstudio.com/api/mcp/wt_…`; the part after `wt_` is the
secret. Only its SHA-256 hash is stored, it can be revoked, and there are at
most five active links per account.

`app/api/mcp/[token]/route.ts` is a stateless MCP server (Streamable HTTP,
JSON responses). Tools: `list_sites`, `get_site`, `list_templates`,
`create_site`, `update_site`, `set_published`. Every database call goes
through a `mcp_*` function in `004_connector.sql` that checks the link and
acts only on its owner's sites; the free-plan and reserved-name triggers from
002 still apply. New sites start hidden. Claude runs on the user's own plan,
so this costs Wintech no credits and doubles as marketing: "works with
Claude" on the home page.

Claude cannot reach `localhost`, so this only works once deployed.

---

## 15. What is next, and what it needs

**GitHub.** Planned as a plugin: a Wintech GitHub App that creates a repo on
the user's account and pushes the site as a real Next.js project, synced on
Publish. Needs a GitHub App (App ID, private key, webhook secret in Vercel)
and an export that turns `content` into files.

**Buying domains (Namecheap).** Wintech buys on its own Namecheap account and
resells. Needs API access switched on for that account (Namecheap sets
minimums for it), and a **whitelisted static IP**, which Vercel's serverless
functions do not have, so calls go through a small proxy with a fixed IP.
Commands: `namecheap.domains.check`, `namecheap.users.getPricing`,
`namecheap.domains.create`, then `namecheap.domains.dns.setHosts` pointing at
Vercel, and adding the domain to the Vercel project. Test in Namecheap's
sandbox first. Charge through Paystack before calling `create`, because the
purchase comes out of Wintech's Namecheap balance. Vercel's own domains API is
the simpler alternative (no IP whitelist).

**5,000 users.** The code is fine; the free plans are not. Vercel Pro,
Supabase Pro, and a real email sender (Resend or similar, via Supabase custom
SMTP) are the purchases. Then: cache published sites and refresh on Publish,
resize photos on upload, and rate-limit sign-up and the AI routes.
