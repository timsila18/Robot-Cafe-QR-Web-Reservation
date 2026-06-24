"use client";

import { useMemo, useState } from "react";
import type { FeedbackRecord } from "@/lib/dining-intelligence";
import type { Branch } from "@/lib/demo-data";

export function AdminFeedbackConsole({ initialFeedback, branches }: { initialFeedback: FeedbackRecord[]; branches: Branch[] }) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return feedback.filter((entry) => {
      const branch = branches.find((candidate) => candidate.id === entry.branchId);
      const matchesQuery = !clean || entry.name.toLowerCase().includes(clean) || entry.comment.toLowerCase().includes(clean) || branch?.name.toLowerCase().includes(clean);
      const matchesStatus = status === "all" || entry.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [branches, feedback, query, status]);

  const average = feedback.length ? feedback.reduce((sum, entry) => sum + entry.overallRating, 0) / feedback.length : 0;
  const byBranch = branches.map((branch) => {
    const rows = feedback.filter((entry) => entry.branchId === branch.id);
    return [branch.name.replace("Robot Cafe - ", ""), rows.length ? rows.reduce((sum, entry) => sum + entry.overallRating, 0) / rows.length : 0, rows.length] as const;
  });

  const patchStatus = async (feedbackId: string, nextStatus: FeedbackRecord["status"]) => {
    const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const result = await response.json();
    if (response.ok) {
      setFeedback((current) => current.map((entry) => (entry.id === feedbackId ? result.data : entry)));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-950">Feedback Intelligence</h2>
        <p className="mt-3 text-sm text-slate-500">Food, service, ambience, and overall guest signals from Robot Cafe digital dining.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total Feedback" value={String(feedback.length)} />
        <Metric label="Average Rating" value={average.toFixed(1)} />
        <Metric label="Food Rating" value={avg(feedback, "foodRating").toFixed(1)} />
        <Metric label="Service Rating" value={avg(feedback, "serviceRating").toFixed(1)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="luxury-panel p-5">
          <h3 className="text-xl font-semibold text-slate-950">Branch Ratings</h3>
          <div className="mt-5 space-y-4">
            {byBranch.map(([label, rating, count]) => (
              <div key={label}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="text-success">{rating.toFixed(1)} · {count} responses</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-success" style={{ width: `${(rating / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="luxury-panel p-5">
          <h3 className="text-xl font-semibold text-slate-950">Rating Mix</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <RatingBlock label="Food" value={avg(feedback, "foodRating")} />
            <RatingBlock label="Ambience" value={avg(feedback, "ambienceRating")} />
            <RatingBlock label="Overall" value={avg(feedback, "overallRating")} />
          </div>
        </div>
      </section>

      <section className="luxury-panel grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
        <input className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" placeholder="Search feedback" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="h-12 rounded-xl border border-slate-200 px-4" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="archived">Archived</option>
        </select>
      </section>

      <section className="grid gap-4">
        {filtered.map((entry) => {
          const branch = branches.find((candidate) => candidate.id === entry.branchId);
          return (
            <article className="luxury-panel p-5" key={entry.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gold">{branch?.name.replace("Robot Cafe - ", "")} · {entry.status}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">{entry.name || "Guest"} · {entry.overallRating}/5</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{entry.comment}</p>
                  <p className="mt-3 text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="ghost-button min-h-10 px-3" type="button" onClick={() => void patchStatus(entry.id, "reviewed")}>Mark Reviewed</button>
                  <button className="ghost-button min-h-10 px-3 text-red-600" type="button" onClick={() => void patchStatus(entry.id, "archived")}>Archive</button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="luxury-panel p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-4 text-4xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}

function RatingBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-gold">{value.toFixed(1)}</p>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gold" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  );
}

function avg(feedback: FeedbackRecord[], field: "foodRating" | "serviceRating" | "ambienceRating" | "overallRating") {
  return feedback.length ? feedback.reduce((sum, entry) => sum + entry[field], 0) / feedback.length : 0;
}
