import { ok } from "@/lib/api-response";
import { listAuditLogs } from "@/lib/rbac";

export async function GET() {
  return ok(listAuditLogs());
}
