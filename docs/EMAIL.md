# Turning on email

One job, two results: receipts to buyers, and sign-up emails that come
from Wintech instead of from Supabase's shared address.

## Who the buyer thinks it came from

The buyer bought from the bakery, so the bakery's name is what shows in
their inbox:

```
From:     Tenjo Bakery <receipts@mail.wintechstudio.com>
Reply-to: tenjo@gmail.com
```

The name is the shop's. The address behind it is ours, because that is
the part the domain vouches for, and a shop cannot send as itself until
it proves it owns its own domain. A reply goes to the shop, never to us.

This is exactly Shopify's arrangement: a store that has not authenticated
its own domain has its sender rewritten to `store+123@shopifyemail.com`,
and Shopify carries the mail. One verified domain, every store.

Later, a paying shop with its own domain can verify it and send as
itself. That is a feature to sell, not a problem to fix.

## Why anything is needed at all

A computer can claim to be anyone when it sends an email. So Gmail only
trusts a sender that the domain itself has vouched for, in DNS. Resend
is the post office; the DNS records are the letter of introduction from
wintechstudio.com saying "this post office may send on my behalf".

Skip it and receipts either never arrive or land in spam.

## Step 1 — Make the account

resend.com → sign up with the Wintech email. Free to start.

## Step 2 — Add the domain, exactly as written

Domains → Add Domain → type:

```
mail.wintechstudio.com
```

Not `wintechstudio.com` on its own. The code sends from
`receipts@mail.wintechstudio.com`, and the address has to belong to the
domain that was verified, or Resend refuses it.

Region: pick the one nearest, **eu-west-1 (Ireland)** is closest to Lagos.

## Step 3 — Copy the records into Vercel

Resend now shows three or four records: one MX, and two or three TXT
(SPF, DKIM, and possibly DMARC).

Vercel → the **wintechstudio.com** domain → **DNS Records**.
(The nameservers already point at Vercel, so this is where DNS lives.)

For each one Resend shows, add a record in Vercel with the same Type,
Name and Value. Two things to watch:

- **Name.** Vercel adds `.wintechstudio.com` for you, so paste only the
  part in front of it. Resend showing `send.mail.wintechstudio.com`
  means the Name in Vercel is `send.mail`.
- **MX priority.** Vercel asks for it separately. It is `10`.

Then back in Resend: **Verify**. It usually goes green in a few minutes;
DNS can take an hour. Nothing else in the domain is affected — there was
no email running on wintechstudio.com before this.

## Step 4 — The key

Resend → API Keys → Create → sending access only. Copy it once.

Vercel → the **wintech-templates** project → Settings → Environment
Variables:

| Name | Type | Environments |
| --- | --- | --- |
| `RESEND_API_KEY` | **Secret** | Production, Preview, Development |

Never paste that key into a chat, a file, or a screenshot. If it is ever
seen, delete it in Resend and make another.

Redeploy (any push does it, or Deployments → ⋯ → Redeploy).

## Step 5 — Prove it

Order something small from your own site with your own email address,
press **I have sent the money**, then in Orders press **The money
arrived**. Under the order, the dashboard now says one of:

- *Receipt emailed to you@…* — done.
- *Receipt emails are not switched on yet* — the key did not reach the
  running site. Check the spelling and redeploy.
- *The receipt email did not go out* — the key is there but Resend
  refused, almost always an unverified domain or a from-address that
  does not match it.

If you verified a different domain than `mail.wintechstudio.com`, add
one more variable instead of changing code:

```
RESEND_FROM = Wintech Templates <receipts@whatever-you-verified.com>
```

## Later, for sign-up emails

Supabase's own email sender is capped at a few messages an hour and is
meant for testing. Once the domain above is verified, Supabase →
Authentication → Emails → SMTP can point at Resend:

| Field | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | the same Resend key |
| Sender | `hello@mail.wintechstudio.com` |

Do that before turning email confirmation back on for sign-up.
