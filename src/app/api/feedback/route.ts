import { fail, ok } from "@/lib/api-response";
import { createFeedback, listFeedback } from "@/lib/dining-intelligence";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { feedbackSchema } from "@/lib/validation";

export async function GET() {
  return ok(listFeedback());
}

export async function POST(request: Request) {
  try {
    const input = feedbackSchema.parse(await request.json());
    const supabase = createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("feedback")
        .insert({
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          branch_id: input.branchId,
          food_rating: input.foodRating,
          service_rating: input.serviceRating,
          ambience_rating: input.ambienceRating,
          overall_rating: input.overallRating,
          rating: input.overallRating,
          comment: input.comment,
          status: "new",
        })
        .select("*")
        .single();
      if (error) throw new Error(`Unable to save feedback: ${error.message}`);
      return ok(data, { status: 201 });
    }
    const feedback = createFeedback(input);
    return ok(feedback, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
