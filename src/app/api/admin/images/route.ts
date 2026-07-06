import { fail, ok } from "@/lib/api-response";
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UploadBody;

    if (body.action === "delete") {
      if (!body.image) throw new Error("Image is required for delete.");
      await deleteSupabaseMenuImage(body.image);
      return ok({ deleted: true });
    }

    if (!body.fileName || !body.bundle) {
      throw new Error("Image file metadata and optimized versions are required.");
    }

    const uploaded = await uploadSupabaseMenuImage({
      fileName: body.fileName,
      bundle: body.bundle,
      menuItemId: body.menuItemId,
      sortOrder: body.sortOrder ?? 1,
      isPrimary: Boolean(body.isPrimary),
    });

    if (body.action === "replace" && body.image) {
      await deleteSupabaseMenuImage(body.image).catch(() => undefined);
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
