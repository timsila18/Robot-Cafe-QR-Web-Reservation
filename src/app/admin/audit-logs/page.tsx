import { AdminAuditLogConsole } from "@/components/admin-audit-log-console";
import { listAuditLogs } from "@/lib/rbac";

export default function AdminAuditLogsPage() {
  return <AdminAuditLogConsole logs={listAuditLogs()} />;
}
