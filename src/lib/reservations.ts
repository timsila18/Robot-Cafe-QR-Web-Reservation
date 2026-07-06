import { branches } from "@/lib/demo-data";
import type { ReservationInput } from "@/lib/validation";

export type ReservationRecord = ReservationInput & {
  id: string;
  status: "new" | "emailed" | "email_pending" | "email_failed";
  createdAt: string;
};

let reservationStore: ReservationRecord[] = [];

const id = () => `reservation-${crypto.randomUUID()}`;

export function createReservation(input: ReservationInput) {
  const branch = branches.find((entry) => entry.id === input.branchId);
  if (!branch) throw new Error("Select a valid Robot Cafe branch.");

  const reservation: ReservationRecord = {
    ...input,
    id: id(),
    status: "new",
    createdAt: new Date().toISOString(),
  };

  reservationStore = [reservation, ...reservationStore].slice(0, 500);
  return reservation;
}

export function markReservationEmailStatus(reservationId: string, status: ReservationRecord["status"]) {
  let updated: ReservationRecord | undefined;
  reservationStore = reservationStore.map((reservation) => {
    if (reservation.id !== reservationId) return reservation;
    updated = { ...reservation, status };
    return updated;
  });
  if (!updated) throw new Error("Reservation not found.");
  return updated;
}

export function listReservations() {
  return reservationStore;
}

