-- ============================================================
-- Run this entire file in Supabase → SQL Editor
-- ============================================================

-- 1. Profiles ─────────────────────────────────────────────────
create table if not exists profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null unique,
  username          text unique not null,
  display_name      text,
  bio               text,
  avatar_url        text default '',
  background_color  text not null default '#7c3aed',
  button_style      text not null default 'pill'
                      check (button_style in ('pill', 'rounded', 'square')),
  button_color      text not null default '#ffffff',
  button_text_color text not null default '#1f2937',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 2. Links ─────────────────────────────────────────────────────
create table if not exists links (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  url        text not null,
  "order"    integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Row Level Security ────────────────────────────────────────
alter table profiles enable row level security;
alter table links    enable row level security;

-- Profiles: anyone can read, only owner can write
create policy "profiles_select" on profiles
  for select using (true);

create policy "profiles_insert" on profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update" on profiles
  for update using (auth.uid() = user_id);

-- Links: everyone sees active links; owner sees all
create policy "links_select" on links
  for select using (is_active = true or auth.uid() = user_id);

create policy "links_insert" on links
  for insert with check (auth.uid() = user_id);

create policy "links_update" on links
  for update using (auth.uid() = user_id);

create policy "links_delete" on links
  for delete using (auth.uid() = user_id);

-- 4. Storage bucket for avatars ────────────────────────────────
-- NOTE: Go to Storage → New bucket and create "avatars" (public),
-- or uncomment the lines below if the storage extension is enabled:

-- insert into storage.buckets (id, name, public)
--   values ('avatars', 'avatars', true)
--   on conflict (id) do nothing;

-- create policy "avatars_select" on storage.objects
--   for select using (bucket_id = 'avatars');

-- create policy "avatars_insert" on storage.objects
--   for insert with check (
--     bucket_id = 'avatars'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );

-- create policy "avatars_update" on storage.objects
--   for update using (
--     bucket_id = 'avatars'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );

-- create policy "avatars_delete" on storage.objects
--   for delete using (
--     bucket_id = 'avatars'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );

-- 5. Optional: disable email confirmation for easier dev ────────
-- In Supabase dashboard → Authentication → Settings →
-- disable "Enable email confirmations"
