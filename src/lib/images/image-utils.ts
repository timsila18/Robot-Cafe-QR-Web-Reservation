import type { ImageVersion, ManagedImage } from "@/lib/images/image-types";

export const robotCafeImageFallback =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f8fafc"/><stop offset=".52" stop-color="#e9f5fc"/><stop offset="1" stop-color="#dff3ea"/></linearGradient><radialGradient id="r" cx=".22" cy=".18" r=".68"><stop stop-color="#0877bd" stop-opacity=".24"/><stop offset="1" stop-color="#0877bd" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="800" fill="url(#g)"/><rect width="1200" height="800" fill="url(#r)"/><circle cx="600" cy="350" r="92" fill="#fff" stroke="#0877bd" stroke-width="10"/><path d="M520 355h160M548 315h104M548 395h104" stroke="#0877bd" stroke-width="20" stroke-linecap="round"/><text x="600" y="535" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="700" fill="#0f172a">ROBOT CAFE</text></svg>`,
  );

export function normalizeImageOrder<T extends { sortOrder: number; isPrimary?: boolean }>(images: T[]) {
  const ordered = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const hasPrimary = ordered.some((image) => image.isPrimary);

  return ordered.map((image, index) => ({
    ...image,
    sortOrder: index + 1,
    isPrimary: hasPrimary ? Boolean(image.isPrimary) : index === 0,
  }));
}

export function getPrimaryImage<T extends Partial<ManagedImage> & { isPrimary?: boolean; sortOrder?: number }>(images: T[] | undefined) {
  if (!images?.length) return undefined;
  return [...images].sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)).find((image) => image.isPrimary) ?? images[0];
}

export function getOptimizedImageUrl(image: Partial<ManagedImage> | undefined, version: ImageVersion = "card") {
  if (!image) return robotCafeImageFallback;
  if (version === "thumbnail") return image.thumbnailUrl || image.cardUrl || image.detailUrl || image.imageUrl || robotCafeImageFallback;
  if (version === "detail") return image.detailUrl || image.cardUrl || image.imageUrl || image.thumbnailUrl || robotCafeImageFallback;
  if (version === "original") return image.imageUrl || image.detailUrl || image.cardUrl || image.thumbnailUrl || robotCafeImageFallback;
  return image.cardUrl || image.imageUrl || image.detailUrl || image.thumbnailUrl || robotCafeImageFallback;
}

export function formatBytes(bytes = 0) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function imageAlt(name: string, suffix = "menu photo") {
  return `${name} ${suffix}`;
}
