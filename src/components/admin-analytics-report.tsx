import { getAnalyticsMetrics } from "@/lib/dining-intelligence";

export function AdminAnalyticsReport() {
  const analytics = getAnalyticsMetrics();
  const metrics = [
    ["Today's Visits", analytics.todayVisits],
    ["Weekly Visits", analytics.weeklyVisits],
    ["Monthly Visits", analytics.monthlyVisits],
    ["Imaara Visits", analytics.imaaraVisits],
    ["Lana Visits", analytics.lanaVisits],
    ["Feedback Conversion", `${analytics.feedbackConversion}%`],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-950">Analytics Intelligence</h2>
        <p className="mt-3 text-sm text-slate-500">QR traffic, discovery behavior, and executive reporting for Robot Cafe branches.</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value]) => (
          <article className="luxury-panel p-5" key={label}>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">{value}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <RankCard title="Top Viewed Items" rows={analytics.topViewedItems} />
        <RankCard title="Most Searched" rows={analytics.mostSearchedItems} />
        <RankCard title="Viewed Categories" rows={analytics.mostViewedCategories} />
        <RankCard title="Popular Devices" rows={analytics.popularDevices} />
        <RankCard title="Popular Browsers" rows={analytics.popularBrowsers} />
        <RankCard title="Peak Visit Times" rows={analytics.peakVisitTimes} />
      </section>
    </div>
  );
}

function RankCard({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(...rows.map(([, value]) => value), 1);
  return (
    <article className="luxury-panel p-5">
      <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
      <div className="mt-5 space-y-4">
        {rows.length ? rows.map(([label, value]) => (
          <div key={label}>
            <div className="flex justify-between gap-4 text-sm">
              <span className="font-semibold text-slate-700">{label}</span>
              <span className="text-gold">{value}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gold" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        )) : <p className="text-sm text-slate-500">No events captured yet.</p>}
      </div>
    </article>
  );
}
