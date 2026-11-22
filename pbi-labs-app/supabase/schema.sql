-- Run this in the Supabase SQL editor.
-- Safe to run multiple times without overwriting existing data.
-- The Netlify functions use the service role, which bypasses RLS.
-- Authenticated Free users can only read/write their own row in user_vault.

create table if not exists public.licenses (
  license_key text primary key,
  email text,
  is_active boolean default true,
  status text default 'active',
  otp_hash text,
  otp_expiry timestamptz,
  otp_sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.licenses add column if not exists email text;
alter table public.licenses add column if not exists is_active boolean default true;
alter table public.licenses add column if not exists status text default 'active';
alter table public.licenses add column if not exists otp_hash text;
alter table public.licenses add column if not exists otp_expiry timestamptz;
alter table public.licenses add column if not exists otp_sent_at timestamptz;
alter table public.licenses add column if not exists updated_at timestamptz default now();

create table if not exists public.device_seats (
  id bigint generated always as identity primary key,
  license_key text not null,
  email text,
  device_id text not null,
  last_ping timestamptz default now(),
  last_seen timestamptz default now(),
  unique (license_key, device_id)
);

alter table public.device_seats add column if not exists email text;
alter table public.device_seats add column if not exists last_ping timestamptz default now();
alter table public.device_seats add column if not exists last_seen timestamptz default now();

create table if not exists public.payment_reminders (
  id bigint generated always as identity primary key,
  email text not null,
  item_key text not null,
  name text,
  amount numeric,
  next_date date,
  kind text default 'liability',
  tone text default 'direct',
  lead_days integer default 1,
  language text default 'en',
  last_notified_on date,
  unique (email, item_key)
);

create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  email text not null,
  endpoint text not null unique,
  subscription jsonb not null,
  tone text default 'direct',
  lead_days integer default 1,
  language text default 'en',
  updated_at timestamptz default now()
);

create table if not exists public.user_vault (
  user_id uuid primary key references auth.users(id) on delete cascade,
  incomes jsonb not null default '[]'::jsonb,
  expenses jsonb not null default '[]'::jsonb,
  assets jsonb not null default '[]'::jsonb,
  liabilities jsonb not null default '[]'::jsonb,
  vision_board jsonb not null default '[]'::jsonb,
  life_list jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

alter table public.user_vault add column if not exists incomes jsonb not null default '[]'::jsonb;
alter table public.user_vault add column if not exists expenses jsonb not null default '[]'::jsonb;
alter table public.user_vault add column if not exists assets jsonb not null default '[]'::jsonb;
alter table public.user_vault add column if not exists liabilities jsonb not null default '[]'::jsonb;
alter table public.user_vault add column if not exists vision_board jsonb not null default '[]'::jsonb;
alter table public.user_vault add column if not exists life_list jsonb not null default '[]'::jsonb;
alter table public.user_vault add column if not exists updated_at timestamptz default now();

alter table public.licenses enable row level security;
alter table public.device_seats enable row level security;
alter table public.payment_reminders enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.user_vault enable row level security;

drop policy if exists "Users can read own vault" on public.user_vault;
create policy "Users can read own vault"
  on public.user_vault for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own vault" on public.user_vault;
create policy "Users can insert own vault"
  on public.user_vault for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own vault" on public.user_vault;
create policy "Users can update own vault"
  on public.user_vault for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);