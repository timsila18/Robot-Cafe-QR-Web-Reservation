import { fail, ok } from "@/lib/api-response";
import { updateFeedbackStatus } from "@/lib/dining-intelligence";

type RouteContext = {
  params: Promise<{ feedbackId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { feedbackId } = await context.params;
    const body = await request.json();
    if (!["new", "reviewed", "archived"].includes(body.status)) {
      return fail("Invalid feedback status.", 400);
    }
    return ok(updateFeedbackStatus(feedbackId, body.status));
  } catch (error) {
    return fail(error);
  }
}
