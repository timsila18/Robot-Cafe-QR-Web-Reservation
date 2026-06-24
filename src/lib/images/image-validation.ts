const acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const maxImageSize = 20 * 1024 * 1024;
export const maxImagesPerItem = 10;

export function validateImageFile(file: File) {
  if (!acceptedTypes.includes(file.type)) {
    return {
      ok: false,
      error: "Robot Cafe supports JPG, JPEG, PNG, and WEBP images only.",
    };
  }

  if (file.size > maxImageSize) {
    return {
      ok: false,
      error: "Each menu photo must be 20MB or smaller for the demo upload flow.",
    };
  }

  return { ok: true, error: "" };
}

export function validateImageCount(currentCount: number, incomingCount: number) {
  if (currentCount + incomingCount > maxImagesPerItem) {
    return {
      ok: false,
      error: `A menu item can hold up to ${maxImagesPerItem} images in this demo.`,
    };
  }

  return { ok: true, error: "" };
}
