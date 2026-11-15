-- Wintech Templates: everything your database is still missing, in order.
-- Checked on 15 September: 002-005 are in; 006, 007, 008 are not.
-- Paste all of this into Supabase → SQL Editor → New query → Run. Safe to run more than once.

-- ========== 006_referrals.sql ==========
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


-- ========== 007_affiliates.sql ==========
-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Run it AFTER 006_referrals.sql. Safe to run more than once.
--
-- Affiliates are people who send us paying customers and take a share of
-- what those customers pay. That is different from the referral credits in
-- 006: referrals pay in credits, affiliates pay in money.
--
-- The share: 20% of every payment a referred customer makes, for 12 months.
--
-- Nothing here can pay anyone by itself. A commission row is written only
-- when a payment clears, by the payment webhook on the server, and a payout
-- is marked sent by hand. Money never moves because a browser asked.

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  code text not null unique,
  payout_name text not null,
  payout_bank text not null,
  payout_account text not null,
  status text not null default 'active',      -- active | paused
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_signups (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists affiliate_signups_idx on public.affiliate_signups (affiliate_id, created_at desc);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  from_user uuid references auth.users (id) on delete set null,
  amount_kobo bigint not null,                -- money is stored in kobo, never in floats
  reason text not null default 'subscription',
  status text not null default 'pending',     -- pending → approved → paid
  created_at timestamptz not null default now()
);
create index if not exists commissions_idx on public.commissions (affiliate_id, status);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  amount_kobo bigint not null,
  status text not null default 'requested',   -- requested → sent
  requested_at timestamptz not null default now(),
  sent_at timestamptz,
  note text
);
create index if not exists payouts_idx on public.payouts (affiliate_id, requested_at desc);

alter table public.affiliates enable row level security;
alter table public.affiliate_signups enable row level security;
alter table public.commissions enable row level security;
alter table public.payouts enable row level security;

drop policy if exists "Read my affiliate account" on public.affiliates;
create policy "Read my affiliate account" on public.affiliates for select using (auth.uid() = user_id);

-- Outer columns are named in full: a bare name inside a policy subquery
-- binds to the inner table if that table has a column of the same name.
drop policy if exists "Read my signups" on public.affiliate_signups;
create policy "Read my signups" on public.affiliate_signups for select
  using (exists (select 1 from public.affiliates a where a.id = affiliate_signups.affiliate_id and a.user_id = auth.uid()));

drop policy if exists "Read my commissions" on public.commissions;
create policy "Read my commissions" on public.commissions for select
  using (exists (select 1 from public.affiliates a where a.id = commissions.affiliate_id and a.user_id = auth.uid()));

drop policy if exists "Read my payouts" on public.payouts;
create policy "Read my payouts" on public.payouts for select
  using (exists (select 1 from public.affiliates a where a.id = payouts.affiliate_id and a.user_id = auth.uid()));

revoke all on public.affiliates, public.affiliate_signups, public.commissions, public.payouts from anon, authenticated;
grant select (id, user_id, code, payout_name, payout_bank, payout_account, status, created_at) on public.affiliates to authenticated;
grant select (id, affiliate_id, user_id, created_at) on public.affiliate_signups to authenticated;
grant select (id, affiliate_id, amount_kobo, reason, status, created_at) on public.commissions to authenticated;
grant select (id, affiliate_id, amount_kobo, status, requested_at, sent_at, note) on public.payouts to authenticated;


-- The share and the smallest payout we will send. Change them here.
create or replace function public.affiliate_rate() returns numeric
language sql immutable as $$ select 0.20 $$;
create or replace function public.payout_minimum_kobo() returns bigint
language sql immutable as $$ select 1000000 $$;   -- ₦10,000


