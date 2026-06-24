# Robot Cafe Image Storage Strategy

The demo uses `LocalStorageAdapter`, which stores optimized images as browser data URLs inside the menu item payload. This is temporary and suitable for Vercel preview demos because it requires no external bucket configuration.

To switch to Supabase Storage, Cloudinary, S3, or Firebase Storage later:

1. Implement the same `ImageStorageAdapter` contract in `image-storage.ts`.
2. Upload the generated `thumbnail`, `card`, `detail`, and optional original versions to the provider.
3. Return the provider URLs in the existing `ManagedImage` shape.
4. Change `activeImageStorageAdapter` to the production adapter.

The admin UI should not need workflow changes because it only calls `uploadImage`, `replaceImage`, `deleteImage`, and `getOptimizedImageUrl`.
