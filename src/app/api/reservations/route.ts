import { fail, ok } from "@/lib/api-response";
import { sendReservationEmail } from "@/lib/email/reservation-email";
import { createReservation, markReservationEmailStatus } from "@/lib/reservations";
import { reservationSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const reservation = createReservation(reservationSchema.parse(await request.json()));
    const email = await sendReservationEmail(reservation);
    const status =
      email.status === "sent"
        ? "emailed"
        : email.status === "failed"
          ? "email_failed"
          : "email_pending";
    const updated = markReservationEmailStatus(reservation.id, status);
    return ok({ reservation: updated, email }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
