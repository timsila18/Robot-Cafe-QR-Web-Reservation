import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ManagedImage, OptimizedImageBundle } from "@/lib/images/image-types";
import { dataUrlToServerBlob } from "@/lib/images/data-url";

const defaultBucket = "robot-cafe-menu-images";
const imageId = () => `image-${crypto.randomUUID()}`;

const extensionFor = (mimeType: string) => {
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("png")) return "png";
  return "jpg";
};

const safeName = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "menu-image";

const publicUrlFor = (bucket: string, path: string) => {
  const supabase = createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase storage is not configured.");
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

async function ensureBucket(bucket: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase storage is not configured.");

  const { error } = await supabase.storage.getBucket(bucket);
  if (!error) return supabase;

  const created = await supabase.storage.createBucket(bucket, {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    fileSizeLimit: 20 * 1024 * 1024,
  });

  if (created.error) {
    throw new Error(`Supabase image bucket is not ready: ${created.error.message}`);
  }

  return supabase;
}

async function uploadVariant(bucket: string, path: string, dataUrl: string, contentType: string) {
  const supabase = await ensureBucket(bucket);
  const blob = await dataUrlToServerBlob(dataUrl);
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    cacheControl: "31536000",
    contentType,
    upsert: true,
  });

  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return publicUrlFor(bucket, path);
}

export async function uploadSupabaseMenuImage(input: {
  fileName: string;
  bundle: OptimizedImageBundle;
  menuItemId?: string;
  sortOrder: number;
  isPrimary: boolean;
}): Promise<ManagedImage> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || defaultBucket;
  const id = imageId();
  const owner = input.menuItemId || "draft";
  const basePath = `menu-items/${owner}/${id}-${safeName(input.fileName)}`;
  const paths = {
    original: `${basePath}/original.${extensionFor(input.bundle.original.mimeType)}`,
    thumbnail: `${basePath}/thumbnail.webp`,
    card: `${basePath}/card.webp`,
    detail: `${basePath}/detail.webp`,
  };

  const [imageUrl, thumbnailUrl, cardUrl, detailUrl] = await Promise.all([
    uploadVariant(bucket, paths.original, input.bundle.original.url, input.bundle.original.mimeType),
    uploadVariant(bucket, paths.thumbnail, input.bundle.thumbnail.url, input.bundle.thumbnail.mimeType),
    uploadVariant(bucket, paths.card, input.bundle.card.url, input.bundle.card.mimeType),
    uploadVariant(bucket, paths.detail, input.bundle.detail.url, input.bundle.detail.mimeType),
  ]);

  return {
    id,
    menuItemId: input.menuItemId,
    imageUrl,
    thumbnailUrl,
    cardUrl,
    detailUrl,
    fileName: input.fileName,
    fileSize: input.bundle.card.fileSize,
    mimeType: input.bundle.card.mimeType,
    width: input.bundle.card.width,
    height: input.bundle.card.height,
    isPrimary: input.isPrimary,
    sortOrder: input.sortOrder,
    createdAt: new Date().toISOString(),
    storagePaths: paths,
    originalMetadata: input.bundle.metadata,
  };
}

export async function deleteSupabaseMenuImage(image: ManagedImage) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || defaultBucket;
  const supabase = createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase storage is not configured.");

  const paths = Object.values(image.storagePaths ?? {}).filter(Boolean);
  if (!paths.length) return;

  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw new Error(`Image delete failed: ${error.message}`);
}

