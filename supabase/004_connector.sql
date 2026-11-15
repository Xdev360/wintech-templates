-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Run it AFTER schema.sql, 002_hardening.sql and 003_credits.sql. Safe to run more than once.
--
-- Two things:
--   1. slug_available(): the home page's name search asks whether
--      name.wintechstudio.com is free, without seeing anyone's data.
--   2. Connect to Claude: a personal link a person pastes into Claude as a
--      connector. Only a hash of the link is stored, so a leaked database does
--      not leak working links. Every function checks the link and acts only on
--      its owner's sites. Content arriving here was already cleaned by the app,
--      and is cleaned again whenever a site is read.

-- ── 1. Is a name free? ──────────────────────────────────────────────────────
create or replace function public.slug_available(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_slug ~ '^[a-z0-9]([a-z0-9-]{1,46}[a-z0-9])$'
     and not exists (select 1 from public.sites where slug = lower(p_slug));
$$;
revoke all on function public.slug_available(text) from public;
grant execute on function public.slug_available(text) to anon, authenticated;


-- ── 2. Connector links ──────────────────────────────────────────────────────
create table if not exists public.connector_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Claude',
  token_hash text not null unique,   -- sha256 of the link's secret, never the secret
  prefix text not null,              -- first characters, so people can tell links apart
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index if not exists connector_tokens_user_idx on public.connector_tokens (user_id);

alter table public.connector_tokens enable row level security;
drop policy if exists "Read own connector links" on public.connector_tokens;
create policy "Read own connector links" on public.connector_tokens for select using (auth.uid() = user_id);
revoke all on public.connector_tokens from anon, authenticated;
grant select (id, user_id, label, prefix, created_at, last_used_at, revoked_at) on public.connector_tokens to authenticated;

-- Make a link. The secret is returned once, here, and never stored.
create or replace function public.create_connector_token(p_label text default 'Claude')
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid uuid := auth.uid();
  secret text;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = 'P0001'; end if;
  if (select count(*) from public.connector_tokens where user_id = uid and revoked_at is null) >= 5 then
    raise exception 'You already have five active links. Revoke one first.' using errcode = 'P0001';
  end if;
  secret := 'wt_' || replace(translate(encode(gen_random_bytes(24), 'base64'), '+/', '-_'), '=', '');
  insert into public.connector_tokens (user_id, label, token_hash, prefix)
  values (uid, left(coalesce(nullif(trim(p_label), ''), 'Claude'), 40), encode(digest(secret, 'sha256'), 'hex'), left(secret, 9));
  return secret;
end;
$$;
revoke all on function public.create_connector_token(text) from public, anon;
grant execute on function public.create_connector_token(text) to authenticated;

create or replace function public.revoke_connector_token(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.connector_tokens set revoked_at = now()
  where id = p_id and user_id = auth.uid() and revoked_at is null;
$$;
revoke all on function public.revoke_connector_token(uuid) from public, anon;
grant execute on function public.revoke_connector_token(uuid) to authenticated;

-- Who a link belongs to. Internal: only the functions below call it.
create or replace function public.mcp_user(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare uid uuid;
begin
  update public.connector_tokens
     set last_used_at = now()
   where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex') and revoked_at is null
  returning user_id into uid;
  if uid is null then
    raise exception 'This Wintech link is not valid or was revoked. Make a new one in Plugins, Connect to Claude.' using errcode = 'P0001';
  end if;
  return uid;
end;
$$;
revoke all on function public.mcp_user(text) from public, anon, authenticated;

create or replace function public.mcp_whoami(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid := public.mcp_user(p_token);
begin
  return jsonb_build_object('ok', true, 'sites', (select count(*) from public.sites where user_id = uid));
end;
$$;

create or replace function public.mcp_list_sites(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid := public.mcp_user(p_token);
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'slug', slug, 'template', template, 'published', published, 'updated_at', updated_at) order by created_at)
    from public.sites where user_id = uid
  ), '[]'::jsonb);
end;
$$;

create or replace function public.mcp_get_site(p_token text, p_site uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid := public.mcp_user(p_token); r public.sites;
begin
  select * into r from public.sites where id = p_site and user_id = uid;
  if r.id is null then raise exception 'No site with that id on your account.' using errcode = 'P0001'; end if;
  return jsonb_build_object('id', r.id, 'name', r.name, 'slug', r.slug, 'template', r.template, 'published', r.published, 'content', r.content);
end;
$$;

create or replace function public.mcp_save_site(p_token text, p_site uuid, p_content jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid := public.mcp_user(p_token);
begin
  update public.sites set content = p_content where id = p_site and user_id = uid;
  if not found then raise exception 'No site with that id on your account.' using errcode = 'P0001'; end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.mcp_create_site(p_token text, p_name text, p_slug text, p_template text, p_content jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid := public.mcp_user(p_token); new_id uuid;
begin
  -- The reserved-name and free-plan triggers from 002 still apply here.
  insert into public.sites (user_id, name, slug, template, published, content)
  values (uid, left(p_name, 60), lower(p_slug), p_template, false, p_content)
  returning id into new_id;
  return jsonb_build_object('id', new_id, 'slug', lower(p_slug));
exception when unique_violation then
  raise exception 'That link is already taken. Try another slug.' using errcode = 'P0001';
end;
$$;

create or replace function public.mcp_set_published(p_token text, p_site uuid, p_published boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid := public.mcp_user(p_token);
begin
  update public.sites set published = p_published where id = p_site and user_id = uid;
  if not found then raise exception 'No site with that id on your account.' using errcode = 'P0001'; end if;
  return jsonb_build_object('ok', true, 'published', p_published);
end;
$$;

-- The connector route calls these with the public key; the link is the credential.
revoke all on function public.mcp_whoami(text) from public;
revoke all on function public.mcp_list_sites(text) from public;
revoke all on function public.mcp_get_site(text, uuid) from public;
revoke all on function public.mcp_save_site(text, uuid, jsonb) from public;
revoke all on function public.mcp_create_site(text, text, text, text, jsonb) from public;
revoke all on function public.mcp_set_published(text, uuid, boolean) from public;
grant execute on function public.mcp_whoami(text) to anon, authenticated;
grant execute on function public.mcp_list_sites(text) to anon, authenticated;
grant execute on function public.mcp_get_site(text, uuid) to anon, authenticated;
grant execute on function public.mcp_save_site(text, uuid, jsonb) to anon, authenticated;
grant execute on function public.mcp_create_site(text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.mcp_set_published(text, uuid, boolean) to anon, authenticated;
