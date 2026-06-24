import { AdminBranchManager } from "@/components/admin-branch-manager";
import { listAdminState } from "@/lib/admin-engine";

export default function AdminBranchesPage() {
  return <AdminBranchManager initialBranches={listAdminState().branches} />;
}
