import { cookies } from "next/headers";
import { fail, ok } from "@/lib/api-response";
import { logActivity } from "@/lib/admin-engine";
import { adminLoginSchema } from "@/lib/validation";

const ADMIN_COOKIE = "robot_admin_session";

export async function POST(request: Request) {
  try {
    const input = adminLoginSchema.parse(await request.json());
    const email = process.env.ROBOT_ADMIN_EMAIL ?? "admin@robotcafe.co.ke";
    const password = process.env.ROBOT_ADMIN_PASSWORD ?? "RobotCafe@2026";

    if (input.email.toLowerCase() !== email.toLowerCase() || input.password !== password) {
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
    logActivity("Admin Login", "admin_users", "local-admin");
    return ok({ redirectTo: "/admin" });
  } catch (error) {
    return fail(error, 401);
  }
}
