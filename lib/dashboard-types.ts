import type { Kind } from "./templates";

/* What the dashboard shell needs to draw itself. Kept free of server
   imports so client components can use the types. */

export type ShellSite = {
  id: string;
  name: string;
  slug: string;
  kind: Kind;
  kindLabel: string;
  templateName: string;
  published: boolean;
  accent: string;
  logoUrl: string;
};

export type ShellUser = {
  name: string;
  email: string;
  verified: boolean;
};
