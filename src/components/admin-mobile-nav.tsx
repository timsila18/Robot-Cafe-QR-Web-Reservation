import Link from "next/link";
import { adminNavItems } from "@/lib/admin-nav";
import { getCurrentAdminUser, hasPermission } from "@/lib/rbac";

export function AdminMobileNav() {
  const currentUser = getCurrentAdminUser();
  const visibleItems = adminNavItems.filter(([, , permission]) => !permission || hasPermission(currentUser.role, permission));

  return (
    <nav className="scrollbar-none sticky top-[104px] z-20 flex gap-2 overflow-x-auto border-b border-white/10 bg-[#071827]/96 px-4 py-3 text-white shadow-2xl backdrop-blur-xl lg:hidden">
      {visibleItems.map(([label, href]) => (
        <Link
          className="shrink-0 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-extrabold tracking-wide text-white/78 transition hover:border-[#168df2]/60 hover:bg-[#168df2]/18 hover:text-white"
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
