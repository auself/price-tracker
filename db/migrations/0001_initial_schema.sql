-- Price Tracker / Neon PostgreSQL initial schema
-- Apply only to the intended Neon database after reviewing the SQL.
-- This migration intentionally does not create authentication credentials or expose DB access to browsers.

create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_provider_id text unique,
  email text not null unique,
  display_name text not null default '',
  role text not null default 'user' check (role in ('super_admin', 'app_admin', 'user')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists company_units (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null unique,
  parent_id uuid references categories(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  category_id uuid references categories(id) on delete set null,
  base_unit text not null,
  specification text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists suppliers (
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

create table if not exists price_records (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete restrict,
  supplier_id uuid not null references suppliers(id) on delete restrict,
  company_unit_id uuid not null references company_units(id) on delete restrict,
  effective_date date not null,
  unit_price numeric(18, 6) not null check (unit_price > 0),
  currency text not null check (currency in ('BDT', 'USD', 'EUR', 'CNY', 'INR')),
  measurement_unit text not null,
  exchange_rate_to_bdt numeric(18, 8) check (exchange_rate_to_bdt > 0),
  exchange_rate_date date,
  exchange_rate_source text,
  remarks text not null default '',
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_record_foreign_currency_rate check (currency = 'BDT' or exchange_rate_to_bdt is not null),
  constraint price_record_duplicate_key unique (item_id, supplier_id, company_unit_id, effective_date)
);

create index if not exists price_records_item_date_idx on price_records (item_id, effective_date desc);
create index if not exists price_records_supplier_date_idx on price_records (supplier_id, effective_date desc);
create index if not exists price_records_unit_date_idx on price_records (company_unit_id, effective_date desc);

create table if not exists price_suggestions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete restrict,
  price_record_id uuid references price_records(id) on delete set null,
  effective_date date,
  details text not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  submitted_by uuid references app_users(id) on delete set null,
  reviewed_by uuid references app_users(id) on delete set null,
  reviewer_response text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists price_suggestions_status_date_idx on price_suggestions (status, created_at desc);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references app_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_entity_idx on audit_events (entity_type, entity_id, created_at desc);
