-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Run it AFTER 005_enquiries.sql. Safe to run more than once.
--
-- Refer a friend. They get credits, you get credits.
--
-- The rules that stop this being a money hole:
--   · A person cannot refer themselves.
--   · A person can only be referred once, ever, and only in their first
--     hour — before they have done anything worth rewarding.
--   · Credits are granted by this function, never by a browser.
--   · Everything is a ledger row, so every free credit has a reason
--     attached to it that we can read back later.

-- Amounts. Change these two numbers to change the offer.
create or replace function public.referral_reward() returns integer
language sql immutable as $$ select 25 $$;

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                -- the sharer's code
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create unique index if not exists referrals_owner_idx on public.referrals (owner_id);

create table if not exists public.referral_claims (
  id uuid primary key default gen_random_uuid(),
  code text not null references public.referrals (code) on delete cascade,
  joiner_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists referral_claims_code_idx on public.referral_claims (code);

alter table public.referrals enable row level security;
alter table public.referral_claims enable row level security;

drop policy if exists "Read my referral code" on public.referrals;
create policy "Read my referral code" on public.referrals for select using (auth.uid() = owner_id);

drop policy if exists "Read who I brought" on public.referral_claims;
-- The outer column is named in full. Written as a bare `code`, it binds to
-- r.code inside the subquery, the test becomes r.code = r.code, and anyone
-- with a link of their own could read every claim on the platform.
create policy "Read who I brought" on public.referral_claims
  for select using (exists (
    select 1 from public.referrals r
    where r.code = referral_claims.code and r.owner_id = auth.uid()
  ));

revoke all on public.referrals from anon, authenticated;
revoke all on public.referral_claims from anon, authenticated;
grant select (id, code, owner_id, created_at) on public.referrals to authenticated;
grant select (id, code, joiner_id, created_at) on public.referral_claims to authenticated;


-- My code, made the first time I ask for it.
create or replace function public.my_referral_code()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid uuid := auth.uid();
  existing text;
  made text;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = 'P0001'; end if;
  select code into existing from public.referrals where owner_id = uid;
  if existing is not null then return existing; end if;

  -- Short, upper case, no confusable characters.
  made := upper(translate(encode(gen_random_bytes(6), 'base64'), '+/=OI01l', 'XYZW2345'));
  made := left(made, 8);
  insert into public.referrals (code, owner_id) values (made, uid);
  return made;
end;
$$;
revoke all on function public.my_referral_code() from public, anon;
grant execute on function public.my_referral_code() to authenticated;


-- Claim a code. Called once, just after signing up.
create or replace function public.claim_referral(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  owner uuid;
  joined_at timestamptz;
  reward int := public.referral_reward();
begin
  if uid is null then raise exception 'Sign in first.' using errcode = 'P0001'; end if;

  select owner_id into owner from public.referrals where code = upper(trim(p_code));
  if owner is null then return jsonb_build_object('ok', false, 'why', 'unknown code'); end if;
  if owner = uid then return jsonb_build_object('ok', false, 'why', 'that is your own link'); end if;
  if exists (select 1 from public.referral_claims where joiner_id = uid) then
    return jsonb_build_object('ok', false, 'why', 'already claimed');
  end if;

  -- Only in the first hour of an account's life.
  select created_at into joined_at from auth.users where id = uid;
  if joined_at < now() - interval '1 hour' then
    return jsonb_build_object('ok', false, 'why', 'too late');
  end if;

  insert into public.referral_claims (code, joiner_id) values (upper(trim(p_code)), uid);
  insert into public.credit_ledger (user_id, delta, reason, ref)
  values (uid, reward, 'referral_joined', upper(trim(p_code))),
         (owner, reward, 'referral_reward', uid::text);

  return jsonb_build_object('ok', true, 'credits', reward);
end;
$$;
revoke all on function public.claim_referral(text) from public, anon;
grant execute on function public.claim_referral(text) to authenticated;


-- How the sharer is doing: how many joined, how many credits earned.
create or replace function public.referral_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'joined', (
      select count(*) from public.referral_claims c
      join public.referrals r on r.code = c.code
      where r.owner_id = auth.uid()
    ),
    'earned', coalesce((
      select sum(delta) from public.credit_ledger
      where user_id = auth.uid() and reason = 'referral_reward'
    ), 0),
    'reward', public.referral_reward()
  );
$$;
revoke all on function public.referral_stats() from public, anon;
grant execute on function public.referral_stats() to authenticated;
