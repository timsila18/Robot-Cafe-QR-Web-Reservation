import { AdminReservationsConsole } from "@/components/admin-reservations-console";
import { getSessionAdminUser } from "@/lib/admin-session";
import { listReservations } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const currentUser = await getSessionAdminUser();
  const reservations = await listReservations();
  const visibleReservations =
    currentUser.role === "hostess" && currentUser.branchId
      ? reservations.filter((reservation) => reservation.branchSlug === currentUser.branchId || reservation.branchId === currentUser.branchId)
      : reservations;

  return <AdminReservationsConsole currentUserName={currentUser.name} reservations={visibleReservations} />;
}
