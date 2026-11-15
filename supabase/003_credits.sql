-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Run it AFTER schema.sql and 002_hardening.sql. Safe to run more than once.
--
-- Credits pay for Wintech AI. Every change to a balance is a row in a ledger,
-- so the balance is always the sum of its history and can be audited.
--
-- The rule that matters: a browser can read its own ledger and can spend its
-- own credits, but it can never add credits. Credits are only added here
-- (the welcome grant) or, later, by the payment webhook running on the server.

create table if not exists public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null,            -- positive adds credits, negative spends them
  reason text not null,              -- welcome, purchase, ai_message, telegram_message, refund
  ref text,                          -- the site id, or a payment reference
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_user_idx on public.credit_ledger (user_id, created_at desc);

alter table public.credit_ledger enable row level security;

drop policy if exists "Read own credits" on public.credit_ledger;
create policy "Read own credits"
  on public.credit_ledger
  for select
  using (auth.uid() = user_id);

-- No insert, update, or delete policy, and no grant: nobody writes from a browser.
revoke insert, update, delete on public.credit_ledger from anon, authenticated;


-- Balance for whoever is signed in.
create or replace function public.credit_balance()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(delta), 0)::integer from public.credit_ledger where user_id = auth.uid();
$$;

revoke all on function public.credit_balance() from public, anon;
grant execute on function public.credit_balance() to authenticated;


-- Spend credits for whoever is signed in. Refuses to go below zero.
-- Safe to expose: the worst a person can do with it is spend their own.
create or replace function public.spend_credits(p_amount integer, p_reason text, p_ref text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  balance integer;
begin
  if uid is null then
    raise exception 'Sign in first.' using errcode = 'P0001';
  end if;
  if p_amount is null or p_amount < 1 or p_amount > 100 then
    raise exception 'That is not a valid amount.' using errcode = 'P0001';
  end if;

  -- Two spends at once for the same person must not both pass the check.
  perform pg_advisory_xact_lock(hashtext('credits:' || uid::text));

  select coalesce(sum(delta), 0) into balance from public.credit_ledger where user_id = uid;
  if balance < p_amount then
    raise exception 'Not enough credits.' using errcode = 'P0001';
  end if;

  insert into public.credit_ledger (user_id, delta, reason, ref)
  values (uid, -p_amount, left(coalesce(p_reason, 'spend'), 40), left(p_ref, 80));

  return balance - p_amount;
end;
$$;

revoke all on function public.spend_credits(integer, text, text) from public, anon;
grant execute on function public.spend_credits(integer, text, text) to authenticated;


-- Every new account starts with free credits so they can try Wintech AI.
-- Change the 20 here to change the welcome grant.
create or replace function public.grant_welcome_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.credit_ledger (user_id, delta, reason) values (new.id, 20, 'welcome');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_credits on auth.users;
create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute function public.grant_welcome_credits();

-- Accounts created before this file ran get the same welcome grant, once.
insert into public.credit_ledger (user_id, delta, reason)
select u.id, 20, 'welcome'
from auth.users u
where not exists (
  select 1 from public.credit_ledger l where l.user_id = u.id and l.reason = 'welcome'
);
