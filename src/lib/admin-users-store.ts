import { logActivity } from "@/lib/admin-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createAdminUser as createMemoryAdminUser,
  defaultAdminUsers,
  listAdminUsers as listMemoryAdminUsers,
  resetAdminPassword as resetMemoryAdminPassword,
  updateAdminUser as updateMemoryAdminUser,
  type AdminRole,
  type AdminUser,
} from "@/lib/rbac";

const validRoles = new Set<AdminRole>(["super_admin", "general_manager", "branch_manager", "content_manager", "hostess"]);

function toAdminRole(value: unknown): AdminRole {
  return validRoles.has(value as AdminRole) ? (value as AdminRole) : "content_manager";
}

function toAdminUser(row: Record<string, unknown>): AdminUser {
  return {
    id: String(row.id),
    name: String(row.full_name ?? row.name ?? "Robot Cafe User"),
    email: String(row.email),
    role: toAdminRole(row.role),
    branchId: row.branch_id ? String(row.branch_id) : undefined,
    status: row.is_active === false ? "inactive" : "active",
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function toPayload(input: Omit<AdminUser, "id" | "createdAt" | "lastLoginAt"> | AdminUser) {
  return {
    email: input.email.toLowerCase(),
    full_name: input.name,
    role: input.role,
    branch_id: input.branchId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.branchId) ? input.branchId : null,
    is_active: input.status !== "inactive",
    deactivated_at: input.status === "inactive" ? new Date().toISOString() : null,
  };
}

async function seedDefaultAdminUsersIfNeeded() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return;

  const { count, error: countError } = await supabase.from("admin_users").select("id", { count: "exact", head: true });
  if (countError || (count ?? 0) > 0) return;

  const { error } = await supabase.from("admin_users").insert(defaultAdminUsers.map(toPayload));
  if (error) throw new Error(`Unable to seed admin users: ${error.message}`);
}

export async function listAdminUsersStore() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return listMemoryAdminUsers();

  await seedDefaultAdminUsersIfNeeded();
  const { data, error } = await supabase.from("admin_users").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`Unable to load admin users: ${error.message}`);
  return data.map((row) => toAdminUser(row));
}

export async function getAdminUserByEmailStore(email: string) {
  const users = await listAdminUsersStore();
  return users.find((user) => user.status === "active" && user.email.toLowerCase() === email.toLowerCase());
}

export async function createAdminUserStore(input: Omit<AdminUser, "id" | "createdAt" | "lastLoginAt">) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return createMemoryAdminUser(input);

  const { data, error } = await supabase.from("admin_users").insert(toPayload(input)).select("*").single();
  if (error) throw new Error(`Unable to create admin user: ${error.message}`);
  await logActivity("User Created", "admin_users", data.id);
  return toAdminUser(data);
}

export async function updateAdminUserStore(userId: string, input: Partial<AdminUser>) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return updateMemoryAdminUser(userId, input);

  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.full_name = input.name;
  if (input.email !== undefined) payload.email = input.email.toLowerCase();
  if (input.role !== undefined) payload.role = input.role;
  if (input.branchId !== undefined) payload.branch_id = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.branchId) ? input.branchId : null;
  if (input.status !== undefined) {
    payload.is_active = input.status !== "inactive";
    payload.deactivated_at = input.status === "inactive" ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase.from("admin_users").update(payload).eq("id", userId).select("*").single();
  if (error) throw new Error(`Unable to update admin user: ${error.message}`);
  await logActivity("User Updated", "admin_users", userId);
  return toAdminUser(data);
}

export async function resetAdminPasswordStore(userId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return resetMemoryAdminPassword(userId);

  const { data, error } = await supabase.from("admin_users").select("id").eq("id", userId).single();
  if (error || !data) throw new Error(error?.message ?? "Admin user not found.");
  await logActivity("Password Reset", "admin_users", userId);
  return { temporaryPassword: "RobotCafe@2026" };
}
