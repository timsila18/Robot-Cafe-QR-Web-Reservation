import { createBranch, listAdminState } from "@/lib/admin-store";
import { fail, ok } from "@/lib/api-response";
import { branchSchema } from "@/lib/validation";

export async function GET() {
  return ok((await listAdminState()).branches);
}

export async function POST(request: Request) {
  try {
    return ok(await createBranch(branchSchema.parse(await request.json())), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
