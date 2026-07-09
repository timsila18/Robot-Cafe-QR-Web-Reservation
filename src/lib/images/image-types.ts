export type ImageVersion = "thumbnail" | "card" | "detail" | "original";

export type ImageVariant = {
  url: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
};

export type ManagedImage = {
  id: string;
  menuItemId?: string;
  imageUrl: string;
  thumbnailUrl: string;
  cardUrl: string;
  detailUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
  storagePaths?: {
    provider?: string;
    original?: string;
    thumbnail?: string;
    card?: string;
    detail?: string;
  };
  originalMetadata?: {
    originalFileName: string;
    originalFileSize: number;
    originalMimeType: string;
    originalWidth: number;
    originalHeight: number;
  };
};

export type UploadProgress = {
  fileName: string;
  progress: number;
  status: "validating" | "optimizing" | "uploading" | "complete" | "error";
  error?: string;
};

export type OptimizedImageBundle = {
  original: ImageVariant;
  thumbnail: ImageVariant;
  card: ImageVariant;
  detail: ImageVariant;
  metadata: ManagedImage["originalMetadata"];
};

export type ImageStorageAdapter = {
  name: string;
  uploadImage(input: {
    file: File;
    bundle: OptimizedImageBundle;
    menuItemId?: string;
    sortOrder: number;
    isPrimary: boolean;
  }): Promise<ManagedImage>;
  deleteImage(image: ManagedImage): Promise<void>;
  replaceImage(image: ManagedImage, file: File, bundle: OptimizedImageBundle): Promise<ManagedImage>;
  getOptimizedImageUrl(image: Partial<ManagedImage> | undefined, version: ImageVersion): string;
};
