alter table public.reservations
  drop constraint if exists reservations_status_check;

alter table public.reservations
  add constraint reservations_status_check
  check (status in ('new', 'emailed', 'email_pending', 'email_failed', 'confirmed', 'cancelled', 'completed', 'expired'));

alter table public.feedback
  drop constraint if exists feedback_status_check;

alter table public.feedback
  add constraint feedback_status_check
  check (status in ('new', 'reviewed', 'resolved', 'archived'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'robot-cafe-menu-images',
  'robot-cafe-menu-images',
  true,
  20971520,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read Robot Cafe menu images" on storage.objects;
create policy "Public can read Robot Cafe menu images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'robot-cafe-menu-images');

drop policy if exists "Service role can manage Robot Cafe menu images" on storage.objects;
create policy "Service role can manage Robot Cafe menu images"
on storage.objects for all
to service_role
using (bucket_id = 'robot-cafe-menu-images')
with check (bucket_id = 'robot-cafe-menu-images');

grant usage on schema public to anon, authenticated, service_role;
grant select on public.branches to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.menu_items to anon, authenticated;
grant select on public.menu_item_images to anon, authenticated;
grant select on public.menu_item_branch_availability to anon, authenticated;
grant insert on public.feedback to anon, authenticated;
grant insert on public.qr_scans to anon, authenticated;
grant insert on public.reservations to anon, authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
