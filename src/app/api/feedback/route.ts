import { fail, ok } from "@/lib/api-response";
import { createFeedback, listFeedback } from "@/lib/dining-intelligence";
import { feedbackSchema } from "@/lib/validation";

export async function GET() {
  return ok(listFeedback());
}

export async function POST(request: Request) {
  try {
    const feedback = createFeedback(feedbackSchema.parse(await request.json()));
    return ok(feedback, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
