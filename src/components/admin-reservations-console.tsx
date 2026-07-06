import type { ReservationRecord } from "@/lib/reservations";

export function AdminReservationsConsole({ reservations }: { reservations: ReservationRecord[] }) {
  const upcoming = reservations.filter((reservation) => !["cancelled", "completed"].includes(reservation.status));
  const emailed = reservations.filter((reservation) => reservation.emailStatus === "sent").length;
  const pending = reservations.filter((reservation) => reservation.emailStatus !== "sent").length;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="premium-text-gradient text-4xl font-semibold">Reservations</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Branch-routed reservation requests with email delivery status for the Robot Cafe operations team.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total Requests", reservations.length],
          ["Active Queue", upcoming.length],
          ["Emails Sent", emailed],
          ["Needs Email Setup", pending],
        ].map(([label, value]) => (
          <article className="luxury-panel p-5" key={label}>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="luxury-panel overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-xl font-semibold text-slate-950">Reservation Inbox</h3>
          <p className="mt-1 text-sm text-slate-500">Newest requests appear first. Guest contact details stay inside admin.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Guest</th>
                <th className="px-5 py-4">Branch</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Guests</th>
                <th className="px-5 py-4">Email Route</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reservations.length ? reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-950">{reservation.name}</p>
                    <p className="text-slate-500">{reservation.phone}</p>
                    {reservation.email ? <p className="text-slate-500">{reservation.email}</p> : null}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-700">{reservation.branchName}</td>
                  <td className="px-5 py-4 text-slate-600">{reservation.reservationDate} at {reservation.reservationTime}</td>
                  <td className="px-5 py-4 text-slate-600">{reservation.guests}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-950">{reservation.emailRecipient ?? "Not routed"}</p>
                    <p className={reservation.emailStatus === "sent" ? "text-success" : "text-gold"}>{reservation.emailStatus.replaceAll("_", " ")}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{reservation.status.replaceAll("_", " ")}</td>
                  <td className="px-5 py-4 text-slate-500">{reservation.notes || reservation.occasion || "None"}</td>
                </tr>
              )) : (
                <tr>
                  <td className="px-5 py-12 text-center text-slate-500" colSpan={7}>No reservations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

