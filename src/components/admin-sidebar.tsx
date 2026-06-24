import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { getCurrentAdminUser, hasPermission } from "@/lib/rbac";

const navItems = [
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
] as const;

export function AdminSidebar() {
  const currentUser = getCurrentAdminUser();
  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white/92 p-5 shadow-sm lg:block">
      <BrandMark />
      <nav className="mt-10 space-y-2">
        {navItems.filter(([, , permission]) => !permission || hasPermission(currentUser.role, permission)).map(([label, href]) => (
          <Link
            className="block rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-gold/20 hover:bg-gold/5 hover:text-gold"
            href={href}
            key={href}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="luxury-panel mt-10 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Prepared Modules</p>
        <p className="mt-3 text-sm leading-6 text-slate-500">Ordering, cart, checkout, M-Pesa, loyalty, reservations, table service, and KDS.</p>
      </div>
    </aside>
  );
}
