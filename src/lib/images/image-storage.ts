import type { ImageStorageAdapter, ManagedImage, OptimizedImageBundle } from "@/lib/images/image-types";
import { getOptimizedImageUrl } from "@/lib/images/image-utils";

const imageId = () => `image-${crypto.randomUUID()}`;

export class LocalStorageAdapter implements ImageStorageAdapter {
  name = "temporary-local-demo";

  async uploadImage(input: {
    file: File;
    bundle: OptimizedImageBundle;
    menuItemId?: string;
    sortOrder: number;
    isPrimary: boolean;
  }): Promise<ManagedImage> {
    return {
      id: imageId(),
      menuItemId: input.menuItemId,
      imageUrl: input.bundle.original.url,
      thumbnailUrl: input.bundle.thumbnail.url,
      cardUrl: input.bundle.card.url,
      detailUrl: input.bundle.detail.url,
      fileName: input.file.name,
      fileSize: input.bundle.card.fileSize,
      mimeType: input.bundle.card.mimeType,
      width: input.bundle.card.width,
      height: input.bundle.card.height,
      isPrimary: input.isPrimary,
      sortOrder: input.sortOrder,
      createdAt: new Date().toISOString(),
      originalMetadata: input.bundle.metadata,
    };
  }

  async deleteImage(image: ManagedImage) {
    void image;
    return Promise.resolve();
  }

  async replaceImage(image: ManagedImage, file: File, bundle: OptimizedImageBundle): Promise<ManagedImage> {
    return {
      ...image,
      imageUrl: bundle.original.url,
      thumbnailUrl: bundle.thumbnail.url,
      cardUrl: bundle.card.url,
      detailUrl: bundle.detail.url,
      fileName: file.name,
      fileSize: bundle.card.fileSize,
      mimeType: bundle.card.mimeType,
      width: bundle.card.width,
      height: bundle.card.height,
      createdAt: new Date().toISOString(),
      originalMetadata: bundle.metadata,
    };
  }

  getOptimizedImageUrl = getOptimizedImageUrl;
}

export class FutureSupabaseStorageAdapter extends LocalStorageAdapter {
  name = "future-supabase-storage";
  // Production switch point: upload each optimized Blob/Data URL to a Supabase
  // Storage bucket, then return the public or signed URLs in the same ManagedImage
  // shape. The admin UI will not need to change.
}

export class FutureCloudinaryAdapter extends LocalStorageAdapter {
  name = "future-cloudinary";
  // Production switch point: send originals to Cloudinary, request eager
  // transformations for thumbnail/card/detail, and map the resulting URLs into
  // ManagedImage. The admin workflow can keep using uploadImage/replaceImage.
}

export const activeImageStorageAdapter = new LocalStorageAdapter();

export const uploadImage = activeImageStorageAdapter.uploadImage.bind(activeImageStorageAdapter);
export const deleteImage = activeImageStorageAdapter.deleteImage.bind(activeImageStorageAdapter);
export const replaceImage = activeImageStorageAdapter.replaceImage.bind(activeImageStorageAdapter);
