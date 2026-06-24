alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('super_admin', 'general_manager', 'branch_manager', 'content_manager', 'owner', 'manager', 'editor'));

alter table public.admin_users
  add column if not exists branch_id uuid references public.branches(id) on delete set null,
  add column if not exists last_login_at timestamptz,
  add column if not exists deactivated_at timestamptz;

alter table public.activity_logs
  add column if not exists role text,
  add column if not exists branch_id uuid references public.branches(id) on delete set null,
  add column if not exists ip_address text,
  add column if not exists user_agent text,
  add column if not exists old_value jsonb,
  add column if not exists new_value jsonb;

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.system_settings enable row level security;

create policy "Admins can manage system settings" on public.system_settings
for all to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active))
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()) and au.is_active));

create trigger system_settings_set_updated_at before update on public.system_settings
for each row execute function public.set_updated_at();

create index if not exists idx_admin_users_role_branch on public.admin_users(role, branch_id);
create index if not exists idx_activity_logs_action_created on public.activity_logs(action, created_at desc);

comment on table public.system_settings is
  'Robot Cafe platform configuration for branding, security, feature flags, analytics, and deployment-ready settings.';
