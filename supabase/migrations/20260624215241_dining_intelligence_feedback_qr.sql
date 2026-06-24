alter table public.feedback
  add column if not exists food_rating integer check (food_rating is null or food_rating between 1 and 5),
  add column if not exists service_rating integer check (service_rating is null or service_rating between 1 and 5),
  add column if not exists ambience_rating integer check (ambience_rating is null or ambience_rating between 1 and 5),
  add column if not exists overall_rating integer check (overall_rating is null or overall_rating between 1 and 5),
  add column if not exists archived_at timestamptz,
  add column if not exists reviewed_at timestamptz;

update public.feedback
set
  food_rating = coalesce(food_rating, rating),
  service_rating = coalesce(service_rating, rating),
  ambience_rating = coalesce(ambience_rating, rating),
  overall_rating = coalesce(overall_rating, rating)
where rating is not null;

alter table public.qr_scans
  add column if not exists route text,
  add column if not exists device_type text,
  add column if not exists os text,
  add column if not exists session_id text,
  add column if not exists referrer text,
  add column if not exists item_id text,
  add column if not exists category_id text,
  add column if not exists search_query text;

create index if not exists idx_feedback_created_status on public.feedback(created_at desc, status);
create index if not exists idx_feedback_ratings on public.feedback(overall_rating, food_rating, service_rating, ambience_rating);
create index if not exists idx_qr_scans_session on public.qr_scans(session_id);
create index if not exists idx_qr_scans_route_time on public.qr_scans(route, scan_timestamp desc);

comment on table public.feedback is
  'Robot Cafe guest feedback with food, service, ambience, and overall ratings. Demo routes use local storage until Supabase writes are enabled.';

comment on table public.qr_scans is
  'Robot Cafe QR and customer telemetry events including route, device, browser, OS, session, item, category, and search context.';
