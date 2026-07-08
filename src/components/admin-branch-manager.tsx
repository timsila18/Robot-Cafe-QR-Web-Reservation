"use client";

import { useState } from "react";
import type { AdminBranch } from "@/lib/admin-store";

export function AdminBranchManager({ initialBranches }: { initialBranches: AdminBranch[] }) {
  const [branches, setBranches] = useState(initialBranches);
  const [editing, setEditing] = useState<AdminBranch | null>(null);
  const [toast, setToast] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const save = async (branch: AdminBranch) => {
    const response = await fetch(`/api/admin/branches/${branch.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(branch),
    });
    const payload = await response.json();
    if (!response.ok) {
      notify(payload.error ?? "Unable to update branch.");
      return;
    }
    setBranches((current) => current.map((item) => (item.id === branch.id ? payload.data : item)));
    setEditing(null);
    notify("Branch updated.");
  };

  return (
    <div className="space-y-6">
      {toast ? <div className="fixed right-5 top-24 z-50 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div> : null}
      <div>
        <h2 className="text-3xl font-semibold text-slate-950">Branches</h2>
        <p className="mt-2 text-sm text-slate-500">Update contacts, hours, locations, and activation state. Branches cannot be deleted.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {branches.map((branch) => (
          <article className="luxury-panel p-6" key={branch.id}>
            <p className="text-xs uppercase tracking-[0.24em] text-gold">{branch.isActive ? "Active Branch" : "Inactive Branch"}</p>
            <h3 className="mt-4 text-3xl font-semibold text-slate-950">{branch.name.replace("Robot Cafe - ", "")}</h3>
            <p className="mt-3 text-sm text-slate-500">{branch.location}</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</dt><dd className="mt-2 text-sm text-slate-950">{branch.phone}</dd></div>
              <div><dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</dt><dd className="mt-2 text-sm text-slate-950">{branch.email}</dd></div>
              <div><dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Hours</dt><dd className="mt-2 text-sm text-slate-950">{branch.openingHours}</dd></div>
              <div><dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Route</dt><dd className="mt-2 text-sm text-slate-950">/menu/{branch.slug}</dd></div>
            </dl>
            <div className="mt-7 flex gap-3">
              <button className="premium-button" type="button" onClick={() => setEditing(branch)}>Edit Branch</button>
              <button className="ghost-button" type="button" onClick={() => save({ ...branch, isActive: !branch.isActive })}>{branch.isActive ? "Deactivate" : "Activate"}</button>
            </div>
          </article>
        ))}
      </div>
      {editing ? <BranchEditor branch={editing} onClose={() => setEditing(null)} onSave={save} /> : null}
    </div>
  );
}

function BranchEditor({ branch, onClose, onSave }: { branch: AdminBranch; onClose: () => void; onSave: (branch: AdminBranch) => void }) {
  const [draft, setDraft] = useState(branch);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-2xl font-semibold text-slate-950">Edit Branch</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(["name", "location", "phone", "email", "openingHours"] as const).map((key) => (
            <label className="text-sm font-medium text-slate-700" key={key}>
              {key.replace(/([A-Z])/g, " $1")}
              <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
            </label>
          ))}
          <label className="flex items-center gap-3 text-sm text-slate-700"><input checked={draft.isActive} type="checkbox" onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Active</label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="ghost-button" type="button" onClick={onClose}>Cancel</button>
          <button className="premium-button" type="button" onClick={() => onSave(draft)}>Save Branch</button>
        </div>
      </div>
    </div>
  );
}
