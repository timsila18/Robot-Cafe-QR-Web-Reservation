import { cookies } from "next/headers";
import { ok } from "@/lib/api-response";
import { logActivity } from "@/lib/admin-engine";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("robot_admin_session");
  logActivity("Admin Logout", "admin_users", "local-admin");
  return ok({ redirectTo: "/admin/login" });
}
