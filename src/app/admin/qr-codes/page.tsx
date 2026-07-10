import { AdminQrManager } from "@/components/admin-qr-manager";
import { listAdminState } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export default async function AdminQrCodesPage() {
  return <AdminQrManager branches={(await listAdminState()).branches} />;
}
