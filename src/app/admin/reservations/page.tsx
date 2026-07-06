import { AdminReservationsConsole } from "@/components/admin-reservations-console";
import { listReservations } from "@/lib/reservations";

export default async function AdminReservationsPage() {
  const reservations = await listReservations();
  return <AdminReservationsConsole reservations={reservations} />;
}

