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
  base_servings numeric,
  profit_percent numeric not null default 0,
  ingredient_lines jsonb not null default '[]',
  extra_costs jsonb not null default '[]',
  notes text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

-- Migration for projects created before base_servings/profit_percent existed.
-- Safe to re-run: no-ops if the columns are already present.
alter table recipes add column if not exists base_servings numeric;
alter table recipes add column if not exists profit_percent numeric not null default 0;

create index if not exists ingredients_user_id_idx on ingredients(user_id);
create index if not exists recipes_user_id_idx on recipes(user_id);

alter table ingredients enable row level security;
alter table recipes enable row level security;

create policy "Users manage their own ingredients" on ingredients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own recipes" on recipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
