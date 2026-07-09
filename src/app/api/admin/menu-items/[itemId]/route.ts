import { deleteMenuItem, listAdminState, updateMenuItem } from "@/lib/admin-store";
import { fail, ok } from "@/lib/api-response";
import { menuItemSchema, type MenuItemInput } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

async function normalizeBranchAssignments(input: MenuItemInput): Promise<MenuItemInput> {
  const branches = (await listAdminState()).branches;
  const branchSlugByReference = new Map<string, string>();

  branches.forEach((branch) => {
    branchSlugByReference.set(branch.id, branch.slug);
    branchSlugByReference.set(branch.slug, branch.slug);
  });

  const normalizedBranches = input.availableBranches.map((branchReference) => {
    const slug = branchSlugByReference.get(branchReference);
    if (!slug) throw new Error(`Invalid branch assignment: ${branchReference}`);
    return slug;
  });

  return { ...input, availableBranches: [...new Set(normalizedBranches)] };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    const input = menuItemSchema.parse(await request.json());
    return ok(await updateMenuItem(itemId, await normalizeBranchAssignments(input)));
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
