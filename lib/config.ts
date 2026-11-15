export const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "wintechstudio.com";

export const APP_HOSTS = new Set([
  `app.${ROOT_DOMAIN}`,
  "localhost",
  "127.0.0.1",
]);

export const RESERVED_SLUGS = new Set([
  "affiliate",
  "affiliates",
  "sell",
  "pricing",
  "dev",
  "reset",
  "inbox",
  "credits",
  "plugins",
  "connect",
  "settings",
  "new",

  "www",
  "app",
  "api",
  "mail",
  "admin",
  "ftp",
  "cdn",
  "assets",
  "static",
  "login",
  "signup",
  "dashboard",
  "auth",
  "view",
  "support",
  "help",
  "status",
  "blog",
  "shop",
  "store",
  "wintech",
  "studio",
  "root",
  "test",
  "staging",
  "preview",
  "vercel",
  "supabase",
  "platform",
  "templates",
]);

export const FREE_SITE_LIMIT = 3;
