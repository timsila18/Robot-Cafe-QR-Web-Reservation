import { cookies } from "next/headers";
import { ok } from "@/lib/api-response";
import { logActivity } from "@/lib/admin-store";
import { ADMIN_COOKIE, ADMIN_EMAIL_COOKIE } from "@/lib/admin-session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  cookieStore.delete(ADMIN_EMAIL_COOKIE);
  await logActivity("Admin Logout", "admin_users", "local-admin");
  return ok({ redirectTo: "/admin/login" });
}
