alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('super_admin', 'general_manager', 'branch_manager', 'content_manager', 'hostess', 'owner', 'manager', 'editor'));
