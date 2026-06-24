import { headers } from "next/headers";
import { AdminLayout } from "@/components/admin-layout";

export default async function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname");

  if (pathname === "/admin/login") {
    return <main className="premium-shell min-h-screen px-5 py-10 text-slate-900 sm:px-8">{children}</main>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
