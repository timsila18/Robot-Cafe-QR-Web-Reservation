import { AdminUsersConsole } from "@/components/admin-users-console";
import { listAdminUsers } from "@/lib/rbac";

export default function AdminUsersPage() {
  return <AdminUsersConsole initialUsers={listAdminUsers()} />;
}
