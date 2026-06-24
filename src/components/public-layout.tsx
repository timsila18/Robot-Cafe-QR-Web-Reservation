import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="luxury-bg min-h-screen w-screen max-w-[100vw] overflow-x-hidden text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/86 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandMark />
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 sm:flex">
            <Link className="transition hover:text-gold" href="/menu">Menu</Link>
            <Link className="transition hover:text-gold" href="/feedback">Feedback</Link>
            <Link className="transition hover:text-gold" href="/admin">Admin</Link>
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
