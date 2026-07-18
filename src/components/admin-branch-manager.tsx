"use client";

import { useState } from "react";
import type { AdminBranch } from "@/lib/admin-store";
import { canUseDemoPersistence, readDemoBranches, saveDemoBranches } from "@/lib/demo-persistence";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const emptyBranch = (): AdminBranch => ({
  id: "",
  name: "",
  slug: "",
  location: "",
  phone: "",
  email: "",
  openingHours: "8:00 AM - 10:00 PM",
  isActive: true,
  updatedAt: new Date().toISOString(),
});

export function AdminBranchManager({ initialBranches }: { initialBranches: AdminBranch[] }) {
  const [branches, setBranches] = useState(() => readDemoBranches(initialBranches));
  const [editing, setEditing] = useState<AdminBranch | null>(null);
  const [toast, setToast] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const persistBranches = (nextBranches: AdminBranch[]) => {
    setBranches(nextBranches);
    saveDemoBranches(nextBranches);
  };

  const saveDemoBranch = (branch: AdminBranch, message?: string) => {
    const isNew = !branch.id;
    const savedBranch = {
      ...branch,
      id: isNew ? uniqueBranchId(branches, branch.slug || branch.name) : branch.id,
      slug: slugify(branch.slug || branch.name),
      updatedAt: new Date().toISOString(),
    };
    const nextBranches = isNew ? [savedBranch, ...branches] : branches.map((item) => (item.id === branch.id ? savedBranch : item));
    persistBranches(nextBranches);
    setEditing(null);
    notify(message ?? (isNew ? "Branch created in demo storage." : "Branch updated in demo storage."));
  };

  const save = async (branch: AdminBranch) => {
    const isNew = !branch.id;
    setIsSaving(true);
    try {
      const response = await fetch(isNew ? "/api/admin/branches" : `/api/admin/branches/${branch.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branch),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (canUseDemoPersistence(payload.error)) {
          saveDemoBranch(branch, `${isNew ? "Created" : "Saved"} locally for this Vercel demo.`);
          return;
        }
        notify(payload.error ?? `Unable to ${isNew ? "create" : "update"} branch.`);
        return;
      }
      const nextBranches = isNew ? [payload.data, ...branches] : branches.map((item) => (item.id === branch.id ? payload.data : item));
      persistBranches(nextBranches);
      setEditing(null);
      notify(isNew ? "Branch created." : "Branch updated.");
    } catch (error) {
      if (canUseDemoPersistence(error)) {
        saveDemoBranch(branch, `${isNew ? "Created" : "Saved"} locally for this local demo.`);
        return;
      }
      notify(`Unable to ${isNew ? "create" : "update"} branch. Please check your connection and try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast ? <div className="fixed right-5 top-24 z-50 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-950">Branches</h2>
          <p className="mt-2 text-sm text-slate-500">Create branches and update contacts, hours, locations, routes, and activation state.</p>
        </div>
        <button className="premium-button" type="button" onClick={() => setEditing(emptyBranch())}>Add Branch</button>
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
              <button className="ghost-button" disabled={isSaving} type="button" onClick={() => void save({ ...branch, isActive: !branch.isActive })}>{branch.isActive ? "Deactivate" : "Activate"}</button>
            </div>
          </article>
        ))}
      </div>
      {editing ? <BranchEditor branch={editing} isSaving={isSaving} onClose={() => setEditing(null)} onSave={save} /> : null}
    </div>
  );
}

function BranchEditor({
  branch,
  isSaving,
  onClose,
  onSave,
}: {
  branch: AdminBranch;
  isSaving: boolean;
  onClose: () => void;
  onSave: (branch: AdminBranch) => void;
}) {
  const [draft, setDraft] = useState(branch);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto flex min-h-full w-full max-w-2xl items-start sm:items-center">
        <div className="my-4 max-h-[calc(100svh-2rem)] w-full overflow-y-auto rounded-2xl border border-gold/20 bg-[#06111f] p-5 text-white shadow-2xl sm:my-8 sm:max-h-[calc(100svh-4rem)] sm:p-6">
          <h3 className="text-2xl font-semibold text-white">{draft.id ? "Edit Branch" : "Add Branch"}</h3>
          <p className="mt-2 text-sm text-[#9fb3c8]">Branch details power QR routes, reservations, and admin filtering.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#d7e7f8]">
              Name
              <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value, slug: draft.slug || slugify(event.target.value) })} />
            </label>
            <label className="text-sm font-medium text-[#d7e7f8]">
              Slug
              <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" required value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })} />
            </label>
            <label className="text-sm font-medium text-[#d7e7f8]">
              Location
              <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" required value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
            </label>
            <label className="text-sm font-medium text-[#d7e7f8]">
              Phone
              <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
            </label>
            <label className="text-sm font-medium text-[#d7e7f8]">
              Email
              <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
            </label>
            <label className="text-sm font-medium text-[#d7e7f8]">
              Opening Hours
              <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" value={draft.openingHours} onChange={(event) => setDraft({ ...draft, openingHours: event.target.value })} />
            </label>
            <label className="flex items-center gap-3 text-sm text-[#d7e7f8]"><input checked={draft.isActive} type="checkbox" onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Active</label>
          </div>
          <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-white/10 bg-[#06111f]/95 px-5 pb-1 pt-4 backdrop-blur sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
            <button className="ghost-button" disabled={isSaving} type="button" onClick={onClose}>Cancel</button>
            <button className="premium-button" disabled={isSaving} type="button" onClick={() => void onSave(draft)}>{isSaving ? "Saving..." : "Save Branch"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function uniqueBranchId(branches: AdminBranch[], value: string) {
  const base = `branch-${slugify(value) || "new"}`;
  if (!branches.some((branch) => branch.id === base)) return base;
  return `${base}-${branches.length + 1}`;
}
