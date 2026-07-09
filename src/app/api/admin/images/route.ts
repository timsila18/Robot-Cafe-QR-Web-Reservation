import { fail, ok } from "@/lib/api-response";
import { deleteCpanelMenuImage, uploadCpanelMenuImage } from "@/lib/images/cpanel-storage-server";
import type { ManagedImage, OptimizedImageBundle } from "@/lib/images/image-types";
import { deleteSupabaseMenuImage, uploadSupabaseMenuImage } from "@/lib/images/supabase-storage-server";

export const runtime = "nodejs";

type UploadBody = {
  action?: "upload" | "replace" | "delete";
  fileName?: string;
  bundle?: OptimizedImageBundle;
  menuItemId?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  image?: ManagedImage;
};

const imageDriver = () => process.env.IMAGE_STORAGE_DRIVER || process.env.NEXT_PUBLIC_IMAGE_STORAGE_DRIVER || "supabase";

const uploadMenuImage = (input: {
  fileName: string;
  bundle: OptimizedImageBundle;
  menuItemId?: string;
  sortOrder: number;
  isPrimary: boolean;
}) => (imageDriver() === "cpanel" ? uploadCpanelMenuImage(input) : uploadSupabaseMenuImage(input));

const deleteMenuImage = (image: ManagedImage) => {
  const provider = image.storagePaths?.provider;
  if (provider === "cpanel" || imageDriver() === "cpanel") return deleteCpanelMenuImage(image);
  return deleteSupabaseMenuImage(image);
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UploadBody;

    if (body.action === "delete") {
      if (!body.image) throw new Error("Image is required for delete.");
      await deleteMenuImage(body.image);
      return ok({ deleted: true });
    }

    if (!body.fileName || !body.bundle) {
      throw new Error("Image file metadata and optimized versions are required.");
    }

    const uploaded = await uploadMenuImage({
      fileName: body.fileName,
      bundle: body.bundle,
      menuItemId: body.menuItemId,
      sortOrder: body.sortOrder ?? 1,
      isPrimary: Boolean(body.isPrimary),
    });

    if (body.action === "replace" && body.image) {
      await deleteMenuImage(body.image).catch(() => undefined);
      return ok({
        ...uploaded,
        id: body.image.id,
        isPrimary: body.image.isPrimary,
        sortOrder: body.image.sortOrder,
      });
    }

    return ok(uploaded, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
