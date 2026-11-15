-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Run it AFTER schema.sql, 002, 003 and 004. Safe to run more than once.
--
-- Messages from a customer's own visitors: the "send a message" form on a
-- published site, and later WhatsApp and Instagram, which is why there is a
-- `source` column.
--
-- The rules:
--   · A visitor is a stranger with the public key. They never touch this
--     table directly: they call submit_enquiry(), which checks the site is
--     published, checks the lengths, and refuses a flood.
--   · Only the site's owner can read the messages, and the only thing they
--     can change is whether a message is read.

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  name text not null,
  contact text not null,            -- email or phone, as the visitor typed it
  message text not null,
  source text not null default 'site',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists enquiries_site_idx on public.enquiries (site_id, created_at desc);

alter table public.enquiries enable row level security;

drop policy if exists "Read messages for my sites" on public.enquiries;
create policy "Read messages for my sites" on public.enquiries
  for select using (exists (select 1 from public.sites s where s.id = site_id and s.user_id = auth.uid()));

drop policy if exists "Mark my messages read" on public.enquiries;
create policy "Mark my messages read" on public.enquiries
  for update using (exists (select 1 from public.sites s where s.id = site_id and s.user_id = auth.uid()));

drop policy if exists "Delete my messages" on public.enquiries;
create policy "Delete my messages" on public.enquiries
  for delete using (exists (select 1 from public.sites s where s.id = site_id and s.user_id = auth.uid()));

-- Nobody inserts from a browser. The function below is the only way in.
revoke all on public.enquiries from anon, authenticated;
grant select (id, site_id, name, contact, message, source, created_at, read_at) on public.enquiries to authenticated;
grant update (read_at) on public.enquiries to authenticated;
grant delete on public.enquiries to authenticated;


-- A visitor sends a message. Returns nothing useful on purpose: a stranger
-- learns only that it worked.
create or replace function public.submit_enquiry(
  p_slug text,
  p_name text,
  p_contact text,
  p_message text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.sites;
  recent int;
begin
  select * into s from public.sites where slug = lower(p_slug) and published = true;
  if s.id is null then
    raise exception 'That site is not taking messages right now.' using errcode = 'P0001';
  end if;

  if length(coalesce(trim(p_name), '')) < 1 or length(p_name) > 60 then
    raise exception 'Put in your name.' using errcode = 'P0001';
  end if;
  if length(coalesce(trim(p_contact), '')) < 3 or length(p_contact) > 80 then
    raise exception 'Put in a phone number or an email, so they can reply.' using errcode = 'P0001';
  end if;
  if length(coalesce(trim(p_message), '')) < 2 or length(p_message) > 1200 then
    raise exception 'Write your message.' using errcode = 'P0001';
  end if;

  -- One site cannot take more than 30 messages an hour. A flood is either a
  -- robot or a person hammering the button; neither needs a 31st.
  select count(*) into recent
  from public.enquiries
  where site_id = s.id and created_at > now() - interval '1 hour';
  if recent >= 30 then
    raise exception 'Too many messages just now. Please try again later.' using errcode = 'P0001';
  end if;

  insert into public.enquiries (site_id, name, contact, message)
  values (s.id, trim(p_name), trim(p_contact), trim(p_message));

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.submit_enquiry(text, text, text, text) from public;
grant execute on function public.submit_enquiry(text, text, text, text) to anon, authenticated;


-- How many unread, for the dashboard's Inbox badge.
create or replace function public.unread_enquiries(p_site uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.enquiries e
  join public.sites s on s.id = e.site_id
  where e.site_id = p_site and s.user_id = auth.uid() and e.read_at is null;
$$;

revoke all on function public.unread_enquiries(uuid) from public, anon;
grant execute on function public.unread_enquiries(uuid) to authenticated;
