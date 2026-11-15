-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Run it AFTER schema.sql. Safe to run more than once.
--
-- Why this exists
-- The app checks reserved names and the one-free-site limit, but only inside
-- app/actions/sites.ts. The anon key is public by design (it ships in every
-- browser), so any signed-in user can skip the app and write to the database
-- directly with their own session. Without this file they could:
--   · create unlimited free sites
--   · claim support / admin / help / wintech ... and put a phishing page at
--     support.wintechstudio.com, under your name
--   · set custom_domain to any domain, including one they do not own
--   · use the public media bucket as free file hosting, any size, any type


-- 1. Reserved names and the free-site limit, enforced where nobody can skip them.

create or replace function public.enforce_site_rules()
returns trigger
language plpgsql
as $$
declare
  -- Keep in step with RESERVED_SLUGS in lib/config.ts.
  reserved constant text[] := array[
    'www','app','api','mail','admin','ftp','cdn','assets','static',
    'login','signup','dashboard','auth','view','support','help','status',
    'blog','shop','store','wintech','studio','root','test','staging',
    'preview','vercel','supabase','platform','templates'
  ];
  -- Keep in step with FREE_SITE_LIMIT in lib/config.ts. When paid plans
  -- arrive, read the limit from the plan instead of this constant.
  site_limit constant int := 1;
  existing int;
begin
  if new.slug = any(reserved) then
    raise exception 'That name is reserved. Try another.' using errcode = 'P0001';
  end if;

  if tg_op = 'INSERT' then
    -- Two inserts at once for the same person must not both slip under the limit.
    perform pg_advisory_xact_lock(hashtext(new.user_id::text));
    select count(*) into existing from public.sites where user_id = new.user_id;
    if existing >= site_limit then
      raise exception 'The free plan is one live site.' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists sites_enforce_rules on public.sites;
create trigger sites_enforce_rules
  before insert or update of slug on public.sites
  for each row execute function public.enforce_site_rules();


-- 2. Owners edit their site. They never set their own custom domain from the
--    browser: that will be written by a server-side flow that has verified
--    they own the domain.

revoke insert, update on public.sites from anon, authenticated;
grant insert (user_id, slug, name, template, published, content) on public.sites to authenticated;
grant update (slug, name, template, published, content) on public.sites to authenticated;


-- 3. The media bucket takes images only, 8 MB each. SVG is left out on
--    purpose: an SVG can carry script.

update storage.buckets
set file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/avif']
where id = 'site-media';
