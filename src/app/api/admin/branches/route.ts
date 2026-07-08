import { listAdminState } from "@/lib/admin-store";
import { ok } from "@/lib/api-response";

export async function GET() {
  return ok((await listAdminState()).branches);
}
