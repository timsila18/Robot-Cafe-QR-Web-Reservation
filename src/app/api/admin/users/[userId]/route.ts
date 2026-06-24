import { fail, ok } from "@/lib/api-response";
import { resetAdminPassword, updateAdminUser } from "@/lib/rbac";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    if (body.action === "reset-password") return ok(resetAdminPassword(userId));
    return ok(updateAdminUser(userId, body));
  } catch (error) {
    return fail(error);
  }
}
