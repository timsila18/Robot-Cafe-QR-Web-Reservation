export function EmptyState() {
  return (
    <div className="luxury-panel grid min-h-72 place-items-center p-8 text-center">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-gold">No match found</p>
        <h3 className="mt-4 text-2xl font-semibold text-slate-950">Try another search or category.</h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
          The branch menu is still active. Refine the term and the selection will update instantly.
        </p>
      </div>
    </div>
  );
}
