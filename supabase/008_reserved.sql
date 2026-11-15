-- Run in Supabase after 007. Safe to run more than once.
-- Adds the names that are now pages on the platform to the reserved list,
-- so nobody can claim affiliate.wintechstudio.com or sell.wintechstudio.com.
-- Keep in step with RESERVED_SLUGS in lib/config.ts.
create or replace function public.enforce_site_rules()
returns trigger
language plpgsql
as $$
declare
  reserved constant text[] := array[
    'www','app','api','mail','admin','ftp','cdn','assets','static',
    'login','signup','dashboard','auth','view','support','help','status',
    'blog','shop','store','wintech','studio','root','test','staging',
    'preview','vercel','supabase','platform','templates',
    'affiliate','affiliates','sell','pricing','dev','reset','inbox','credits','plugins','connect','settings','new'
  ];
  site_limit constant int := 1;
  existing int;
begin
  if new.slug = any(reserved) then
    raise exception 'That name is reserved. Try another.' using errcode = 'P0001';
  end if;
  if tg_op = 'INSERT' then
    perform pg_advisory_xact_lock(hashtext(new.user_id::text));
    select count(*) into existing from public.sites where user_id = new.user_id;
    if existing >= site_limit then
      raise exception 'The free plan is one live site.' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
