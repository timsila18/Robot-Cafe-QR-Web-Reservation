import { cookies } from "next/headers";
import { getAdminUserByEmail, getCurrentAdminUser, type AdminUser } from "@/lib/rbac";

export const ADMIN_COOKIE = "robot_admin_session";
export const ADMIN_EMAIL_COOKIE = "robot_admin_email";

export async function getSessionAdminUser(): Promise<AdminUser> {
  const cookieStore = await cookies();
  const email = cookieStore.get(ADMIN_EMAIL_COOKIE)?.value;
  return email ? getAdminUserByEmail(email) ?? getCurrentAdminUser() : getCurrentAdminUser();
}
