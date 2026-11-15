-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Run it AFTER 009. Safe to run more than once.
--
-- Taking money, the way Nigerian small businesses actually take money:
-- the customer sends a bank transfer and says they have paid; the owner
-- checks their bank app and confirms it. Wintech never touches the money
-- and charges nothing on it.
--
-- The rules that matter:
--
--   · Prices are read from the site's own content, here, on the server.
--     The browser says WHAT was ordered, never what it costs. Otherwise
--     anyone could order a ₦95,000 dress for ₦1.
--   · A customer is a stranger. They never touch the orders table; they
--     call place_order(), and read their own order back only by knowing
--     its reference.
--   · Only the owner can confirm that money arrived. "I have paid" is a
--     claim by the customer, and is stored as exactly that.

-- ── Where the money goes ────────────────────────────────────────────────
-- Kept out of `content` on purpose: content is written by the editor, by
-- Wintech AI, and by Claude through the connector. Bank details are not
-- something an AI should ever be able to write.
alter table public.sites add column if not exists payment jsonb not null default '{}'::jsonb;
grant update (slug, name, template, published, content, former_slugs, payment) on public.sites to authenticated;


-- ── Orders ──────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  reference text not null unique,          -- what the customer quotes; also their key to the order
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  items jsonb not null,                    -- [{ title, qty, price_kobo }]
  total_kobo bigint not null,
  note text,
  status text not null default 'awaiting', -- awaiting → claimed → confirmed | cancelled
  created_at timestamptz not null default now(),
  claimed_at timestamptz,                  -- when the customer said they had paid
  confirmed_at timestamptz,                -- when the owner saw the money
  constraint orders_status_check check (status in ('awaiting', 'claimed', 'confirmed', 'cancelled'))
);

