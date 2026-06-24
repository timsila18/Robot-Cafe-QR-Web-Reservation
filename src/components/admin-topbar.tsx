import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/86 px-5 py-4 shadow-sm backdrop-blur-xl sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gold">ROBOT CAFE</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-950">Operations Command</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Link className="ghost-button min-h-11 px-4" href="/menu">View Menu</Link>
          <Link className="premium-button min-h-11 px-4" href="/menu/imaara-mall">Imaara QR</Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
