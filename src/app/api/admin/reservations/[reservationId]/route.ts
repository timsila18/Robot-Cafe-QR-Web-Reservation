import { fail, ok } from "@/lib/api-response";
import { completeReservation } from "@/lib/reservations";

type RouteContext = {
  params: Promise<{ reservationId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { reservationId } = await context.params;
    const body = await request.json();
    if (body.action !== "complete") return fail("Invalid reservation action.", 400);
    return ok(await completeReservation(reservationId));
  } catch (error) {
    return fail(error);
  }
}
