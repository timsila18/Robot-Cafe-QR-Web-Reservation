create extension if not exists pgcrypto;

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  location text not null,
  phone text,
  email text,
  opening_hours jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  short_description text,
  price numeric(12, 2) not null check (price >= 0),
  preparation_time integer check (preparation_time is null or preparation_time >= 0),
  ingredients text[] not null default '{}',
  allergens text[] not null default '{}',
  calories integer check (calories is null or calories >= 0),
  category_id uuid not null references public.categories(id) on delete restrict,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_new_arrival boolean not null default false,
  is_active boolean not null default true,
  is_sold_out boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_item_images (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.menu_item_branch_availability (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (menu_item_id, branch_id)
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  branch_id uuid references public.branches(id) on delete set null,
  rating integer check (rating between 1 and 5),
  comment text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved', 'archived')),
  created_at timestamptz not null default now()
);

create table public.qr_scans (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete set null,
  device text,
  browser text,
  scan_timestamp timestamptz not null default now(),
  page text not null,
  country text,
  city text
);

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null default 'manager' check (role in ('owner', 'manager', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  user_name text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_menu_items_category_id on public.menu_items(category_id);
create index idx_menu_items_flags on public.menu_items(is_active, is_sold_out, is_featured);
create index idx_menu_item_branch_availability_item on public.menu_item_branch_availability(menu_item_id);
create index idx_menu_item_branch_availability_branch on public.menu_item_branch_availability(branch_id);
create index idx_feedback_branch_status on public.feedback(branch_id, status);
create index idx_qr_scans_branch_time on public.qr_scans(branch_id, scan_timestamp desc);
create index idx_activity_logs_created_at on public.activity_logs(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger branches_set_updated_at before update on public.branches
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

create trigger menu_items_set_updated_at before update on public.menu_items
for each row execute function public.set_updated_at();

create trigger admin_users_set_updated_at before update on public.admin_users
for each row execute function public.set_updated_at();

alter table public.branches enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_item_images enable row level security;
alter table public.menu_item_branch_availability enable row level security;
alter table public.feedback enable row level security;
alter table public.qr_scans enable row level security;
alter table public.admin_users enable row level security;
alter table public.activity_logs enable row level security;

create policy "Public can read active branches" on public.branches
for select to anon, authenticated
using (is_active = true);

create policy "Public can read active categories" on public.categories
for select to anon, authenticated
using (is_active = true);

create policy "Public can read active menu items" on public.menu_items
for select to anon, authenticated
using (is_active = true);

create policy "Public can read menu images" on public.menu_item_images
for select to anon, authenticated
using (true);

create policy "Public can read available branch mapping" on public.menu_item_branch_availability
for select to anon, authenticated
using (is_available = true);

create policy "Public can create feedback" on public.feedback
for insert to anon, authenticated
with check (true);

create policy "Public can create qr scans" on public.qr_scans
for insert to anon, authenticated
with check (true);

create policy "Admins can manage branches" on public.branches
for all to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active))
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));

create policy "Admins can manage categories" on public.categories
for all to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active))
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));

create policy "Admins can manage menu items" on public.menu_items
for all to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active))
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));

create policy "Admins can manage menu images" on public.menu_item_images
for all to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active))
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));

create policy "Admins can manage branch availability" on public.menu_item_branch_availability
for all to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active))
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));

create policy "Admins can read feedback" on public.feedback
for select to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));

create policy "Admins can read qr scans" on public.qr_scans
for select to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));

create policy "Admins can read admin users" on public.admin_users
for select to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));

create policy "Admins can read activity logs" on public.activity_logs
for select to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));

insert into public.branches (name, slug, location, phone, email, opening_hours)
values
  ('Robot Cafe - Imaara Mall', 'imaara-mall', 'Imaara Mall, Nairobi', '+254 700 000 101', 'imaara@robotcafe.co.ke', '{"daily":"8:00 AM - 10:00 PM"}'),
  ('Robot Cafe - Lana Plaza', 'lana-plaza', 'Lana Plaza, Nairobi', '+254 700 000 202', 'lana@robotcafe.co.ke', '{"daily":"8:00 AM - 10:00 PM"}')
on conflict (slug) do nothing;

insert into public.categories (name, slug, description, sort_order)
values
  ('Breakfast', 'breakfast', 'Morning signatures and light plates.', 1),
  ('Lunch', 'lunch', 'Midday mains and executive plates.', 2),
  ('Dinner', 'dinner', 'Evening mains and premium plates.', 3),
  ('Pizza', 'pizza', 'Fresh-baked pizza selections.', 4),
  ('Burgers', 'burgers', 'House burgers and handhelds.', 5),
  ('Coffee', 'coffee', 'Espresso and brewed coffee.', 6),
  ('Tea', 'tea', 'Tea rituals and infusions.', 7),
  ('Desserts', 'desserts', 'Sweet finishes.', 8),
  ('Sushi', 'sushi', 'Sushi and rolls.', 9),
  ('Cocktails', 'cocktails', 'Premium cocktails.', 10),
  ('Mocktails', 'mocktails', 'Alcohol-free signatures.', 11),
  ('Salads', 'salads', 'Fresh salads and bowls.', 12)
on conflict (slug) do nothing;
