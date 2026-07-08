import { AdminReservationsConsole } from "@/components/admin-reservations-console";
import { listReservations } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const reservations = await listReservations();
  return <AdminReservationsConsole reservations={reservations} />;
}
