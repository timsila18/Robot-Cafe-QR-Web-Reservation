export function AvailabilityBadge({ isSoldOut }: { isSoldOut: boolean }) {
  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${isSoldOut ? "border-slate-200 bg-slate-100 text-slate-500" : "border-success/20 bg-success/10 text-success"}`}>
      {isSoldOut ? "Sold Out" : "Available"}
    </span>
  );
}

export function FeaturedBadge() {
  return <span className="rounded-md bg-gold px-2.5 py-1 text-xs font-bold text-white">Featured</span>;
}

export function StatusBadge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-slate-200 bg-white/85 px-2.5 py-1 text-xs font-semibold text-slate-600">{children}</span>;
}
