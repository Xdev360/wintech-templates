-- Run this in Supabase: SQL Editor → New query → Run.
-- Safe to run once on a new project.

create extension if not exists "pgcrypto";

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  name text not null,
  template text not null default 'landing',
  custom_domain text,
  published boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sites_slug_format check (slug ~ '^[a-z0-9]([a-z0-9-]{1,46}[a-z0-9])$'),
  constraint sites_slug_unique unique (slug),
  constraint sites_custom_domain_unique unique (custom_domain)
);

create index if not exists sites_user_id_idx on public.sites (user_id);
create index if not exists sites_published_slug_idx on public.sites (slug) where published = true;

create or replace function public.touch_sites_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sites_updated_at on public.sites;
create trigger sites_updated_at
  before update on public.sites
  for each row execute function public.touch_sites_updated_at();

alter table public.sites enable row level security;

drop policy if exists "Owners manage their sites" on public.sites;
create policy "Owners manage their sites"
  on public.sites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Anyone can read published sites" on public.sites;
create policy "Anyone can read published sites"
  on public.sites
  for select
  using (published = true);

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

drop policy if exists "Owners upload site media" on storage.objects;
create policy "Owners upload site media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'site-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Owners update site media" on storage.objects;
create policy "Owners update site media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'site-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Owners delete site media" on storage.objects;
create policy "Owners delete site media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'site-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Public read site media" on storage.objects;
create policy "Public read site media"
  on storage.objects
  for select
  using (bucket_id = 'site-media');
