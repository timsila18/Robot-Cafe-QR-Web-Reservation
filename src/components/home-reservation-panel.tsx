"use client";

import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import type { AdminBranch } from "@/lib/admin-store";

type ReservationDraft = {
  name: string;
  phone: string;
  email: string;
  branchId: string;
  reservationDate: string;
  reservationTime: string;
  guests: number;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

export function HomeReservationPanel({ branches }: { branches: AdminBranch[] }) {
  const [draft, setDraft] = useState<ReservationDraft>({
    name: "",
    phone: "",
    email: "",
    branchId: "",
    reservationDate: today(),
    reservationTime: "19:00",
    guests: 2,
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = <K extends keyof ReservationDraft>(key: K, value: ReservationDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const response = await fetch("/api/reservations", {
      body: JSON.stringify({
        ...draft,
        occasion: "",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const result = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(result.error ?? "Unable to send reservation. Please check the details and try again.");
      return;
    }

    setStatus("success");
    setMessage(
      result.data?.email?.status === "sent"
        ? "Reservation sent. The selected branch has received the request."
        : "Reservation saved. Branch email routing is ready once the email provider is configured.",
    );
    setDraft((current) => ({ ...current, name: "", phone: "", email: "", notes: "" }));
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-20 pt-5 sm:px-8">
      <form
        className="grid gap-5 rounded-[24px] border border-gold/35 bg-black/22 p-5 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-2xl lg:grid-cols-[0.82fr_1.18fr]"
        onSubmit={submit}
      >
        <div className="relative hidden min-h-72 overflow-hidden rounded-2xl border border-[#34b8ff]/20 bg-[radial-gradient(circle_at_50%_50%,rgba(52,184,255,.24),transparent_12rem),linear-gradient(145deg,#02060d,#061827)] lg:block">
          <div className="absolute inset-10 rounded-[36px] border border-[#34b8ff]/25" />
          <div className="absolute inset-20 rounded-[28px] border border-[#34b8ff]/18" />
          <div className="robot-scanline left-0 top-10" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="rounded-3xl border border-[#34b8ff]/45 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,.42)]">
              <BrandMark imageClassName="w-44" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Make a Reservation</h2>
          <p className="mt-2 text-sm font-medium text-[#9fb3c8]">Book your table in seconds. The request routes to the selected branch.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <label className="reservation-field">
              <span>Branch</span>
              <select required value={draft.branchId} onChange={(event) => set("branchId", event.target.value)}>
                <option disabled value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name.replace("Robot Cafe - ", "")}
                  </option>
                ))}
              </select>
            </label>
            <label className="reservation-field">
              <span>Date</span>
              <input min={today()} required type="date" value={draft.reservationDate} onChange={(event) => set("reservationDate", event.target.value)} />
            </label>
            <label className="reservation-field">
              <span>Time</span>
              <input required type="time" value={draft.reservationTime} onChange={(event) => set("reservationTime", event.target.value)} />
            </label>
            <label className="reservation-field">
              <span>Guests</span>
              <input max={40} min={1} required type="number" value={draft.guests} onChange={(event) => set("guests", Number(event.target.value))} />
            </label>
            <label className="reservation-field">
              <span>Name</span>
              <input required placeholder="Guest name" value={draft.name} onChange={(event) => set("name", event.target.value)} />
            </label>
            <label className="reservation-field">
              <span>Phone</span>
              <input required placeholder="07X XXX XXXX" value={draft.phone} onChange={(event) => set("phone", event.target.value)} />
            </label>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1.55fr]">
            <label className="reservation-field">
              <span>Email</span>
              <input placeholder="you@email.com" type="email" value={draft.email} onChange={(event) => set("email", event.target.value)} />
            </label>
            <label className="reservation-field">
              <span>Special Request</span>
              <input placeholder="Any special requests..." value={draft.notes} onChange={(event) => set("notes", event.target.value)} />
            </label>
          </div>

          {message ? (
            <p className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${status === "error" ? "border-red-400/30 bg-red-500/12 text-red-200" : "border-emerald-400/30 bg-emerald-500/12 text-emerald-200"}`}>
              {message}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#9fb3c8]">
              <span className="text-gold">Instant routing</span>
              <span className="text-gold">Branch email alerts</span>
            </div>
            <button className="premium-button" disabled={status === "sending"} type="submit">
              {status === "sending" ? "Sending Request..." : "Reserve Table"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
