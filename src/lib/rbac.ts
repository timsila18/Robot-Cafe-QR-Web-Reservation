import { branches } from "@/lib/demo-data";

export type AdminRole = "super_admin" | "general_manager" | "branch_manager" | "content_manager";

export type Permission =
  | "manage_users"
  | "manage_roles"
  | "manage_branches"
  | "delete_branches"
  | "manage_menu"
  | "manage_images"
  | "manage_categories"
  | "manage_qr"
  | "view_analytics"
  | "manage_feedback"
  | "manage_reservations"
  | "manage_feature_flags"
  | "manage_settings"
  | "view_audit_logs"
  | "manage_security"
  | "manage_branding";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  branchId?: string;
  status: "active" | "inactive";
  lastLoginAt?: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  user: string;
  role: AdminRole;
  branchId?: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  createdAt: string;
};

export const roleLabels: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  general_manager: "General Manager",
  branch_manager: "Branch Manager",
  content_manager: "Content Manager",
};

export const rolePermissions: Record<AdminRole, Permission[]> = {
  super_admin: [
    "manage_users",
    "manage_roles",
    "manage_branches",
    "delete_branches",
    "manage_menu",
    "manage_images",
    "manage_categories",
    "manage_qr",
    "view_analytics",
    "manage_feedback",
    "manage_reservations",
    "manage_feature_flags",
    "manage_settings",
    "view_audit_logs",
    "manage_security",
    "manage_branding",
  ],
  general_manager: [
    "manage_users",
    "manage_branches",
    "manage_menu",
    "manage_images",
    "manage_categories",
    "manage_qr",
    "view_analytics",
    "manage_feedback",
    "manage_reservations",
  ],
  branch_manager: ["manage_menu", "manage_images", "manage_qr", "view_analytics", "manage_feedback", "manage_reservations"],
  content_manager: ["manage_menu", "manage_images", "manage_categories"],
};

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

let adminUsers: AdminUser[] = [
  {
    id: "user-super-admin",
    name: "Robot Cafe Super Admin",
    email: "admin@robotcafe.co.ke",
    role: "super_admin",
    status: "active",
    lastLoginAt: now(),
    createdAt: "2026-06-24T08:00:00.000Z",
  },
  {
    id: "user-general-manager",
    name: "General Manager",
    email: "gm@robotcafe.co.ke",
    role: "general_manager",
    status: "active",
    lastLoginAt: "2026-06-24T10:12:00.000Z",
    createdAt: "2026-06-20T08:00:00.000Z",
  },
  {
    id: "user-imaara-manager",
    name: "Imaara Branch Manager",
    email: "imaara.manager@robotcafe.co.ke",
    role: "branch_manager",
    branchId: "branch-imaara",
    status: "active",
    createdAt: "2026-06-20T08:00:00.000Z",
  },
  {
    id: "user-content-manager",
    name: "Content Manager",
    email: "content@robotcafe.co.ke",
    role: "content_manager",
    status: "active",
    createdAt: "2026-06-20T08:00:00.000Z",
  },
];

let auditLogs: AuditLog[] = [
  {
    id: "audit-1",
    user: "Robot Cafe Super Admin",
    role: "super_admin",
    ipAddress: "127.0.0.1",
    userAgent: "Robot Cafe Demo",
    action: "System Review",
    entity: "platform",
    entityId: "robot-cafe",
    newValue: { status: "ready" },
    createdAt: now(),
  },
];

export function getCurrentAdminUser() {
  return adminUsers[0];
}

export function hasPermission(role: AdminRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export function listAdminUsers() {
  return adminUsers;
}

export function createAdminUser(input: Omit<AdminUser, "id" | "createdAt" | "lastLoginAt">) {
  const user = { ...input, id: id("user"), createdAt: now() };
  adminUsers = [user, ...adminUsers];
  recordAudit("User Created", "admin_users", user.id, undefined, user);
  return user;
}

export function updateAdminUser(userId: string, input: Partial<AdminUser>) {
  let updated: AdminUser | undefined;
  const oldValue = adminUsers.find((user) => user.id === userId);
  adminUsers = adminUsers.map((user) => {
    if (user.id !== userId) return user;
    updated = { ...user, ...input, id: userId };
    return updated;
  });
  if (!updated) throw new Error("Admin user not found.");
  recordAudit("User Updated", "admin_users", userId, oldValue, updated);
  return updated;
}

export function resetAdminPassword(userId: string) {
  const user = adminUsers.find((entry) => entry.id === userId);
  if (!user) throw new Error("Admin user not found.");
  recordAudit("Password Reset", "admin_users", userId, undefined, { email: user.email });
  return { temporaryPassword: "RobotCafe@2026" };
}

export function listAuditLogs() {
  return auditLogs;
}

export function recordAudit(action: string, entity: string, entityId: string, oldValue?: unknown, newValue?: unknown) {
  const current = getCurrentAdminUser();
  auditLogs = [
    {
      id: id("audit"),
      user: current.name,
      role: current.role,
      branchId: current.branchId,
      ipAddress: "127.0.0.1",
      userAgent: "Robot Cafe Admin Console",
      action,
      entity,
      entityId,
      oldValue,
      newValue,
      createdAt: now(),
    },
    ...auditLogs,
  ].slice(0, 250);
}

export function branchName(branchId?: string) {
  return branches.find((branch) => branch.id === branchId)?.name.replace("Robot Cafe - ", "") ?? "All branches";
}
