import type { ImageStorageAdapter, ManagedImage, OptimizedImageBundle } from "@/lib/images/image-types";
import { getOptimizedImageUrl } from "@/lib/images/image-utils";

const imageId = () => `image-${crypto.randomUUID()}`;

const productionBundle = (bundle: OptimizedImageBundle): OptimizedImageBundle => ({
  ...bundle,
  original: {
    ...bundle.detail,
    url: bundle.detail.url,
  },
});

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
  name = "supabase-storage";

  async uploadImage(input: {
    file: File;
    bundle: OptimizedImageBundle;
    menuItemId?: string;
    sortOrder: number;
    isPrimary: boolean;
  }): Promise<ManagedImage> {
    const response = await fetch("/api/admin/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upload",
        fileName: input.file.name,
        bundle: productionBundle(input.bundle),
        menuItemId: input.menuItemId,
        sortOrder: input.sortOrder,
        isPrimary: input.isPrimary,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Production image upload failed.");
    return payload.data;
  }

  async deleteImage(image: ManagedImage) {
    const response = await fetch("/api/admin/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", image }),
    });
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error ?? "Production image delete failed.");
    }
  }

  async replaceImage(image: ManagedImage, file: File, bundle: OptimizedImageBundle): Promise<ManagedImage> {
    const response = await fetch("/api/admin/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "replace",
        image,
        fileName: file.name,
        bundle: productionBundle(bundle),
        menuItemId: image.menuItemId,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Production image replacement failed.");
    return payload.data;
  }
}

export class FutureCloudinaryAdapter extends LocalStorageAdapter {
  name = "future-cloudinary";
  // Production switch point: send originals to Cloudinary, request eager
  // transformations for thumbnail/card/detail, and map the resulting URLs into
  // ManagedImage. The admin workflow can keep using uploadImage/replaceImage.
}

class AutoImageStorageAdapter extends LocalStorageAdapter {
  name = "auto-production-with-local-fallback";
  private production = new FutureSupabaseStorageAdapter();

  async uploadImage(input: {
    file: File;
    bundle: OptimizedImageBundle;
    menuItemId?: string;
    sortOrder: number;
    isPrimary: boolean;
  }) {
    try {
      return await this.production.uploadImage(input);
    } catch (error) {
      if (process.env.NEXT_PUBLIC_IMAGE_STORAGE_DRIVER === "supabase") throw error;
      return super.uploadImage(input);
    }
  }

  async deleteImage(image: ManagedImage) {
    if (image.storagePaths) {
      await this.production.deleteImage(image).catch(() => undefined);
    }
    return super.deleteImage(image);
  }

  async replaceImage(image: ManagedImage, file: File, bundle: OptimizedImageBundle) {
    try {
      return await this.production.replaceImage(image, file, bundle);
    } catch (error) {
      if (process.env.NEXT_PUBLIC_IMAGE_STORAGE_DRIVER === "supabase") throw error;
      return super.replaceImage(image, file, bundle);
    }
  }
}

export const activeImageStorageAdapter =
  process.env.NEXT_PUBLIC_IMAGE_STORAGE_DRIVER === "local" ? new LocalStorageAdapter() : new AutoImageStorageAdapter();

export const uploadImage = activeImageStorageAdapter.uploadImage.bind(activeImageStorageAdapter);
export const deleteImage = activeImageStorageAdapter.deleteImage.bind(activeImageStorageAdapter);
export const replaceImage = activeImageStorageAdapter.replaceImage.bind(activeImageStorageAdapter);
