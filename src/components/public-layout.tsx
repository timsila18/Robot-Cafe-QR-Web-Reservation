import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="robot-site-bg min-h-screen w-screen max-w-[100vw] overflow-x-hidden text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#04101c]/92 text-white shadow-[0_16px_50px_rgba(0,0,0,.34)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link className="rounded-md bg-white p-2 shadow-[0_16px_45px_rgba(0,0,0,.25)]" href="/">
            <BrandMark />
          </Link>
          <nav className="scrollbar-none flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto text-sm font-extrabold text-white sm:gap-3">
            <Link className="shrink-0 rounded-full px-4 py-2 transition hover:bg-white/10" href="/menu">Menu</Link>
            <Link className="shrink-0 rounded-full px-4 py-2 transition hover:bg-white/10" href="/menu#branches">Branches</Link>
            <Link className="shrink-0 rounded-full px-4 py-2 transition hover:bg-white/10" href="/feedback">Feedback</Link>
            <Link className="shrink-0 rounded-full border border-[#168df2]/45 bg-[#168df2] px-5 py-2.5 text-white shadow-[0_16px_34px_rgba(8,119,189,.32)] transition hover:bg-[#0877bd]" href="/admin">Admin</Link>
          </nav>
        </div>
      </header>
      <div className="text-slate-900">
        {children}
      </div>
    </main>
  );
}
