export function AdminContentArea({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <div className="luxury-panel rounded-[24px] p-4 sm:p-6">
        {children}
      </div>
    </section>
  );
}
