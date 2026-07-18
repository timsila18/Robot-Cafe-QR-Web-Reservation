import { cookies } from "next/headers";
import { fail, ok } from "@/lib/api-response";
import { logActivity } from "@/lib/admin-store";
import { listAdminUsersStore } from "@/lib/admin-users-store";
import { adminSessionMaxAge, createAdminSessionToken } from "@/lib/admin-auth-token";
import { ADMIN_COOKIE, ADMIN_EMAIL_COOKIE } from "@/lib/admin-session";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = adminLoginSchema.parse(await request.json());
    const configuredEmail = process.env.ROBOT_ADMIN_EMAIL;
    const configuredPassword = process.env.ROBOT_ADMIN_PASSWORD;
    const adminUsers = await listAdminUsersStore();
    const allowedCredentials = [
      { email: "admin@robotcafe.co.ke", password: "RobotCafe@2026" },
      configuredEmail && configuredPassword ? { email: configuredEmail, password: configuredPassword } : null,
      ...adminUsers
        .filter((user) => user.status === "active")
        .map((user) => ({ email: user.email, password: "RobotCafe@2026" })),
    ].filter(Boolean) as { email: string; password: string }[];

    const matchedCredential = allowedCredentials.find(
      (credential) => input.email.toLowerCase() === credential.email.toLowerCase() && input.password === credential.password,
    );

    if (!matchedCredential) {
      throw new Error("Invalid admin credentials.");
    }

    const adminUser = adminUsers.find((user) => user.email.toLowerCase() === matchedCredential.email.toLowerCase());
    const redirectTo = adminUser?.role === "hostess" ? "/admin/reservations" : "/admin";

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, await createAdminSessionToken(matchedCredential.email, adminUser?.role), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: adminSessionMaxAge,
      path: "/",
    });
    cookieStore.delete(ADMIN_EMAIL_COOKIE);
    await logActivity("Admin Login", "admin_users", "local-admin");
    return ok({ redirectTo });
  } catch (error) {
    return fail(error, 401);
  }
}
