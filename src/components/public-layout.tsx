import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="luxury-bg min-h-screen w-screen max-w-[100vw] overflow-x-hidden text-slate-900">
      <header className="premium-header sticky top-0 z-40 border-b px-0 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandMark />
          <nav className="hidden items-center gap-3 text-sm font-semibold text-white/76 sm:flex">
            <Link className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white" href="/menu">Menu</Link>
            <Link className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white" href="/feedback">Feedback</Link>
            <Link className="rounded-full border border-white/15 px-4 py-2 transition hover:border-white/35 hover:bg-white/10 hover:text-white" href="/admin">Admin</Link>
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
