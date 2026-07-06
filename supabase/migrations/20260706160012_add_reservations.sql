create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  branch_id text not null,
  branch_slug text not null,
  branch_name text not null,
  reservation_date date not null,
  reservation_time time not null,
  guests integer not null check (guests between 1 and 40),
  occasion text,
  notes text,
  status text not null default 'new' check (status in ('new', 'emailed', 'email_pending', 'email_failed', 'confirmed', 'cancelled', 'completed')),
  email_recipient text,
  email_status text not null default 'not_sent' check (email_status in ('not_sent', 'sent', 'not_configured', 'failed')),
  email_message text,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reservations_branch_date on public.reservations(branch_id, reservation_date desc);
create index if not exists idx_reservations_status_created on public.reservations(status, created_at desc);

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at before update on public.reservations
for each row execute function public.set_updated_at();

alter table public.reservations enable row level security;

drop policy if exists "Admins can manage reservations" on public.reservations;
create policy "Admins can manage reservations" on public.reservations
for all to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active))
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));
