import { createMenuItem, listAdminState } from "@/lib/admin-engine";
import { fail, ok } from "@/lib/api-response";
import { menuItemSchema } from "@/lib/validation";

export async function GET() {
  return ok(listAdminState().menuItems);
}

export async function POST(request: Request) {
  try {
    const input = menuItemSchema.parse(await request.json());
    const branchSlugs = new Set(listAdminState().branches.map((branch) => branch.slug));
    const invalidBranch = input.availableBranches.find((branchSlug) => !branchSlugs.has(branchSlug));

    if (invalidBranch) {
      throw new Error(`Invalid branch assignment: ${invalidBranch}`);
    }

    return ok(createMenuItem(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
