drop policy if exists "Public can create feedback" on public.feedback;
create policy "Public can create feedback" on public.feedback
for insert to anon, authenticated
with check (
  status = 'new'
  and length(trim(comment)) between 3 and 1200
  and (rating is null or rating between 1 and 5)
  and (phone is null or length(trim(phone)) between 5 and 40)
  and (email is null or email = '' or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

drop policy if exists "Public can create qr scans" on public.qr_scans;
create policy "Public can create qr scans" on public.qr_scans
for insert to anon, authenticated
with check (
  length(trim(page)) between 1 and 240
  and scan_timestamp <= now() + interval '5 minutes'
  and (session_id is null or length(session_id) <= 160)
  and (route is null or length(route) <= 240)
  and (device_type is null or length(device_type) <= 120)
  and (browser is null or length(browser) <= 120)
  and (os is null or length(os) <= 120)
);
