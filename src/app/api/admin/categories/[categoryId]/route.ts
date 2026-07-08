import { deleteCategory, updateCategory } from "@/lib/admin-store";
import { fail, ok } from "@/lib/api-response";
import { categorySchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { categoryId } = await context.params;
    return ok(await updateCategory(categoryId, categorySchema.parse(await request.json())));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { categoryId } = await context.params;
    await deleteCategory(categoryId);
    return ok({ id: categoryId });
  } catch (error) {
    return fail(error);
  }
}
