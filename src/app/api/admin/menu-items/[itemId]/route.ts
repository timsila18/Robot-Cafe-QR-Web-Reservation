import { deleteMenuItem, listAdminState, updateMenuItem } from "@/lib/admin-store";
import { fail, ok } from "@/lib/api-response";
import { menuItemSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    const input = menuItemSchema.parse(await request.json());
    const branchSlugs = new Set((await listAdminState()).branches.map((branch) => branch.slug));
    const invalidBranch = input.availableBranches.find((branchSlug) => !branchSlugs.has(branchSlug));

    if (invalidBranch) {
      throw new Error(`Invalid branch assignment: ${invalidBranch}`);
    }

    return ok(await updateMenuItem(itemId, input));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    return ok(await deleteMenuItem(itemId));
  } catch (error) {
    return fail(error);
  }
}
