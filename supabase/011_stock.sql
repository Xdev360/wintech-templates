-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Run it AFTER 010. Safe to run more than once.
--
-- Stock. A product may carry a count; when it does, an order takes from
-- it and a cancelled order gives back. A product with no count is
-- "always available", which is right for services and made-to-order.
--
-- Counting happens here, in one transaction with the site row locked,
-- so two people cannot both buy the last one.

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
  stock int;
  priced jsonb := '[]'::jsonb;
  total bigint := 0;
  ref text;
  list jsonb;
  updated jsonb;
  item jsonb;
  taken int;
begin
  -- Locked for the length of the order, so stock cannot be sold twice.
  select * into s from public.sites where slug = lower(p_slug) and published = true for update;
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

  select count(*) into recent from public.orders
  where site_id = s.id and created_at > now() - interval '1 hour';
  if recent >= 40 then
    raise exception 'Too many orders just now. Please try again shortly.' using errcode = 'P0001';
  end if;

  list := coalesce(s.content->'items'->'list', '[]'::jsonb);

  for line in select * from jsonb_array_elements(p_items) loop
    qty := greatest(1, least(coalesce((line->>'qty')::int, 1), 99));

    select to_jsonb(i) into found
    from jsonb_array_elements(list) i
    where i->>'title' = line->>'title'
    limit 1;

    if found is null then
      raise exception 'Something in your order is no longer on sale. Please start again.' using errcode = 'P0001';
    end if;

    -- A count, if the owner keeps one. Blank means always available.
    stock := case when jsonb_typeof(found->'stock') = 'number' then (found->>'stock')::int else null end;
    if stock is not null and stock < qty then
      if stock = 0 then
        raise exception '% is sold out.', found->>'title' using errcode = 'P0001';
      end if;
      raise exception 'Only % left of %.', stock, found->>'title' using errcode = 'P0001';
    end if;

    price := public.price_to_kobo(found->>'price');
    total := total + price * qty;
    priced := priced || jsonb_build_object('title', found->>'title', 'qty', qty, 'price_kobo', price);
  end loop;

  -- Take the stock, now that every line is known to be fine.
  updated := '[]'::jsonb;
  for item in select * from jsonb_array_elements(list) loop
    taken := coalesce((
      select sum((l->>'qty')::int) from jsonb_array_elements(priced) l where l->>'title' = item->>'title'
    ), 0);
    if taken > 0 and jsonb_typeof(item->'stock') = 'number' then
      item := jsonb_set(item, '{stock}', to_jsonb(greatest(0, (item->>'stock')::int - taken)));
    end if;
    updated := updated || item;
  end loop;
  update public.sites
     set content = jsonb_set(content, '{items,list}', updated)
   where id = s.id;

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


-- A cancelled order gives its stock back. Done by trigger, so it holds
-- however the cancellation happens.
create or replace function public.restock_cancelled_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  list jsonb;
  updated jsonb := '[]'::jsonb;
  item jsonb;
  back int;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    select coalesce(content->'items'->'list', '[]'::jsonb) into list from public.sites where id = new.site_id for update;
    for item in select * from jsonb_array_elements(list) loop
      back := coalesce((
        select sum((l->>'qty')::int) from jsonb_array_elements(new.items) l where l->>'title' = item->>'title'
      ), 0);
      if back > 0 and jsonb_typeof(item->'stock') = 'number' then
        item := jsonb_set(item, '{stock}', to_jsonb((item->>'stock')::int + back));
      end if;
      updated := updated || item;
    end loop;
    update public.sites set content = jsonb_set(content, '{items,list}', updated) where id = new.site_id;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_restock on public.orders;
create trigger orders_restock
  after update of status on public.orders
  for each row execute function public.restock_cancelled_order();
