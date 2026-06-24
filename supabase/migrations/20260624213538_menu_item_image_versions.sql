alter table public.menu_item_images
  add column if not exists thumbnail_url text,
  add column if not exists card_url text,
  add column if not exists detail_url text,
  add column if not exists file_name text,
  add column if not exists file_size bigint not null default 0,
  add column if not exists mime_type text,
  add column if not exists width integer not null default 0,
  add column if not exists height integer not null default 0;

comment on table public.menu_item_images is
  'Stores image version URLs for Robot Cafe menu items. Demo uses local data URLs; production adapters can map these columns to Supabase Storage, Cloudinary, S3, or Firebase URLs.';

create index if not exists idx_menu_item_images_item_order on public.menu_item_images(menu_item_id, sort_order);
