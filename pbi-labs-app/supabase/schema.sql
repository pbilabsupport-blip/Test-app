-- Run this in the Supabase SQL editor before deploying the security update.
-- The Netlify functions use the service role, which bypasses RLS.
-- The anon key used by the website has no policies here, so it cannot read
-- licenses, seats, reminders, or push subscriptions.

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

alter table public.licenses enable row level security;
alter table public.device_seats enable row level security;
alter table public.payment_reminders enable row level security;
alter table public.push_subscriptions enable row level security;
