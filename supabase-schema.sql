-- Run this entire file in your Supabase project's SQL Editor
-- (Supabase dashboard -> SQL Editor -> New query -> paste this -> Run)

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'grocery',
  unit text not null default 'kg',
  price numeric not null default 0,
  min_qty numeric not null default 1,
  step numeric not null default 1,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  items jsonb not null,
  total numeric not null,
  status text not null default 'New',
  created_at timestamptz default now()
);

alter table products enable row level security;
alter table orders enable row level security;

-- MVP-simple policies: your Next.js backend uses the secret service key,
-- so these public policies are a safety net, not your main protection.
create policy "public read products" on products for select using (true);
create policy "public read orders" on orders for select using (true);

-- seed a few starter products so the app isn't empty on first load
insert into products (name, category, unit, price, min_qty, step) values
  ('Sona Masoori Rice', 'grocery', 'kg', 52, 5, 5),
  ('Toor Dal', 'grocery', 'kg', 128, 2, 1),
  ('Groundnut Oil', 'grocery', 'L', 168, 1, 1),
  ('Surf Detergent', 'fmcg', 'kg', 62, 1, 1),
  ('Tea Powder', 'fmcg', 'kg', 340, 1, 1),
  ('LED Bulb 9W (4pk)', 'electronics', 'pack', 220, 1, 1);