-- Join. Bank details are needed up front: an affiliate with nowhere to be
-- paid is a support ticket waiting to happen.
create or replace function public.become_affiliate(p_name text, p_bank text, p_account text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid uuid := auth.uid();
  existing public.affiliates;
  made text;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = 'P0001'; end if;

  select * into existing from public.affiliates where user_id = uid;
  if existing.id is not null then
    return jsonb_build_object('ok', true, 'code', existing.code);
  end if;

  if length(coalesce(trim(p_name), '')) < 2 then raise exception 'Put in the name on your account.' using errcode = 'P0001'; end if;
  if length(coalesce(trim(p_bank), '')) < 2 then raise exception 'Put in your bank.' using errcode = 'P0001'; end if;
  if coalesce(trim(p_account), '') !~ '^[0-9]{10}$' then raise exception 'A Nigerian account number is ten digits.' using errcode = 'P0001'; end if;

  made := left(upper(translate(encode(gen_random_bytes(6), 'base64'), '+/=OI01l', 'XYZW2345')), 7);

  insert into public.affiliates (user_id, code, payout_name, payout_bank, payout_account)
  values (uid, made, left(trim(p_name), 80), left(trim(p_bank), 60), trim(p_account));

  return jsonb_build_object('ok', true, 'code', made);
end;
$$;
revoke all on function public.become_affiliate(text, text, text) from public, anon;
grant execute on function public.become_affiliate(text, text, text) to authenticated;


-- Attach a new account to the affiliate whose link it came from. Same rules
-- as referrals: not yourself, once only, and only in the first hour.
create or replace function public.attach_affiliate(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  a public.affiliates;
  joined_at timestamptz;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = 'P0001'; end if;
  select * into a from public.affiliates where code = upper(trim(p_code)) and status = 'active';
  if a.id is null then return jsonb_build_object('ok', false, 'why', 'unknown code'); end if;
  if a.user_id = uid then return jsonb_build_object('ok', false, 'why', 'your own link'); end if;
  if exists (select 1 from public.affiliate_signups where user_id = uid) then
    return jsonb_build_object('ok', false, 'why', 'already attached');
  end if;

  select created_at into joined_at from auth.users where id = uid;
  if joined_at < now() - interval '1 hour' then return jsonb_build_object('ok', false, 'why', 'too late'); end if;

  insert into public.affiliate_signups (affiliate_id, user_id) values (a.id, uid);
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.attach_affiliate(text) from public, anon;
grant execute on function public.attach_affiliate(text) to authenticated;


-- Everything the affiliate dashboard shows, in one call.
create or replace function public.affiliate_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  a public.affiliates;
  paid bigint;
  approved bigint;
  pending bigint;
  requested bigint;
begin
  select * into a from public.affiliates where user_id = auth.uid();
  if a.id is null then return jsonb_build_object('joined', false, 'rate', public.affiliate_rate()); end if;

  select coalesce(sum(amount_kobo), 0) into paid from public.commissions where affiliate_id = a.id and status = 'paid';
  select coalesce(sum(amount_kobo), 0) into approved from public.commissions where affiliate_id = a.id and status = 'approved';
  select coalesce(sum(amount_kobo), 0) into pending from public.commissions where affiliate_id = a.id and status = 'pending';
  select coalesce(sum(amount_kobo), 0) into requested from public.payouts where affiliate_id = a.id and status = 'requested';

  return jsonb_build_object(
    'joined', true,
    'code', a.code,
    'rate', public.affiliate_rate(),
    'minimum_kobo', public.payout_minimum_kobo(),
    'signups', (select count(*) from public.affiliate_signups where affiliate_id = a.id),
    'pending_kobo', pending,
    'approved_kobo', approved,
    'paid_kobo', paid,
    'requested_kobo', requested,
    'available_kobo', greatest(approved - requested, 0),
    'payout_name', a.payout_name,
    'payout_bank', a.payout_bank,
    'payout_account', a.payout_account
  );
end;
$$;
revoke all on function public.affiliate_overview() from public, anon;
grant execute on function public.affiliate_overview() to authenticated;


-- Ask to be paid. Writes a request; a person sends the money and marks it.
create or replace function public.request_payout()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.affiliates;
  approved bigint;
  requested bigint;
  available bigint;
begin
  select * into a from public.affiliates where user_id = auth.uid();
  if a.id is null then raise exception 'You are not an affiliate yet.' using errcode = 'P0001'; end if;

  select coalesce(sum(amount_kobo), 0) into approved from public.commissions where affiliate_id = a.id and status = 'approved';
  select coalesce(sum(amount_kobo), 0) into requested from public.payouts where affiliate_id = a.id and status = 'requested';
  available := approved - requested;

  if available < public.payout_minimum_kobo() then
    raise exception 'You need at least ₦%,  and you have ₦%.',
      (public.payout_minimum_kobo() / 100), (greatest(available, 0) / 100) using errcode = 'P0001';
  end if;

  insert into public.payouts (affiliate_id, amount_kobo) values (a.id, available);
  return jsonb_build_object('ok', true, 'amount_kobo', available);
end;
$$;
revoke all on function public.request_payout() from public, anon;
grant execute on function public.request_payout() to authenticated;


-- ========== 008_reserved.sql ==========
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


-- ========== Check it worked: all three should say true ==========
select
  exists (select 1 from pg_proc where proname = 'claim_referral')   as referrals_ready,
  exists (select 1 from pg_proc where proname = 'become_affiliate') as affiliates_ready,
  (select prosrc like '%affiliates%' from pg_proc where proname = 'enforce_site_rules') as reserved_ready;