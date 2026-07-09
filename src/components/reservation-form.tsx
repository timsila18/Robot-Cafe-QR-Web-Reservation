"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminBranch } from "@/lib/admin-store";

type FormState = {
  name: string;
  phone: string;
  email: string;
  branchId: string;
  reservationDate: string;
  reservationTime: string;
  guests: number;
  occasion: string;
  notes: string;
};

const branchIdFromSlug = (branches: AdminBranch[], slug: string | null) => branches.find((branch) => branch.slug === slug)?.id ?? branches[0]?.id ?? "";

const today = () => new Date().toISOString().slice(0, 10);

export function ReservationForm({ branches }: { branches: AdminBranch[] }) {
  const params = useSearchParams();
  const initialBranchId = useMemo(() => branchIdFromSlug(branches, params.get("branch")), [branches, params]);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    branchId: initialBranchId,
    reservationDate: today(),
    reservationTime: "19:00",
    guests: 2,
    occasion: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(result.error ?? "Unable to submit reservation.");
      return;
    }

    setStatus("success");
    const emailStatus = result.data?.email?.status;
    setMessage(
      emailStatus === "sent"
        ? "Reservation received. The selected branch has been emailed."
        : "Reservation received. Email routing is ready, but the email provider is not configured yet.",
    );
    setForm((current) => ({ ...current, name: "", phone: "", email: "", notes: "", occasion: "" }));
  };

  return (
    <form className="luxury-panel mx-auto max-w-4xl space-y-6 p-5 sm:p-7" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required value={form.name} onChange={(value) => set("name", value)} />
        <Field label="Phone Number" required value={form.phone} onChange={(value) => set("phone", value)} />
        <Field label="Email (optional)" type="email" value={form.email} onChange={(value) => set("email", value)} />
        <label className="block text-sm font-medium text-slate-700">
          Branch
          <select className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" value={form.branchId} onChange={(event) => set("branchId", event.target.value)}>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name.replace("Robot Cafe - ", "")}</option>)}
          </select>
        </label>
        <Field label="Date" min={today()} required type="date" value={form.reservationDate} onChange={(value) => set("reservationDate", value)} />
        <Field label="Time" required type="time" value={form.reservationTime} onChange={(value) => set("reservationTime", value)} />
        <Field label="Guests" max="40" min="1" required type="number" value={String(form.guests)} onChange={(value) => set("guests", Number(value))} />
        <Field label="Occasion (optional)" value={form.occasion} onChange={(value) => set("occasion", value)} />
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Notes
        <textarea className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-gold" value={form.notes} onChange={(event) => set("notes", event.target.value)} />
      </label>

      {message ? <p className={`rounded-xl px-4 py-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-success"}`}>{message}</p> : null}

      <button className="premium-button w-full sm:w-auto" disabled={status === "submitting"} type="submit">
        {status === "submitting" ? "Sending..." : "Request Reservation"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  min,
  max,
}: {
  label: string;
  value: string;
  required?: boolean;
  type?: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" max={max} min={min} required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
