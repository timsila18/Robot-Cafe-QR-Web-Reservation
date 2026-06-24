import { AdminContentArea } from "@/components/admin-content-area";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminMobileNav } from "@/components/admin-mobile-nav";
import { AdminTopbar } from "@/components/admin-topbar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="premium-shell min-h-screen text-slate-900">
      <div className="flex">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <AdminTopbar />
          <AdminMobileNav />
          <AdminContentArea>{children}</AdminContentArea>
        </div>
      </div>
    </main>
  );
}
