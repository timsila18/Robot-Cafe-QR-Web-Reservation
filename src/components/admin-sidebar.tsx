import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { getSessionAdminUser } from "@/lib/admin-session";
import { adminNavItems } from "@/lib/admin-nav";
import { hasPermission } from "@/lib/rbac";

export async function AdminSidebar() {
  const currentUser = await getSessionAdminUser();
  return (
    <aside className="hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-white/10 bg-[#071827]/95 p-5 text-white shadow-2xl lg:sticky lg:top-0 lg:block">
      <div className="rounded-2xl bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,.22)]">
        <BrandMark />
      </div>
      <nav className="mt-8 space-y-2 pb-4">
        {adminNavItems.filter(([, , permission]) => !permission || hasPermission(currentUser.role, permission)).map(([label, href]) => (
          <Link
            className="block rounded-xl border border-transparent px-4 py-3 text-sm font-extrabold tracking-wide text-white/70 transition hover:border-[#168df2]/45 hover:bg-[#168df2]/14 hover:text-white"
            href={href}
            key={href}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="mb-4 mt-8 rounded-2xl border border-white/10 bg-white/8 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-[#d8a928]">Prepared Modules</p>
        <p className="mt-3 text-sm leading-6 text-white/66">
          {currentUser.role === "hostess" ? `${currentUser.name} reservation execution console.` : "Ordering, checkout, M-Pesa, loyalty, reservations, table service, and KDS."}
        </p>
      </div>
    </aside>
  );
}
