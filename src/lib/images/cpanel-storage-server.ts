import { dataUrlToServerBlob } from "@/lib/images/data-url";
import type { ManagedImage, OptimizedImageBundle } from "@/lib/images/image-types";

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

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

function cpanelConfig() {
  const apiBase = process.env.CPANEL_API_BASE?.replace(/\/+$/g, "");
  const username = process.env.CPANEL_USERNAME;
  const token = process.env.CPANEL_API_TOKEN;
  const uploadDir = process.env.CPANEL_UPLOAD_DIR;
  const publicBaseUrl = process.env.CPANEL_PUBLIC_BASE_URL?.replace(/\/+$/g, "");

  if (!apiBase || !username || !token || !uploadDir || !publicBaseUrl) {
    throw new Error("cPanel image storage is not configured. Add CPANEL_API_BASE, CPANEL_USERNAME, CPANEL_API_TOKEN, CPANEL_UPLOAD_DIR, and CPANEL_PUBLIC_BASE_URL.");
  }

  return { apiBase, username, token, uploadDir: uploadDir.replace(/\/+$/g, ""), publicBaseUrl };
}

async function uploadVariant(input: {
  config: ReturnType<typeof cpanelConfig>;
  relativePath: string;
  dataUrl: string;
}) {
  const blob = await dataUrlToServerBlob(input.dataUrl);
  const parts = input.relativePath.split("/");
  const fileName = parts.pop() || "image.webp";
  const targetDir = `${input.config.uploadDir}/${parts.join("/")}`.replace(/\/+$/g, "");
  const form = new FormData();
  form.append("dir", targetDir);
  form.append("overwrite", "1");
  form.append("file-1", blob, fileName);

  const response = await fetch(`${input.config.apiBase}/execute/Fileman/upload_files`, {
    method: "POST",
    headers: {
      Authorization: `cpanel ${input.config.username}:${input.config.token}`,
    },
    body: form,
  });

  const payload = await response.text();
  if (!response.ok) throw new Error(`cPanel image upload failed: ${payload}`);

  return `${input.config.publicBaseUrl}/${trimSlashes(input.relativePath)}`;
}

export async function uploadCpanelMenuImage(input: {
  fileName: string;
  bundle: OptimizedImageBundle;
  menuItemId?: string;
  sortOrder: number;
  isPrimary: boolean;
}): Promise<ManagedImage> {
  const config = cpanelConfig();
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
    uploadVariant({ config, relativePath: paths.original, dataUrl: input.bundle.original.url }),
    uploadVariant({ config, relativePath: paths.thumbnail, dataUrl: input.bundle.thumbnail.url }),
    uploadVariant({ config, relativePath: paths.card, dataUrl: input.bundle.card.url }),
    uploadVariant({ config, relativePath: paths.detail, dataUrl: input.bundle.detail.url }),
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

export async function deleteCpanelMenuImage(image: ManagedImage) {
  const config = cpanelConfig();
  const paths = Object.entries(image.storagePaths ?? {})
    .filter(([key, value]) => key !== "provider" && Boolean(value))
    .map(([, value]) => String(value));
  if (!paths.length) return;

  const params = new URLSearchParams();
  paths.forEach((path, index) => params.set(`file-${index}`, `${config.uploadDir}/${trimSlashes(path)}`));

  const response = await fetch(`${config.apiBase}/execute/Fileman/delete_files?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `cpanel ${config.username}:${config.token}`,
    },
  });

  const payload = await response.text();
  if (!response.ok) throw new Error(`cPanel image delete failed: ${payload}`);
}
