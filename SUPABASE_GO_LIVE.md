# Robot Cafe Supabase Go-Live

This app is ready to use Supabase for durable menu, category, branch, reservation, feedback, QR analytics, and menu-photo storage.

## Required Supabase Values

Get these from the Robot Cafe Supabase project:

- Project ref, for example `abcdefghijklmnopqrst`
- Project URL, for example `https://abcdefghijklmnopqrst.supabase.co`
- Service role key, from Project Settings > API
- Database password, only needed if running migrations through the Supabase CLI

Never expose the service role key in browser code. It must only be a Vercel server environment variable.

## Link And Apply Migrations

```bash
supabase link --project-ref <project-ref>
supabase db push
```

The migration set creates:

- `branches`
- `categories`
- `menu_items`
- `menu_item_images`
- `menu_item_branch_availability`
- `feedback`
- `qr_scans`
- `reservations`
- `admin_users`
- `activity_logs`
- `system_settings`
- Supabase Storage bucket `robot-cafe-menu-images`

## Vercel Environment Variables

Set these in Production, Preview, and Development as needed:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_STORAGE_BUCKET=robot-cafe-menu-images
NEXT_PUBLIC_IMAGE_STORAGE_DRIVER=supabase
REQUIRE_SUPABASE_PERSISTENCE=true
ROBOT_ADMIN_EMAIL=admin@robotcafe.co.ke
ROBOT_ADMIN_PASSWORD=RobotCafe@2026
```

Optional reservation email:

```bash
RESEND_API_KEY=<resend-key>
RESERVATION_FROM_EMAIL=Robot Cafe <reservations@robotcafe.co.ke>
IMAARA_MALL_RESERVATION_EMAIL=<imaara-inbox>
LANA_PLAZA_RESERVATION_EMAIL=<lana-inbox>
REQUIRE_RESERVATION_EMAIL=false
```

## Verify

After migrations and Vercel env vars are set:

1. Redeploy Vercel production.
2. Log into `/admin`.
3. Create a category.
4. Create a menu item assigned to a branch.
5. Upload a menu photo.
6. Open `/menu/<branch-slug>` from a different browser/device.
7. Confirm the item and photo are visible.
8. Submit a reservation.
9. Confirm it appears in `/admin/reservations`.

If any save fails after `REQUIRE_SUPABASE_PERSISTENCE=true`, the app should show an error instead of pretending the save worked.
