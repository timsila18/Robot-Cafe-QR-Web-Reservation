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
```

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
