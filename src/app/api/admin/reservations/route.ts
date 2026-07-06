import { fail, ok } from "@/lib/api-response";
import { listReservations } from "@/lib/reservations";

export async function GET() {
  try {
    return ok(await listReservations());
  } catch (error) {
    return fail(error);
  }
}

