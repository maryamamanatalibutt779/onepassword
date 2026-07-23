-- ============================================
-- Secure Password Manager — Database Schema
-- ============================================
-- Run this in the Supabase Dashboard: SQL Editor → New Query → paste → Run
-- This script is idempotent — safe to run multiple times.

-- 1. Create the passwords table
create table if not exists public.passwords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  site_name text not null,
  site_url text,
  username text not null,
  encrypted_password text not null,
  iv text not null,
  tag text not null default 'Personal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Index to speed up lookups by user
create index if not exists passwords_user_id_idx on public.passwords(user_id);

-- 3. Enable Row Level Security (RLS)
-- This ensures a user can only ever read/write their OWN rows,
-- enforced by the database itself — not just by app code.
alter table public.passwords enable row level security;

-- 4. Policies: one per operation, all scoped to the logged-in user
drop policy if exists "Users can view their own passwords" on public.passwords;
create policy "Users can view their own passwords"
  on public.passwords for select
  using (auth.uid() = user_id);
  

drop policy if exists "Users can insert their own passwords" on public.passwords;
create policy "Users can insert their own passwords"
  on public.passwords for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own passwords" on public.passwords;
create policy "Users can update their own passwords"
  on public.passwords for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own passwords" on public.passwords;
create policy "Users can delete their own passwords"
  on public.passwords for delete
  using (auth.uid() = user_id);

-- 5. Auto-update the `updated_at` column on every change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_passwords_updated_at on public.passwords;
create trigger set_passwords_updated_at
  before update on public.passwords
  for each row
  execute function public.set_updated_at();

-- 6. Ensure `tag` column exists on pre-existing tables (safe no-op on fresh installs)
alter table public.passwords
  add column if not exists tag text not null default 'Personal';

-- ============================================
-- 7. Shared links — temporary, expiring share links for individual passwords
-- ============================================
create table if not exists public.shared_links (
  id          uuid primary key default gen_random_uuid(),
  token       uuid not null unique default gen_random_uuid(),
  password_id uuid not null references public.passwords(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  expires_at  timestamptz not null default (now() + interval '24 hours'),
  view_count  int not null default 0,
  max_views   int not null default 10,
  created_at  timestamptz not null default now()
);

alter table public.shared_links enable row level security;

drop policy if exists "Users can manage their own share links" on public.shared_links;
create policy "Users can manage their own share links"
  on public.shared_links for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);