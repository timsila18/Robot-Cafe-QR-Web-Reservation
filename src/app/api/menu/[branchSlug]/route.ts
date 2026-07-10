import { fail, ok } from "@/lib/api-response";
import { listAdminState } from "@/lib/admin-store";
import { toPublicCategories, toPublicMenuItems } from "@/lib/demo-persistence";

type RouteContext = {
  params: Promise<{
    branchSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { branchSlug } = await context.params;
    const state = await listAdminState();
    const branch = state.branches.find((entry) => entry.slug === branchSlug && entry.isActive);
    if (!branch) return fail("Branch not found.", 404);

    return ok({
      branch: { ...branch, createdAt: branch.updatedAt },
      categories: toPublicCategories(state.categories.filter((category) => category.isActive)),
      items: toPublicMenuItems(
        state.menuItems.filter((item) => item.isActive && item.availableBranches.includes(branch.slug)),
      ),
    });
  } catch (error) {
    return fail(error);
  }
}
