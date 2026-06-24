import { fail, ok } from "@/lib/api-response";
import { createAdminUser, listAdminUsers, type AdminRole } from "@/lib/rbac";

export async function GET() {
  return ok(listAdminUsers());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.role) return fail("Name, email, and role are required.", 400);
    return ok(
      createAdminUser({
        name: body.name,
        email: body.email,
        role: body.role as AdminRole,
        branchId: body.branchId || undefined,
        status: body.status === "inactive" ? "inactive" : "active",
      }),
      { status: 201 },
    );
  } catch (error) {
    return fail(error);
  }
}
