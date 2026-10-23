-- Price Tracker initial schema preparation (not applied to a live database).
-- Review and add role-aware policies before connecting application writes.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'user' check (role in ('super_admin', 'app_admin', 'user')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_units (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  base_unit text not null,
  specification text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  supplier_type text not null check (supplier_type in ('local', 'overseas')),
  country text not null default '',
  default_currency text not null check (default_currency in ('BDT', 'USD', 'EUR', 'CNY', 'INR')),
  contact_name text,
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.price_records (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete restrict,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  company_unit_id uuid not null references public.company_units(id) on delete restrict,
  effective_date date not null,
  unit_price numeric(18, 6) not null check (unit_price > 0),
  currency text not null check (currency in ('BDT', 'USD', 'EUR', 'CNY', 'INR')),
  measurement_unit text not null,
  exchange_rate_to_bdt numeric(18, 8) check (exchange_rate_to_bdt > 0),
  exchange_rate_date date,
  exchange_rate_source text,
  remarks text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_record_foreign_currency_rate check (currency = 'BDT' or exchange_rate_to_bdt is not null),
  constraint price_record_duplicate_key unique (item_id, supplier_id, company_unit_id, effective_date)
);

create index if not exists price_records_item_date_idx on public.price_records (item_id, effective_date desc);
create index if not exists price_records_supplier_date_idx on public.price_records (supplier_id, effective_date desc);
create index if not exists price_records_unit_date_idx on public.price_records (company_unit_id, effective_date desc);

create table if not exists public.price_suggestions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete restrict,
  price_record_id uuid references public.price_records(id) on delete set null,
  effective_date date,
  details text not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewer_response text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists price_suggestions_status_date_idx on public.price_suggestions (status, created_at desc);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

-- RLS is enabled so tables deny access until reviewed policies are added.
alter table public.profiles enable row level security;
alter table public.company_units enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.suppliers enable row level security;
alter table public.price_records enable row level security;
alter table public.price_suggestions enable row level security;
alter table public.audit_events enable row level security;

-- TODO before production: add role-aware policies and updated_at triggers.
-- Never expose a service-role key in browser code.
