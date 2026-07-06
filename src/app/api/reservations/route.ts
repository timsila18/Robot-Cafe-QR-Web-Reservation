import { fail, ok } from "@/lib/api-response";
import { sendReservationEmail } from "@/lib/email/reservation-email";
import { createReservation, markReservationEmailStatus } from "@/lib/reservations";
import { reservationSchema } from "@/lib/validation";

export const runtime = "nodejs";

const reservationAttempts = new Map<string, { count: number; resetAt: number }>();
const windowMs = 10 * 60 * 1000;
const maxAttempts = 5;

function checkRateLimit(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const current = reservationAttempts.get(ip);
  if (!current || current.resetAt <= now) {
    reservationAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= maxAttempts) {
    throw new Error("Too many reservation attempts. Please wait a few minutes and try again.");
  }
  current.count += 1;
}

export async function POST(request: Request) {
  try {
    checkRateLimit(request);
    const reservation = await createReservation(reservationSchema.parse(await request.json()));
    const email = await sendReservationEmail(reservation);
    const status =
      email.status === "sent"
        ? "emailed"
        : email.status === "failed"
          ? "email_failed"
          : "email_pending";
    const updated = await markReservationEmailStatus(reservation.id, {
      status,
      emailRecipient: email.recipient,
      emailStatus: email.status === "sent" ? "sent" : email.status,
      emailMessage: email.message,
      emailSentAt: email.sentAt,
    });
    return ok({ reservation: updated, email }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
