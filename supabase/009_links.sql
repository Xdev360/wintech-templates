-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Run it AFTER 008. Safe to run more than once.
--
-- Two changes:
--
--   1. A site's link can be changed. The old one is remembered, so anyone
--      who already shared the old address still arrives at the site
--      instead of at a dead page. Nothing a customer has printed, posted,
--      or sent on WhatsApp stops working because they renamed their site.
--
--   2. The free plan goes from one site to three.

alter table public.sites add column if not exists former_slugs text[] not null default '{}';

-- Finding a site by an address it used to have must be fast: it happens on
-- every visit to an address that is not a current site.
create index if not exists sites_former_slugs_idx on public.sites using gin (former_slugs);

-- The owner may write it, through the app's own checks.
grant update (slug, name, template, published, content, former_slugs) on public.sites to authenticated;


-- Reserved names, the free-site limit, and now: a name cannot be taken if
-- another site used to answer on it, or the old owner's shared links would
-- start landing on a stranger's site.
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
    'preview','vercel','supabase','platform','templates',
    'affiliate','affiliates','sell','pricing','dev','reset','inbox','credits','plugins','connect','settings','new'
  ];
  -- Keep in step with FREE_SITE_LIMIT in lib/config.ts.
  site_limit constant int := 3;
  existing int;
begin
  if new.slug = any(reserved) then
    raise exception 'That name is reserved. Try another.' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.sites
    where id <> new.id and new.slug = any(former_slugs)
  ) then
    raise exception 'Another site used that name before. Try another.' using errcode = 'P0001';
  end if;

  if tg_op = 'INSERT' then
    -- Two inserts at once for the same person must not both slip under the limit.
    perform pg_advisory_xact_lock(hashtext(new.user_id::text));
    select count(*) into existing from public.sites where user_id = new.user_id;
    if existing >= site_limit then
      raise exception 'The free plan is three sites.' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;


-- Is this name free? Now also refuses names that used to belong to a site.
create or replace function public.slug_available(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_slug ~ '^[a-z0-9]([a-z0-9-]{1,46}[a-z0-9])$'
     and not exists (select 1 from public.sites where slug = lower(p_slug))
     and not exists (select 1 from public.sites where lower(p_slug) = any(former_slugs));
$$;
revoke all on function public.slug_available(text) from public;
grant execute on function public.slug_available(text) to anon, authenticated;


-- Where an old address should send someone. Used by the site page when the
-- address does not match any current site.
create or replace function public.site_moved_to(p_slug text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select slug from public.sites
  where lower(p_slug) = any(former_slugs) and published = true
  limit 1;
$$;
revoke all on function public.site_moved_to(text) from public;
grant execute on function public.site_moved_to(text) to anon, authenticated;
