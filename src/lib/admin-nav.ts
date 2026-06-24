import type { Permission } from "@/lib/rbac";

export const adminNavItems: readonly [string, string, Permission | undefined][] = [
  ["Dashboard", "/admin", undefined],
  ["Menu Items", "/admin/menu", "manage_menu"],
  ["Categories", "/admin/categories", "manage_categories"],
  ["Branches", "/admin/branches", "manage_branches"],
  ["Users", "/admin/users", "manage_users"],
  ["Feedback", "/admin/feedback", "manage_feedback"],
  ["Analytics", "/admin/analytics", "view_analytics"],
  ["QR Codes", "/admin/qr-codes", "manage_qr"],
  ["Audit Logs", "/admin/audit-logs", "view_audit_logs"],
  ["Settings", "/admin/settings", "manage_settings"],
];
