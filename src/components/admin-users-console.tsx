"use client";

import { useMemo, useState } from "react";
import { branches } from "@/lib/demo-data";
import { branchName, roleLabels, type AdminRole, type AdminUser } from "@/lib/rbac";

const pageSize = 8;

export function AdminUsersConsole({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery = !clean || user.name.toLowerCase().includes(clean) || user.email.toLowerCase().includes(clean);
      const matchesRole = role === "all" || user.role === role;
      return matchesQuery && matchesRole;
    });
  }, [query, role, users]);

  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const save = async (user: AdminUser) => {
    const isNew = user.id === "new";
    const response = await fetch(isNew ? "/api/admin/users" : `/api/admin/users/${user.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const result = await response.json();
    if (!response.ok) {
      notify(result.error ?? "Unable to save user.");
      return;
    }
    setUsers((current) => isNew ? [result.data, ...current] : current.map((entry) => (entry.id === user.id ? result.data : entry)));
    setEditing(null);
    notify(isNew ? "User created." : "User updated.");
  };

  const patch = async (user: AdminUser, patchValue: Partial<AdminUser> | { action: "reset-password" }, message: string) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchValue),
    });
    const result = await response.json();
    if (!response.ok) {
      notify(result.error ?? "Unable to update user.");
      return;
    }
    if (response.ok && !("action" in patchValue)) {
      setUsers((current) => current.map((entry) => (entry.id === user.id ? result.data : entry)));
    }
    notify(message);
  };

  return (
    <div className="space-y-6">
      {toast ? <div className="fixed right-5 top-24 z-50 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-950">User Management</h2>
          <p className="mt-3 text-sm text-slate-500">Role-based access for Robot Cafe operations teams.</p>
        </div>
        <button className="premium-button" type="button" onClick={() => setEditing({ id: "new", name: "", email: "", role: "content_manager", status: "active", createdAt: new Date().toISOString() })}>Create User</button>
      </div>

      <section className="luxury-panel grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
        <input className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" placeholder="Search users" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="h-12 rounded-xl border border-slate-200 px-4" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="all">All roles</option>
          {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </section>

      <section className="luxury-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Branch</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Last Login</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visible.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4"><p className="font-semibold text-slate-950">{user.name}</p><p className="text-slate-500">{user.email}</p></td>
                  <td className="px-5 py-4 text-slate-600">{roleLabels[user.role]}</td>
                  <td className="px-5 py-4 text-slate-600">{branchName(user.branchId)}</td>
                  <td className="px-5 py-4 text-slate-600">{user.status}</td>
                  <td className="px-5 py-4 text-slate-600">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button className="text-gold" type="button" onClick={() => setEditing(user)}>Edit</button>
                      <button className="text-slate-500" type="button" onClick={() => void patch(user, { status: user.status === "active" ? "inactive" : "active" }, user.status === "active" ? "User deactivated." : "User reactivated.")}>{user.status === "active" ? "Deactivate" : "Reactivate"}</button>
                      <button className="text-slate-500" type="button" onClick={() => void patch(user, { action: "reset-password" }, "Temporary password generated: RobotCafe@2026")}>Reset Password</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Page {page} of {pageCount}</p>
        <div className="flex gap-2">
          <button className="ghost-button min-h-10 px-3" disabled={page === 1} type="button" onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <button className="ghost-button min-h-10 px-3" disabled={page === pageCount} type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
        </div>
      </div>

      {editing ? <UserEditor user={editing} onClose={() => setEditing(null)} onSave={save} /> : null}
    </div>
  );
}

function UserEditor({ user, onSave, onClose }: { user: AdminUser; onSave: (user: AdminUser) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(user);
  const set = <K extends keyof AdminUser>(key: K, value: AdminUser[K]) => setDraft((current) => ({ ...current, [key]: value }));
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between"><h3 className="text-2xl font-semibold text-slate-950">{draft.id === "new" ? "Create User" : "Edit User"}</h3><button className="ghost-button min-h-10 px-3" type="button" onClick={onClose}>Close</button></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={draft.name} onChange={(value) => set("name", value)} />
          <Field label="Email" value={draft.email} onChange={(value) => set("email", value)} />
          <label className="block text-sm font-medium text-slate-700">Role<select className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" value={draft.role} onChange={(event) => set("role", event.target.value as AdminRole)}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm font-medium text-slate-700">Branch<select className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" value={draft.branchId ?? ""} onChange={(event) => set("branchId", event.target.value || undefined)}><option value="">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name.replace("Robot Cafe - ", "")}</option>)}</select></label>
        </div>
        <div className="mt-6 flex justify-end gap-3"><button className="ghost-button" type="button" onClick={onClose}>Cancel</button><button className="premium-button" type="button" onClick={() => onSave(draft)}>Save User</button></div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
