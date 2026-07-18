import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/admin-auth-token";
import { getAdminUserByEmailStore } from "@/lib/admin-users-store";
import type { AdminUser } from "@/lib/rbac";

export const ADMIN_COOKIE = "robot_admin_session";
export const ADMIN_EMAIL_COOKIE = "robot_admin_email";

export async function getSessionAdminUserOrNull(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const email = await verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
  return email ? (await getAdminUserByEmailStore(email)) ?? null : null;
}

export async function getSessionAdminUser(): Promise<AdminUser> {
  const user = await getSessionAdminUserOrNull();
  if (!user) throw new Error("Unauthorized admin session.");
  return user;
}
