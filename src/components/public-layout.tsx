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
            <Link className="shrink-0 rounded-full px-4 py-2 transition hover:bg-white/10" href="/#branches">Branches</Link>
            <Link className="shrink-0 rounded-full px-4 py-2 transition hover:bg-white/10" href="/reservations">Reserve</Link>
            <Link className="shrink-0 rounded-full px-4 py-2 transition hover:bg-white/10" href="/feedback">Feedback</Link>
            <Link
              aria-label="Admin login"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/30 bg-white/5 text-gold shadow-[0_14px_34px_rgba(0,0,0,.24)] transition hover:border-gold hover:bg-gold/12"
              href="/admin/login"
              title="Admin login"
            >
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="2" />
                <path d="M5.5 20c1.2-3.6 3.3-5.4 6.5-5.4s5.3 1.8 6.5 5.4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </Link>
          </nav>
        </div>
      </header>
      <div className="text-white">
        {children}
      </div>
    </main>
  );
}
