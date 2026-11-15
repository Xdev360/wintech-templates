import type { SiteContent } from "./site-model";

/* A row from public.sites. `content` is stored as JSON and read into the
   current shape by readContent() in lib/site-model.ts. */
export type SiteRow = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  template: string;
  custom_domain: string | null;
  published: boolean;
  content: unknown;
  created_at: string;
  updated_at: string;
};

/** A site with its content already read into the current shape. */
export type Site = Omit<SiteRow, "content"> & { content: SiteContent };