create index if not exists orders_site_idx on public.orders (site_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Read orders for my sites" on public.orders;
create policy "Read orders for my sites" on public.orders for select
  using (exists (select 1 from public.sites s where s.id = orders.site_id and s.user_id = auth.uid()));

drop policy if exists "Update orders for my sites" on public.orders;
create policy "Update orders for my sites" on public.orders for update
  using (exists (select 1 from public.sites s where s.id = orders.site_id and s.user_id = auth.uid()));

revoke all on public.orders from anon, authenticated;
grant select (id, site_id, reference, customer_name, customer_phone, customer_email, items, total_kobo, note, status, created_at, claimed_at, confirmed_at) on public.orders to authenticated;
grant update (status, confirmed_at) on public.orders to authenticated;


-- ── Money helpers ───────────────────────────────────────────────────────
-- A price in the editor is text a person typed: "₦12,000", "12000",
-- "From ₦5,000", "Free". Take the digits, treat them as naira.
create or replace function public.price_to_kobo(p_price text)
returns bigint
language sql
immutable
as $$
  select coalesce(nullif(regexp_replace(coalesce(p_price, ''), '[^0-9]', '', 'g'), ''), '0')::bigint * 100;
$$;


-- ── A customer places an order ──────────────────────────────────────────
-- p_items is [{ "title": "...", "qty": 2 }]. Prices come from the site.
create or replace function public.place_order(
  p_slug text,
  p_name text,
  p_phone text,
  p_email text,
  p_items jsonb,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  s public.sites;
  recent int;
  line jsonb;
  found jsonb;
  qty int;
  price bigint;
  priced jsonb := '[]'::jsonb;
  total bigint := 0;
  ref text;
begin
  select * into s from public.sites where slug = lower(p_slug) and published = true;
  if s.id is null then
    raise exception 'This shop is not open right now.' using errcode = 'P0001';
  end if;

  if length(coalesce(trim(p_name), '')) < 2 or length(p_name) > 60 then
    raise exception 'Put in your name.' using errcode = 'P0001';
  end if;
  if coalesce(trim(p_phone), '') !~ '^[0-9+][0-9 +()-]{6,19}$' then
    raise exception 'Put in a phone number they can reach you on.' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your order is empty.' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_items) > 20 then
    raise exception 'That is too many different items in one order.' using errcode = 'P0001';
  end if;

  -- One shop cannot take more than 40 orders an hour. Past that it is a
  -- robot, and the owner's phone would be the thing that suffers.
  select count(*) into recent from public.orders
  where site_id = s.id and created_at > now() - interval '1 hour';
  if recent >= 40 then
    raise exception 'Too many orders just now. Please try again shortly.' using errcode = 'P0001';
  end if;

  for line in select * from jsonb_array_elements(p_items) loop
    qty := greatest(1, least(coalesce((line->>'qty')::int, 1), 99));

    -- The price is whatever this site says it is, not what the browser sent.
    select to_jsonb(i) into found
    from jsonb_array_elements(coalesce(s.content->'items'->'list', '[]'::jsonb)) i
    where i->>'title' = line->>'title'
    limit 1;

    if found is null then
      raise exception 'Something in your order is no longer on sale. Please start again.' using errcode = 'P0001';
    end if;

    price := public.price_to_kobo(found->>'price');
    total := total + price * qty;
    priced := priced || jsonb_build_object('title', found->>'title', 'qty', qty, 'price_kobo', price);
  end loop;

  -- Short, said aloud over the phone without confusion.
  ref := 'WT-' || upper(left(translate(encode(gen_random_bytes(6), 'base64'), '+/=OI01lS5', 'XYZWABCDEF'), 6));

  insert into public.orders (site_id, reference, customer_name, customer_phone, customer_email, items, total_kobo, note)
  values (s.id, ref, trim(p_name), trim(p_phone), nullif(trim(coalesce(p_email, '')), ''), priced, total, left(nullif(trim(coalesce(p_note, '')), ''), 500));

  return jsonb_build_object(
    'reference', ref,
    'total_kobo', total,
    'items', priced,
    'business', s.name,
    'payment', coalesce(s.payment, '{}'::jsonb)
  );
end;
$$;
revoke all on function public.place_order(text, text, text, text, jsonb, text) from public;
grant execute on function public.place_order(text, text, text, text, jsonb, text) to anon, authenticated;


-- ── A customer checks their own order ───────────────────────────────────
-- The reference is the key. It carries no personal detail beyond what the
-- customer typed themselves.
create or replace function public.order_status(p_reference text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  o public.orders;
  s public.sites;
begin
  select * into o from public.orders where reference = upper(trim(p_reference));
  if o.id is null then return jsonb_build_object('found', false); end if;
  select * into s from public.sites where id = o.site_id;

  return jsonb_build_object(
    'found', true,
    'reference', o.reference,
    'status', o.status,
    'items', o.items,
    'total_kobo', o.total_kobo,
    'customer_name', o.customer_name,
    'customer_phone', o.customer_phone,
    'note', o.note,
    'created_at', o.created_at,
    'confirmed_at', o.confirmed_at,
    'business', s.name,
    'slug', s.slug,
    'business_email', s.content->'brand'->>'email',
    'business_phone', s.content->'brand'->>'phone',
    'payment', case when o.status = 'confirmed' then '{}'::jsonb else coalesce(s.payment, '{}'::jsonb) end
  );
end;
$$;
revoke all on function public.order_status(text) from public;
grant execute on function public.order_status(text) to anon, authenticated;


-- ── "I have paid" ───────────────────────────────────────────────────────
-- A claim, not a confirmation. Only the owner, looking at their own bank
-- app, can say the money arrived.
create or replace function public.claim_order_paid(p_reference text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare o public.orders;
begin
  select * into o from public.orders where reference = upper(trim(p_reference));
  if o.id is null then raise exception 'We cannot find that order.' using errcode = 'P0001'; end if;
  if o.status = 'awaiting' then
    update public.orders set status = 'claimed', claimed_at = now() where id = o.id;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.claim_order_paid(text) from public;
grant execute on function public.claim_order_paid(text) to anon, authenticated;


-- ── How many orders need the owner's attention ──────────────────────────
create or replace function public.orders_waiting(p_site uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.orders o
  join public.sites s on s.id = o.site_id
  where o.site_id = p_site and s.user_id = auth.uid() and o.status = 'claimed';
$$;
revoke all on function public.orders_waiting(uuid) from public, anon;
grant execute on function public.orders_waiting(uuid) to authenticated;
