import { AdminBranchManager } from "@/components/admin-branch-manager";
import { listAdminState } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export default async function AdminBranchesPage() {
  return <AdminBranchManager initialBranches={(await listAdminState()).branches} />;
}
