"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { branches } from "@/lib/demo-data";

type FormState = {
  name: string;
  phone: string;
  email: string;
  branchId: string;
  foodRating: number;
  serviceRating: number;
  ambienceRating: number;
  overallRating: number;
  comment: string;
};

const branchIdFromSlug = (slug: string | null) => branches.find((branch) => branch.slug === slug)?.id ?? branches[0]?.id ?? "";

export function FeedbackForm() {
  const params = useSearchParams();
  const initialBranchId = useMemo(() => branchIdFromSlug(params.get("branch")), [params]);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    branchId: initialBranchId,
    foodRating: 5,
    serviceRating: 5,
    ambienceRating: 5,
    overallRating: 5,
    comment: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(result.error ?? "Unable to submit feedback.");
      return;
    }
    setStatus("success");
    setMessage("Thank you. Your feedback has been sent to Robot Cafe leadership.");
    setForm((current) => ({ ...current, comment: "" }));
  };

  return (
    <form className="luxury-panel mx-auto max-w-4xl space-y-6 p-5 sm:p-7" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" value={form.name} onChange={(value) => set("name", value)} />
        <Field label="Phone Number" required value={form.phone} onChange={(value) => set("phone", value)} />
        <Field label="Email (optional)" type="email" value={form.email} onChange={(value) => set("email", value)} />
        <label className="block text-sm font-medium text-slate-700">
          Branch
          <select className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" value={form.branchId} onChange={(event) => set("branchId", event.target.value)}>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name.replace("Robot Cafe - ", "")}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Rating label="Food Rating" value={form.foodRating} onChange={(value) => set("foodRating", value)} />
        <Rating label="Service Rating" value={form.serviceRating} onChange={(value) => set("serviceRating", value)} />
        <Rating label="Ambience Rating" value={form.ambienceRating} onChange={(value) => set("ambienceRating", value)} />
        <Rating label="Overall Rating" value={form.overallRating} onChange={(value) => set("overallRating", value)} />
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Comments
        <textarea className="mt-2 min-h-36 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-gold" required value={form.comment} onChange={(event) => set("comment", event.target.value)} />
      </label>

      {message ? <p className={`rounded-xl px-4 py-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-success"}`}>{message}</p> : null}

      <button className="premium-button w-full sm:w-auto" disabled={status === "submitting"} type="submit">
        {status === "submitting" ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, required, type = "text" }: { label: string; value: string; required?: boolean; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button className={`h-11 rounded-xl border text-sm font-bold transition ${value === rating ? "border-gold bg-gold text-white" : "border-slate-200 bg-white text-slate-500 hover:border-gold/40"}`} key={rating} type="button" onClick={() => onChange(rating)}>
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
}
