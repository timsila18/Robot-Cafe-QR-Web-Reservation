import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export function AdminTopbar() {
  return (
    <header className="premium-header sticky top-0 z-30 border-b px-5 py-4 text-white backdrop-blur-xl sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">ROBOT CAFE</p>
          <h1 className="mt-1 text-xl font-semibold text-white">Operations Command</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Link className="ghost-button min-h-11 border-white/15 bg-white/10 px-4 text-white hover:bg-white/15" href="/menu">View Menu</Link>
          <Link className="premium-button min-h-11 px-4" href="/menu/imaara-mall">Imaara QR</Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
