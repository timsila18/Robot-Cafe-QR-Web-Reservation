import { createCategory, listAdminState } from "@/lib/admin-engine";
import { fail, ok } from "@/lib/api-response";
import { categorySchema } from "@/lib/validation";

export async function GET() {
  return ok(listAdminState().categories);
}

export async function POST(request: Request) {
  try {
    return ok(createCategory(categorySchema.parse(await request.json())), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
