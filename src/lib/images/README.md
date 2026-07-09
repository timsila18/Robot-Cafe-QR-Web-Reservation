# Robot Cafe Image Storage Strategy

The production recommendation for Robot Cafe is `IMAGE_STORAGE_DRIVER=cpanel`, which stores optimized menu images in the existing cPanel hosting account while keeping only image metadata and URLs in Supabase.

cPanel setup:

1. In cPanel, create a restricted API token.
2. Create `public_html/qr-menu-images`.
3. Set `CPANEL_API_BASE`, `CPANEL_USERNAME`, `CPANEL_API_TOKEN`, `CPANEL_UPLOAD_DIR`, and `CPANEL_PUBLIC_BASE_URL` in Vercel.
4. Set both `IMAGE_STORAGE_DRIVER=cpanel` and `NEXT_PUBLIC_IMAGE_STORAGE_DRIVER=cpanel`.

The demo/local fallback uses `LocalStorageAdapter`, which stores optimized images as browser data URLs inside the menu item payload. This is only for preview demos because it is not durable.

To switch to Supabase Storage, Cloudinary, S3, or Firebase Storage later:

1. Implement the same `ImageStorageAdapter` contract in `image-storage.ts`.
2. Upload the generated `thumbnail`, `card`, `detail`, and optional original versions to the provider.
3. Return the provider URLs in the existing `ManagedImage` shape.
4. Change `activeImageStorageAdapter` to the production adapter.

The admin UI should not need workflow changes because it only calls `uploadImage`, `replaceImage`, `deleteImage`, and `getOptimizedImageUrl`.
