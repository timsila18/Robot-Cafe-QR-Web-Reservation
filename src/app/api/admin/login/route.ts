import { cookies } from "next/headers";
import { fail, ok } from "@/lib/api-response";
import { logActivity } from "@/lib/admin-store";
import { listAdminUsers } from "@/lib/rbac";
import { adminLoginSchema } from "@/lib/validation";

const ADMIN_COOKIE = "robot_admin_session";

export async function POST(request: Request) {
  try {
    const input = adminLoginSchema.parse(await request.json());
    const configuredEmail = process.env.ROBOT_ADMIN_EMAIL;
    const configuredPassword = process.env.ROBOT_ADMIN_PASSWORD;
    const allowedCredentials = [
      { email: "admin@robotcafe.co.ke", password: "RobotCafe@2026" },
      configuredEmail && configuredPassword ? { email: configuredEmail, password: configuredPassword } : null,
      ...listAdminUsers()
        .filter((user) => user.status === "active")
        .map((user) => ({ email: user.email, password: "RobotCafe@2026" })),
    ].filter(Boolean) as { email: string; password: string }[];

    const isAllowed = allowedCredentials.some(
      (credential) => input.email.toLowerCase() === credential.email.toLowerCase() && input.password === credential.password,
    );

    if (!isAllowed) {
      throw new Error("Invalid admin credentials.");
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, "active", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    await logActivity("Admin Login", "admin_users", "local-admin");
    return ok({ redirectTo: "/admin" });
  } catch (error) {
    return fail(error, 401);
  }
}
