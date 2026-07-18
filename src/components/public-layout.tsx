import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="robot-site-bg min-h-screen w-screen max-w-[100vw] overflow-x-hidden text-white">
      <header className="sticky top-0 z-40 border-b border-gold/15 bg-[#02060d]/94 text-white shadow-[0_18px_70px_rgba(0,0,0,.48)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link className="shrink-0 rounded-md p-1 transition hover:brightness-125" href="/">
            <BrandMark imageClassName="w-[150px] sm:w-[188px]" />
          </Link>
          <nav className="scrollbar-none flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto text-sm font-extrabold text-white sm:gap-3">
            <Link className="shrink-0 rounded-full px-4 py-2 transition hover:bg-white/10" href="/menu">Menu</Link>
            <Link className="shrink-0 rounded-full px-4 py-2 transition hover:bg-white/10" href="/menu#branches">Branches</Link>
            <Link className="shrink-0 rounded-full px-4 py-2 transition hover:bg-white/10" href="/reservations">Reservations</Link>
            <Link className="shrink-0 rounded-full px-4 py-2 transition hover:bg-white/10" href="/feedback">Feedback</Link>
          </nav>
        </div>
      </header>
      <div className="text-white">
        {children}
      </div>
    </main>
  );
}
