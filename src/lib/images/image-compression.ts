import type { ImageVariant, OptimizedImageBundle } from "@/lib/images/image-types";

type ResizeOptions = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  mimeType?: "image/webp" | "image/jpeg" | "image/png";
};

const loadImage = async (file: File) => {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to read this image file."));
    });
    image.src = url;
    return await loaded;
  } finally {
    URL.revokeObjectURL(url);
  }
};

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image compression failed."));
      },
      mimeType,
      quality,
    );
  });

export async function resizeImage(file: File, options: ResizeOptions): Promise<ImageVariant> {
  const image = await loadImage(file);
  const scale = Math.min(1, options.maxWidth / image.naturalWidth, options.maxHeight / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Your browser cannot optimize images on this device.");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  const mimeType = options.mimeType ?? "image/webp";
  const blob = await canvasToBlob(canvas, mimeType, options.quality);

  return {
    url: await blobToDataUrl(blob),
    width,
    height,
    fileSize: blob.size,
    mimeType: blob.type || mimeType,
  };
}

export async function generateThumbnail(file: File) {
  return resizeImage(file, { maxWidth: 360, maxHeight: 360, quality: 0.72, mimeType: "image/webp" });
}

export async function compressImage(file: File): Promise<OptimizedImageBundle> {
  const image = await loadImage(file);
  const originalDataUrl = await fileToDataUrl(file);

  const [thumbnail, card, detail] = await Promise.all([
    generateThumbnail(file),
    resizeImage(file, { maxWidth: 900, maxHeight: 720, quality: 0.78, mimeType: "image/webp" }),
    resizeImage(file, { maxWidth: 1600, maxHeight: 1200, quality: 0.84, mimeType: "image/webp" }),
  ]);

  return {
    original: {
      url: originalDataUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
      fileSize: file.size,
      mimeType: file.type,
    },
    thumbnail,
    card,
    detail,
    metadata: {
      originalFileName: file.name,
      originalFileSize: file.size,
      originalMimeType: file.type,
      originalWidth: image.naturalWidth,
      originalHeight: image.naturalHeight,
    },
  };
}

async function fileToDataUrl(file: File) {
  return blobToDataUrl(file);
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read optimized image."));
    reader.readAsDataURL(blob);
  });
}
