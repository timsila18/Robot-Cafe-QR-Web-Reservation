"use client";

import { useMemo, useState } from "react";
import { branchName, roleLabels, type AuditLog } from "@/lib/rbac";

export function AdminAuditLogConsole({ logs }: { logs: AuditLog[] }) {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesQuery = !clean || log.user.toLowerCase().includes(clean) || log.entity.toLowerCase().includes(clean) || log.action.toLowerCase().includes(clean);
      const matchesAction = action === "all" || log.action === action;
      const time = new Date(log.createdAt).getTime();
      const after = !from || time >= new Date(from).getTime();
      const before = !to || time <= new Date(`${to}T23:59:59`).getTime();
      return matchesQuery && matchesAction && after && before;
    });
  }, [action, from, logs, query, to]);

  const exportCsv = () => {
    const header = "Timestamp,User,Role,Branch,Action,Entity,Entity ID,IP Address\n";
    const rows = filtered.map((log) => [log.createdAt, log.user, roleLabels[log.role], branchName(log.branchId), log.action, log.entity, log.entityId, log.ipAddress].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "robot-cafe-audit-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-950">Audit Logs</h2>
          <p className="mt-3 text-sm text-slate-500">Trace critical administrative actions across Robot Cafe.</p>
        </div>
        <button className="premium-button" type="button" onClick={exportCsv}>Export CSV</button>
      </div>
      <section className="luxury-panel grid gap-3 p-4 lg:grid-cols-[1fr_0.8fr_0.6fr_0.6fr]">
        <input className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" placeholder="Search logs" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="h-12 rounded-xl border border-slate-200 px-4" value={action} onChange={(event) => setAction(event.target.value)}>
          <option value="all">All actions</option>
          {[...new Set(logs.map((log) => log.action))].map((entry) => <option key={entry} value={entry}>{entry}</option>)}
        </select>
        <input className="h-12 rounded-xl border border-slate-200 px-4" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input className="h-12 rounded-xl border border-slate-200 px-4" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
      </section>
      <section className="luxury-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr><th className="px-5 py-4">Time</th><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Action</th><th className="px-5 py-4">Entity</th><th className="px-5 py-4">IP</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((log) => (
                <tr key={log.id}><td className="px-5 py-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td><td className="px-5 py-4 font-semibold text-slate-950">{log.user}</td><td className="px-5 py-4 text-slate-600">{roleLabels[log.role]}</td><td className="px-5 py-4 text-gold">{log.action}</td><td className="px-5 py-4 text-slate-600">{log.entity}</td><td className="px-5 py-4 text-slate-500">{log.ipAddress}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
