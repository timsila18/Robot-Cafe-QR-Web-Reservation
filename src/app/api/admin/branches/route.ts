import { listAdminState } from "@/lib/admin-engine";
import { ok } from "@/lib/api-response";

export async function GET() {
  return ok(listAdminState().branches);
}
