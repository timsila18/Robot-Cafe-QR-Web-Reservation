import { branches } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ReservationInput } from "@/lib/validation";

export type ReservationRecord = ReservationInput & {
  id: string;
  branchSlug: string;
  branchName: string;
  status: "new" | "emailed" | "email_pending" | "email_failed" | "confirmed" | "cancelled" | "completed";
  emailRecipient?: string;
  emailStatus: "not_sent" | "sent" | "not_configured" | "failed";
  emailMessage?: string;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
};

let reservationStore: ReservationRecord[] = [];

const id = () => `reservation-${crypto.randomUUID()}`;

type EmailPatch = {
  status: ReservationRecord["status"];
  emailRecipient?: string;
  emailStatus: ReservationRecord["emailStatus"];
  emailMessage?: string;
  emailSentAt?: string;
};

const toRecord = (row: Record<string, unknown>): ReservationRecord => ({
  id: String(row.id),
  name: String(row.name),
  phone: String(row.phone),
  email: String(row.email ?? ""),
  branchId: String(row.branch_id),
  branchSlug: String(row.branch_slug),
  branchName: String(row.branch_name),
  reservationDate: String(row.reservation_date),
  reservationTime: String(row.reservation_time).slice(0, 5),
  guests: Number(row.guests),
  occasion: String(row.occasion ?? ""),
  notes: String(row.notes ?? ""),
  status: row.status as ReservationRecord["status"],
  emailRecipient: row.email_recipient ? String(row.email_recipient) : undefined,
  emailStatus: row.email_status as ReservationRecord["emailStatus"],
  emailMessage: row.email_message ? String(row.email_message) : undefined,
  emailSentAt: row.email_sent_at ? String(row.email_sent_at) : undefined,
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
});

export async function createReservation(input: ReservationInput) {
  const branch = branches.find((entry) => entry.id === input.branchId);
  if (!branch) throw new Error("Select a valid Robot Cafe branch.");

  const reservation: ReservationRecord = {
    ...input,
    id: id(),
    branchSlug: branch.slug,
    branchName: branch.name.replace("Robot Cafe - ", ""),
    status: "new",
    emailStatus: "not_sent",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        name: reservation.name,
        phone: reservation.phone,
        email: reservation.email || null,
        branch_id: reservation.branchId,
        branch_slug: reservation.branchSlug,
        branch_name: reservation.branchName,
        reservation_date: reservation.reservationDate,
        reservation_time: reservation.reservationTime,
        guests: reservation.guests,
        occasion: reservation.occasion || null,
        notes: reservation.notes || null,
        status: reservation.status,
        email_status: reservation.emailStatus,
      })
      .select("*")
      .single();

    if (error) {
      if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error(`Reservation persistence failed: ${error.message}`);
    } else {
      return toRecord(data);
    }
  }

  reservationStore = [reservation, ...reservationStore].slice(0, 500);
  return reservation;
}

export async function markReservationEmailStatus(reservationId: string, patch: EmailPatch) {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("reservations")
      .update({
        status: patch.status,
        email_recipient: patch.emailRecipient ?? null,
        email_status: patch.emailStatus,
        email_message: patch.emailMessage ?? null,
        email_sent_at: patch.emailSentAt ?? null,
      })
      .eq("id", reservationId)
      .select("*")
      .single();

    if (error) {
      if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error(`Reservation email status update failed: ${error.message}`);
    } else {
      return toRecord(data);
    }
  }

  let updated: ReservationRecord | undefined;
  reservationStore = reservationStore.map((reservation) => {
    if (reservation.id !== reservationId) return reservation;
    updated = { ...reservation, ...patch, updatedAt: new Date().toISOString() };
    return updated;
  });
  if (!updated) throw new Error("Reservation not found.");
  return updated;
}

export async function listReservations() {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error(`Unable to load reservations: ${error.message}`);
    } else {
      return data.map(toRecord);
    }
  }

  return reservationStore;
}
