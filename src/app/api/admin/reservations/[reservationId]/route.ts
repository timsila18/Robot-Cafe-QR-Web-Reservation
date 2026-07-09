import { fail, ok } from "@/lib/api-response";
import { getSessionAdminUser } from "@/lib/admin-session";
import { completeReservation, listReservations } from "@/lib/reservations";

type RouteContext = {
  params: Promise<{ reservationId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { reservationId } = await context.params;
    const body = await request.json();
    if (body.action !== "complete") return fail("Invalid reservation action.", 400);
    const currentUser = await getSessionAdminUser();
    if (currentUser.role === "hostess") {
      const reservation = (await listReservations()).find((entry) => entry.id === reservationId);
      if (!reservation) return fail("Reservation not found.", 404);
      if (!currentUser.branchId || (reservation.branchSlug !== currentUser.branchId && reservation.branchId !== currentUser.branchId)) {
        return fail("This reservation belongs to another branch.", 403);
      }
    }
    return ok(await completeReservation(reservationId));
  } catch (error) {
    return fail(error);
  }
}
