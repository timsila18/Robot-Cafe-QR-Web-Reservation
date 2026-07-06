Robot Cafe Digital Dining Platform

Premium QR dining, menu management, feedback, QR analytics, image optimization, RBAC administration, and deployment-ready operations software for Robot Cafe.

## Production Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready migrations
- Vercel deployment configuration

## Local Development

```bash
npm install
npm run dev
```

Default demo admin:

- Email: `admin@robotcafe.co.ke`
- Password: `RobotCafe@2026`

## Environment Variables

```bash
ROBOT_ADMIN_EMAIL=admin@robotcafe.co.ke
ROBOT_ADMIN_PASSWORD=RobotCafe@2026
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=robot-cafe-menu-images
NEXT_PUBLIC_IMAGE_STORAGE_DRIVER=auto
```

`NEXT_PUBLIC_IMAGE_STORAGE_DRIVER=auto` tries the production Supabase Storage upload API first and falls back to local demo data URLs if Supabase is not configured. Use `supabase` to require production storage, or `local` for offline demos.

## Production Photo Storage

Menu uploads are optimized in the browser before upload. The production API stores the optimized versions in Supabase Storage:

- `thumbnail` for admin/media thumbnails
- `card` for menu cards
- `detail` for item detail galleries
- original file metadata for future audits/imports

The default bucket is `robot-cafe-menu-images`. With `NEXT_PUBLIC_IMAGE_STORAGE_DRIVER=supabase`, failed storage configuration blocks uploads instead of silently using demo storage. Existing Robot Cafe hosted image URLs can still be pasted into the admin media library and saved against menu items, which gives the team a migration path for photos already paid for on the current QR site.

## Go-Live Order

1. Configure Supabase project env vars on Vercel.
2. Confirm menu photo uploads create public Supabase Storage URLs.
3. Reuse/import existing Robot Cafe hosted photos through the admin media library or a later batch import script.
4. Verify admin login, menu edits, branch QR routes, feedback, and mobile menu.
5. Point `qr.robotcafe.co.ke` to Vercel only after storage and admin workflows pass.

## Admin Routes

- `/admin`
- `/admin/menu`
- `/admin/categories`
- `/admin/branches`
- `/admin/users`
- `/admin/feedback`
- `/admin/analytics`
- `/admin/qr-codes`
- `/admin/audit-logs`
- `/admin/settings`

## Security

Admin pages and `/api/admin/*` are protected by middleware. Role permissions are centralized in `src/lib/rbac.ts`. Security headers are configured in `next.config.ts` and `vercel.json`.

## Deploy

```bash
npm run build
vercel --prod --yes
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
