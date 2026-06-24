import { listAdminState } from "@/lib/admin-engine";
import { getAnalyticsMetrics, getFeedbackMetrics } from "@/lib/dining-intelligence";
import { futureDiningFeatures } from "@/lib/feature-flags";

export function AdminDashboard() {
  const state = listAdminState();
  const feedback = getFeedbackMetrics();
  const analytics = getAnalyticsMetrics();
  const metrics = [
    ["Total Menu Items", state.menuItems.length.toString(), "Across all active categories"],
    ["Featured Items", state.menuItems.filter((item) => item.isFeatured).length.toString(), "Promoted on branch menus"],
    ["Best Sellers", state.menuItems.filter((item) => item.isBestSeller).length.toString(), "High-intent discovery items"],
    ["New Arrivals", state.menuItems.filter((item) => item.isNewArrival).length.toString(), "Freshly promoted items"],
    ["Imaara Visibility", state.menuItems.filter((item) => item.availableBranches.includes("imaara-mall")).length.toString(), "Items visible at Imaara Mall"],
    ["Lana Visibility", state.menuItems.filter((item) => item.availableBranches.includes("lana-plaza")).length.toString(), "Items visible at Lana Plaza"],
    ["Feedback Score", feedback.averageRating.toFixed(1), "Average overall guest rating"],
    ["QR Visits", analytics.totalVisits.toString(), "Captured menu and QR events"],
    ["Categories", state.categories.length.toString(), "Active menu taxonomy"],
  ];
  const topItems = [...state.menuItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 7);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-semibold text-slate-950">Executive Dashboard</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          A premium operations foundation for branch menus, digital dining intelligence, and future service modules.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value, helper]) => (
          <article className="luxury-panel p-5" key={label}>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">{value}</p>
            <p className="mt-3 text-sm text-slate-500">{helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="luxury-panel overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h3 className="text-xl font-semibold text-slate-950">Menu Items</h3>
            <p className="mt-1 text-sm text-slate-500">High-value items prepared for customer discovery.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Item</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Branch Reach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {topItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium text-slate-950">{item.name}</td>
                    <td className="px-5 py-4 text-slate-500">{state.categories.find((category) => category.id === item.categoryId)?.name}</td>
                    <td className="px-5 py-4 text-gold">{formatPrice(item.price)}</td>
                    <td className="px-5 py-4 text-slate-500">{item.availableBranches.length === state.branches.length ? "Both branches" : "Single branch"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="luxury-panel p-5">
          <h3 className="text-xl font-semibold text-slate-950">Quick Actions</h3>
          <p className="mt-1 text-sm text-slate-500">Leadership-ready operating shortcuts.</p>
          <div className="mt-8 space-y-5">
            {[
              ["Manage menu photos", "/admin/menu"],
              ["Review feedback", "/admin/feedback"],
              ["Open analytics", "/admin/analytics"],
              ["Download QR codes", "/admin/qr-codes"],
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
            {state.activityLogs.slice(0, 5).map((activity) => (
              <div className="rounded-xl border border-slate-200 bg-white p-4" key={activity.id}>
                <p className="font-semibold text-slate-950">{activity.action}</p>
                <p className="mt-1 text-sm text-slate-500">{activity.user} · {activity.entity}</p>
              </div>
            ))}
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
