# Going live — Vercel and Spaceship, step by step

> **Done on 16 September.** The platform is live at app.wintechstudio.com,
> the nameservers are Vercel's, the wildcard resolves, and the repository
> deploys itself on every push. What follows is the record of how, and what
> to do again if any of it has to be rebuilt.

Read on 16 September, straight from your authoritative nameserver
(`launch1.spaceship.net`).

## What your DNS holds today — all of it

| Type | Name | Value | What it is |
|---|---|---|---|
| A | `wintechstudio.com` | `216.198.79.1` | Your studio site, on Vercel |
| CNAME | `www` | `97ebb46817eab816.vercel-dns-017.com` | Same site, www |
| TXT | `wintechstudio.com` | `google-site-verification=39Zop59nD-…Vay9Y` | Google Search Console |

**There are no MX records.** No email runs on this domain, so the usual
danger of a nameserver move — killing your email — does not apply to you.
The only thing that must be recreated by hand is the Google TXT record.

Your nameservers today: `launch1.spaceship.net`, `launch2.spaceship.net`.

---

## Why the nameservers have to move

Customer sites live at `anything.wintechstudio.com`. That needs a wildcard
certificate for `*.wintechstudio.com`. Vercel only issues one when Vercel
runs the DNS, because it has to write a verification record automatically
every time the certificate renews.

So: nameservers move from Spaceship to Vercel. Spaceship still owns the
domain — you keep paying them for it and can move back any time by putting
the two Spaceship nameservers back.

---

## Step 1 — The code goes to GitHub (I do this, when you say go)

A **new private repository** called `wintech-templates`, holding only the
platform. Your studio site repository is not touched. I already have access
to your GitHub as `Xdev360`.

Say "push it" and it is done in a minute.

---

## Step 2 — Create the Vercel project (you, 5 minutes)

1. **vercel.com** → sign in **with GitHub**.
2. **Add New → Project**.
3. Find `wintech-templates` → **Import**. (If Vercel cannot see it:
   **Adjust GitHub App Permissions** → allow the new repository.)
4. Framework: **Next.js** — it fills itself in. Leave the build settings
   alone.
5. **Do not deploy yet.** Open **Environment Variables** first and add the
   four below.

### The four environment variables

Set each one for **Production, Preview and Development**.

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://owdagrdjlpyjxsoblcqr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The long key from `platform/.env.local`, line 2 |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `wintechstudio.com` |
| `ANTHROPIC_API_KEY` | Your new Anthropic key |

To copy the Supabase key without it passing through this chat:

```bash
open -e "/Users/mac/Desktop/wintech studio/platform/.env.local"
```

Copy everything after `NEXT_PUBLIC_SUPABASE_ANON_KEY=`. That key is public
by design — it ships inside every visitor's browser. The Anthropic key is
not: it stays only in Vercel and in your own `.env.local`.

6. **Deploy**. It takes about two minutes. You get a
   `wintech-templates-xxxx.vercel.app` address. Open it — the site should
   load exactly as it does on your laptop.

> Vercel's free plan says non-commercial use only. It is fine for today's
> testing. Move to **Pro** before you charge a single customer.

---

## Step 3 — Add the domains (you, 3 minutes)

In the **wintech-templates** project → **Settings → Domains**.

1. Add `app.wintechstudio.com` → **Add**.
2. Add `*.wintechstudio.com` → **Add**.

Vercel will now say the domain is not configured and show you
**nameservers**, usually:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Use whatever Vercel shows you on that page, not what is written here** —
they do change them.

Leave that page open.

---

## Step 4 — Recreate the Google record in Vercel DNS (you, 2 minutes)

Do this **before** switching, so nothing is missing at any point.

In Vercel → your account → **Domains** → `wintechstudio.com` → **DNS
Records** (you may need to add the domain at account level first).

Add:

| Field | Value |
|---|---|
| Type | `TXT` |
| Name | `@` |
| Value | `google-site-verification=39Zop59nD-4ER2BsgkE88AycHMaXqSHfv-fMKlVay9Y` |
| TTL | leave the default |

The A record and the www CNAME you do **not** recreate — Vercel writes
those itself for whichever project owns the apex.

---

## Step 5 — Switch the nameservers at Spaceship (you, 2 minutes)

1. **spaceship.com** → sign in → **Domains** → `wintechstudio.com`.
2. Open the **Nameservers** section (sometimes under "Domain" or "DNS").
3. It is currently on Spaceship's own nameservers. Choose **Custom
   nameservers**.
4. Replace both lines with the two Vercel gave you:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
5. **Save**.

Then wait. It is usually 10–30 minutes, occasionally a few hours. You can
watch it from here — ask me and I will check.

### If something looks wrong

Put `launch1.spaceship.net` and `launch2.spaceship.net` back in the same
box. Everything returns to how it is today.

---

## Step 6 — Point the studio site at itself (you, 2 minutes)

Once Vercel runs the DNS, your **studio site project** (the one serving
wintechstudio.com today) needs the apex again:

1. Open the studio project in Vercel → **Settings → Domains**.
2. `wintechstudio.com` and `www.wintechstudio.com` should already be listed
   and should turn **Valid** on their own once the nameservers move.
3. If either shows an error, remove it and add it again. Vercel writes the
   right records itself.

Split, once it settles:

| Address | Project |
|---|---|
| `wintechstudio.com`, `www.` | Studio site |
| `app.wintechstudio.com` | Wintech Templates |
| `anything.wintechstudio.com` | A customer's site |

---

## Step 7 — Tell Supabase about the new address (you, 2 minutes)

Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://app.wintechstudio.com`
- **Redirect URLs** — add all of these, keeping the localhost ones:
  ```
  https://app.wintechstudio.com/auth/callback
  http://localhost:3000/auth/callback
  ```

Without this, people can sign up but the confirmation link sends them
nowhere.

---

## Step 8 — What I do once it is live

1. Check the whole platform on the real address.
2. Make a connector link on the live site and **add it to Claude myself** to
   prove it works end to end. This is the first time that can be tested —
   Claude cannot reach a laptop.
3. Report back with anything broken.

---

## Then, before real customers

- **Vercel Pro** on the platform project.
- **Supabase Pro** — the free plan pauses an idle project and keeps no
  backups, and this database will hold other people's businesses.
- **Resend** for email, then confirmation emails back on.
- **Paystack** verified, keys into Vercel, then I build checkout.
