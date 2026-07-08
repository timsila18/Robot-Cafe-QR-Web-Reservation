"use client";

import { useEffect, useState } from "react";
import type { AdminMenuItem } from "@/lib/admin-store";
import { futureDiningFeatures } from "@/lib/feature-flags";

type DashboardData = {
  totals: {
    totalMenuItems: number;
    activeItems: number;
    soldOutItems: number;
    featuredItems: number;
    categories: number;
    branches: number;
    feedbackCount: number;
    qrScans: number;
  };
  recentlyUpdatedItems: AdminMenuItem[];
  recentActivity: { id: string; action: string; user: string; entity: string }[];
};

const emptyDashboard: DashboardData = {
  totals: {
    totalMenuItems: 0,
    activeItems: 0,
    soldOutItems: 0,
    featuredItems: 0,
    categories: 0,
    branches: 0,
    feedbackCount: 0,
    qrScans: 0,
  },
  recentlyUpdatedItems: [],
  recentActivity: [],
};

export function AdminDashboardLive() {
  const [data, setData] = useState<DashboardData>(emptyDashboard);
  const [status, setStatus] = useState("Loading live dashboard...");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
        const result = await response.json();
        if (!active) return;
        if (!response.ok) {
          setStatus(result.error ?? "Dashboard could not load.");
          return;
        }
        setData(result.data);
        setStatus(`Live as of ${new Date().toLocaleTimeString()}`);
      } catch {
        if (active) setStatus("Dashboard could not load.");
      }
    };
    void load();
    const timer = window.setInterval(load, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const metrics = [
    ["Total Menu Items", data.totals.totalMenuItems.toString(), "Created menu items across all branches"],
    ["Active Items", data.totals.activeItems.toString(), "Currently visible to QR customers"],
    ["Featured Items", data.totals.featuredItems.toString(), "Promoted in customer discovery"],
    ["Categories", data.totals.categories.toString(), "Menu taxonomy"],
    ["Branches", data.totals.branches.toString(), "Operational branch routes"],
    ["QR Visits", data.totals.qrScans.toString(), "Captured menu and QR events"],
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="premium-text-gradient text-4xl font-semibold">Executive Dashboard</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Live operations view for menu visibility, QR readiness, and Robot Cafe dining activity.
          </p>
        </div>
        <p className="rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gold">{status}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value, helper]) => (
          <article className="luxury-panel overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(8,119,189,.16)]" key={label}>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">{value}</p>
            <p className="mt-3 text-sm text-slate-500">{helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="luxury-panel overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h3 className="text-xl font-semibold text-slate-950">Recently Updated Menu Items</h3>
            <p className="mt-1 text-sm text-slate-500">This table refreshes from the admin API.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Item</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Branch Reach</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.recentlyUpdatedItems.length ? data.recentlyUpdatedItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium text-slate-950">{item.name}</td>
                    <td className="px-5 py-4 text-gold">{formatPrice(item.price)}</td>
                    <td className="px-5 py-4 text-slate-500">{item.availableBranches.join(", ")}</td>
                    <td className="px-5 py-4 text-slate-500">{item.isActive ? "Active" : "Inactive"}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-5 py-12 text-center text-slate-500" colSpan={4}>No menu items yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="luxury-panel p-5">
          <h3 className="text-xl font-semibold text-slate-950">Quick Actions</h3>
          <div className="mt-8 space-y-5">
            {[
              ["Manage menu photos", "/admin/menu"],
              ["Review reservations", "/admin/reservations"],
              ["Download QR codes", "/admin/qr-codes"],
              ["Open analytics", "/admin/analytics"],
            ].map(([label, href]) => (
              <a className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-gold transition hover:border-gold/30 hover:bg-gold/5" href={href} key={label}>{label}</a>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="luxury-panel p-5">
          <h3 className="text-xl font-semibold text-slate-950">Future Dining Modules</h3>
          <div className="mt-5 space-y-3">
            {futureDiningFeatures.map((feature) => (
              <div className="rounded-xl border border-slate-200 bg-white p-4" key={feature.key}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-950">{feature.label}</p>
                  <p className="text-sm font-semibold text-slate-400">Off</p>
                </div>
                <p className="mt-2 text-sm text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="luxury-panel p-5">
          <h3 className="text-xl font-semibold text-slate-950">Recent Admin Activity</h3>
          <div className="mt-5 space-y-3">
            {data.recentActivity.length ? data.recentActivity.slice(0, 5).map((activity) => (
              <div className="rounded-xl border border-slate-200 bg-white p-4" key={activity.id}>
                <p className="font-semibold text-slate-950">{activity.action}</p>
                <p className="mt-1 text-sm text-slate-500">{activity.user} - {activity.entity}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No activity yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(price);
}
