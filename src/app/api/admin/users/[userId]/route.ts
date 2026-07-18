import { fail, ok } from "@/lib/api-response";
import { resetAdminPasswordStore, updateAdminUserStore } from "@/lib/admin-users-store";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    if (body.action === "reset-password") return ok(await resetAdminPasswordStore(userId));
    return ok(await updateAdminUserStore(userId, body));
  } catch (error) {
    return fail(error);
  }
}
