-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CLEANUP: Drop existing objects to ensure a fresh start (as requested: "limpar")
-- Warning: This deletes data in these specific tables.
drop table if exists public.finance_transactions cascade;
drop table if exists public.finance_categories cascade;
drop table if exists public.finance_accounts cascade;
drop table if exists public.user_modules cascade;
drop table if exists public.modules cascade;
drop table if exists public.api_keys cascade;
drop table if exists public.profiles cascade;

-- Drop triggers on auth.users if they exist to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;

-- 1. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  phone text,
  avatar_url text,
  setup_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- 2. API KEYS (For n8n Agent)
create table public.api_keys (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  key_hash text not null, -- Store hash, not raw key
  label text not null,
  last_used_at timestamptz,
  created_at timestamptz default now()
);
alter table public.api_keys enable row level security;

-- 3. MODULES (System-wide definition)
create table public.modules (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null, -- e.g., 'finance', 'nutrition'
  name text not null,
  description text,
  is_active_default boolean default false,
  created_at timestamptz default now()
);
alter table public.modules enable row level security;

-- 4. USER MODULES (Activation)
create table public.user_modules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  module_id uuid references public.modules(id) on delete cascade not null,
  status text check (status in ('active', 'inactive', 'expired')) default 'active',
  expiration_date timestamptz,
  created_at timestamptz default now(),
  unique(user_id, module_id)
);
alter table public.user_modules enable row level security;

-- 5. FINANCE: ACCOUNTS
create table public.finance_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text check (type in ('bank', 'wallet', 'investment', 'other')) not null,
  balance numeric(15, 2) default 0.00,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.finance_accounts enable row level security;

-- 6. FINANCE: CATEGORIES
create table public.finance_categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  icon text, -- Emoji or icon name
  type text check (type in ('income', 'expense')) not null,
  color text,
  created_at timestamptz default now()
);
alter table public.finance_categories enable row level security;

-- 7. FINANCE: TRANSACTIONS
create table public.finance_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_id uuid references public.finance_accounts(id) on delete set null,
  category_id uuid references public.finance_categories(id) on delete set null,
  amount numeric(15, 2) not null,
  description text,
  date timestamptz default now(),
  is_paid boolean default true,
  type text check (type in ('income', 'expense', 'transfer')) not null,
  n8n_metadata jsonb, -- Context from AI
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.finance_transactions enable row level security;

-- RLS POLICIES ------------------------------------------------

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- API Keys
create policy "Users can manage own api keys" on public.api_keys
  for all using (auth.uid() = user_id);

-- Modules
create policy "Authenticated users can view modules" on public.modules
  for select to authenticated using (true);

-- User Modules
create policy "Users can manage own modules" on public.user_modules
  for all using (auth.uid() = user_id);

-- Finance Tables
create policy "Users manage own accounts" on public.finance_accounts
  for all using (auth.uid() = user_id);

create policy "Users manage own categories" on public.finance_categories
  for all using (auth.uid() = user_id);

create policy "Users manage own transactions" on public.finance_transactions
  for all using (auth.uid() = user_id);

-- TRIGGERS ----------------------------------------------------

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: on_auth_user_created
-- Note: We already dropped it at the top if it existed.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop existing update triggers if they exist (though dropping tables usually handles this, it's safe to be explicit if we reused tables, but here we dropped tables)
-- Since we dropped the tables, the triggers on them are gone. We just recreate them.

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure update_updated_at_column();

create trigger update_accounts_updated_at
  before update on public.finance_accounts
  for each row execute procedure update_updated_at_column();

create trigger update_transactions_updated_at
  before update on public.finance_transactions
  for each row execute procedure update_updated_at_column();

-- 8. AUTH CODES (Custom OTP)
create table public.auth_codes (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
-- Only service_role should access this table (backend logic)
alter table public.auth_codes enable row level security;

