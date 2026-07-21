-- Run this once in your Supabase project's SQL editor (Database > SQL Editor).

create table if not exists ingredients (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  purchase_cost numeric not null,
  purchase_quantity numeric not null,
  purchase_unit text not null,
  notes text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists recipes (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  base_yield_quantity numeric not null,
  base_yield_label text not null,
  profit_percent numeric not null default 0,
  ingredient_lines jsonb not null default '[]',
  extra_costs jsonb not null default '[]',
  notes text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

-- Migration for projects created before profit_percent existed.
-- Safe to re-run: no-ops if the column is already present.
alter table recipes add column if not exists profit_percent numeric not null default 0;

-- If you already ran an earlier version of this file that added base_servings,
-- that column is now unused and harmless to leave. Drop it manually if you want:
-- alter table recipes drop column if exists base_servings;

-- Bakery v2 Phase 1: recipe category + automatic labour/electricity/wastage inputs.
-- All nullable/optional -- existing recipes keep costing exactly as before until
-- the owner fills these in on a per-recipe basis.
alter table recipes add column if not exists category text;
alter table recipes add column if not exists active_time_minutes numeric;
alter table recipes add column if not exists bake_time_minutes numeric;
alter table recipes add column if not exists oven_power_watts numeric;
alter table recipes add column if not exists wastage_percent_override numeric;

create table if not exists price_listing_variants (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  name text not null,
  group_names jsonb not null default '[]',
  multiplier numeric not null default 1,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

-- One settings row per user. Rates default to 0 so automatic labour/electricity
-- costs are 0 (no phantom cost) until the owner sets real rates; wastage
-- defaults to 3% per spec, shown as its own visible line on the cost breakdown.
create table if not exists business_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  labor_hourly_rate numeric not null default 0,
  electricity_rate_per_unit numeric not null default 0,
  oven_power_watts numeric not null default 1500,
  lpg_cost_per_hour numeric not null default 0,
  wastage_percent numeric not null default 3,
  default_markup_percent numeric not null default 0,
  currency_code text not null default 'INR',
  currency_symbol text not null default '₹',
  tax_percent numeric not null default 0,
  updated_at timestamptz not null
);

create table if not exists packaging_templates (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cost numeric not null,
  description text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists ingredients_user_id_idx on ingredients(user_id);
create index if not exists recipes_user_id_idx on recipes(user_id);
create index if not exists price_listing_variants_user_id_idx on price_listing_variants(user_id);
create index if not exists price_listing_variants_recipe_id_idx on price_listing_variants(recipe_id);
create index if not exists packaging_templates_user_id_idx on packaging_templates(user_id);

alter table ingredients enable row level security;
alter table recipes enable row level security;
alter table price_listing_variants enable row level security;
alter table business_settings enable row level security;
alter table packaging_templates enable row level security;

create policy "Users manage their own ingredients" on ingredients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own recipes" on recipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own price listing variants" on price_listing_variants
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own business settings" on business_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own packaging templates" on packaging_templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
