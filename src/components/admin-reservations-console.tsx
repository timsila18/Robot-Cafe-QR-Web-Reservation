"use client";

import { useState } from "react";
import type { ReservationRecord } from "@/lib/reservations";

export function AdminReservationsConsole({ reservations }: { reservations: ReservationRecord[] }) {
  const [rows, setRows] = useState(reservations);
  const [toast, setToast] = useState("");
  const upcoming = rows.filter((reservation) => !["cancelled", "completed", "expired"].includes(reservation.status));
  const emailed = rows.filter((reservation) => reservation.emailStatus === "sent").length;
  const pending = rows.filter((reservation) => reservation.emailStatus !== "sent").length;

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const complete = async (reservationId: string) => {
    const response = await fetch(`/api/admin/reservations/${reservationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    });
    const result = await response.json();
    if (!response.ok) {
      notify(result.error ?? "Unable to complete reservation.");
      return;
    }
    setRows((current) => current.map((reservation) => (reservation.id === reservationId ? result.data : reservation)));
    notify("Reservation booked and executed.");
  };

  return (
    <div className="space-y-6">
      {toast ? <div className="fixed right-5 top-24 z-50 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div> : null}
      <section>
        <h2 className="premium-text-gradient text-4xl font-semibold">Reservations</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Branch-routed reservation requests with email delivery status for the Robot Cafe operations team.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Requests", rows.length],
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
              {rows.length ? rows.map((reservation) => (
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
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusClass(reservation.status)}`}>
                      {reservation.status.replaceAll("_", " ")}
                    </span>
                    {!["cancelled", "completed", "expired"].includes(reservation.status) ? (
                      <button className="ghost-button mt-3 min-h-9 px-3 text-xs" type="button" onClick={() => void complete(reservation.id)}>
                        Reservation booked and executed
                      </button>
                    ) : null}
                  </td>
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

function statusClass(status: ReservationRecord["status"]) {
  if (status === "completed") return "bg-emerald-50 text-success";
  if (status === "expired" || status === "cancelled") return "bg-red-50 text-red-700";
  if (status === "email_failed" || status === "email_pending") return "bg-amber-50 text-gold";
  return "bg-sky-50 text-[#0877bd]";
}
