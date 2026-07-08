import { updateBranch } from "@/lib/admin-store";
import { fail, ok } from "@/lib/api-response";
import { branchSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    branchId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { branchId } = await context.params;
    return ok(await updateBranch(branchId, branchSchema.parse(await request.json())));
  } catch (error) {
    return fail(error);
  }
}
