import { AdminContentArea } from "@/components/admin-content-area";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminMobileNav } from "@/components/admin-mobile-nav";
import { AdminTopbar } from "@/components/admin-topbar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="premium-shell min-h-screen text-slate-900 lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen lg:min-h-0">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col lg:h-screen lg:min-h-0">
          <AdminTopbar />
          <AdminMobileNav />
          <div className="min-h-0 flex-1 lg:overflow-y-auto">
            <AdminContentArea>{children}</AdminContentArea>
          </div>
        </div>
      </div>
    </main>
  );
}
