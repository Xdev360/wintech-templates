# Turning on "Continue with Google"

The buttons are already on the login and sign-up pages. They currently
fail politely, because Supabase answers `provider is not enabled`.

Switching it on is one job in two places: Google gives you a pair of
credentials, and Supabase holds them. About fifteen minutes.

## Step 1 — A Google Cloud project

1. Go to **console.cloud.google.com**, sign in with the Wintech account.
2. Top left, the project dropdown, **New Project**. Name it
   `Wintech Templates`. Create, then make sure it is the selected project.

## Step 2 — The consent screen

This is the page people see saying "Wintech Templates wants to access
your Google account". Google will not issue credentials without it.

Google renamed this area. It is no longer called "OAuth consent screen";
it is **Google Auth Platform**, split into Branding, Audience, Data
Access and Clients.

1. Go straight to `console.cloud.google.com/auth/branding`.
2. Press **Get started**. Audience type: **External**.
3. Fill in:

| Field | Value |
| --- | --- |
| App name | `Wintech Templates` |
| User support email | `oladele@wintechstudio.com` |
| App logo | The Wintech mark, optional but worth it |
| Application home page | `https://app.wintechstudio.com` |
| Privacy policy | `https://app.wintechstudio.com/privacy` |
| Terms of service | `https://app.wintechstudio.com/terms` |
| Authorised domain | `wintechstudio.com` |
| Developer contact | `oladele@wintechstudio.com` |

4. Scopes: add nothing. The defaults (email, profile) are all we use,
   and asking for more triggers a Google review you do not want.
5. Save through to the end.

**Publishing status.** It starts in *Testing*, where only accounts you
list yourself can sign in. Go to `console.cloud.google.com/auth/audience`
and press **Publish app** before launch. Because
we ask for no sensitive scopes, publishing is instant and needs no
review.

## Step 3 — The credentials

1. Go to `console.cloud.google.com/auth/clients` → **Create client**.
2. Application type: **Web application**. Name: `Supabase`.
3. **Authorised JavaScript origins**, add both:

```
https://app.wintechstudio.com
http://localhost:3000
```

4. **Authorised redirect URIs**, add exactly this one:

```
https://owdagrdjlpyjxsoblcqr.supabase.co/auth/v1/callback
```

That is Supabase's address, not ours. Google sends the person to
Supabase, Supabase sends them back to us. Getting this wrong is the
single most common failure, and it shows as `redirect_uri_mismatch`.

5. Create. Google shows a **Client ID** and a **Client secret**.

## Step 4 — Hand them to Supabase

1. Supabase dashboard → **Authentication** → **Sign In / Providers** →
   **Google**.
2. Switch it on, paste the Client ID and the Client secret, save.

The secret is a password. Paste it into Supabase only — never into a
chat, a file, or a screenshot. If it is ever seen, delete the client in
Google and make a new one.

## Step 5 — Check it

Open `https://app.wintechstudio.com/signup` in a private window and
press **Sign up with Google**. You should land in the dashboard with
your Google name already showing.

Things that are already handled in the code:

- **Credits.** A database trigger gives every new account its starting
  credits, however they signed up.
- **Referrals.** A `?ref=CODE` link survives the trip to Google and back.
  The code waits in the browser and is claimed on the first dashboard
  page the new account sees.
- **Names.** Google's name is used if it sends one, otherwise the part
  of the email before the @.

## Worth knowing

Google sign-in does not need email confirmation, because Google has
already confirmed the address. So this quietly removes the confirmation
step for everyone who uses it, which is most people.
