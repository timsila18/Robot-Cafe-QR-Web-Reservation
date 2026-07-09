import { createMenuItem, listAdminState } from "@/lib/admin-store";
import { fail, ok } from "@/lib/api-response";
import { menuItemSchema, type MenuItemInput } from "@/lib/validation";

export async function GET() {
  return ok((await listAdminState()).menuItems);
}

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

export async function POST(request: Request) {
  try {
    const input = menuItemSchema.parse(await request.json());
    return ok(await createMenuItem(await normalizeBranchAssignments(input)), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
