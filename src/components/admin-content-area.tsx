export function AdminContentArea({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <div className="rounded-[24px] border border-white/55 bg-white/82 p-4 shadow-[0_30px_90px_rgba(7,24,39,.16)] backdrop-blur-2xl sm:p-6">
        {children}
      </div>
    </section>
  );
}
