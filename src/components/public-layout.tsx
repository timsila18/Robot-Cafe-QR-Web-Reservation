import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="robot-site-bg min-h-screen w-screen max-w-[100vw] overflow-x-hidden text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050b12]/96 text-white shadow-[0_16px_50px_rgba(0,0,0,.34)] backdrop-blur-xl">
        <div className="mx-auto hidden w-full max-w-7xl items-center gap-8 px-5 py-5 text-sm text-[#b8d8ff] lg:flex">
          <div className="rounded-md bg-white p-2">
            <BrandMark />
          </div>
          <InfoBlock label="Email:" value="info@robotcafe.co.ke" />
          <InfoBlock label="Branches" value="Lana Plaza | Imaara Mall" />
          <InfoBlock label="Call Us:" value="0769 30 30 30" />
          <InfoBlock label="Open Hours:" value="Mon - Sun, 7:30 AM - 10 PM" />
          <Link className="ml-auto rounded-full border border-[#168df2]/45 bg-[#10243b] px-6 py-3 text-sm font-extrabold tracking-wide text-white transition hover:bg-[#168df2]" href="/menu">
            LIGHT
          </Link>
        </div>
        <div className="border-t border-white/10 bg-black">
          <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
            <div className="rounded-md bg-white p-2 lg:hidden">
              <BrandMark />
            </div>
            <nav className="scrollbar-none flex flex-1 items-center gap-2 overflow-x-auto text-sm font-black text-white sm:gap-5 lg:justify-start">
              <Link className="shrink-0 rounded-md px-4 py-3 transition hover:bg-white/10" href="/menu">Offers</Link>
              <Link className="shrink-0 rounded-md px-4 py-3 transition hover:bg-white/10" href="/menu/imaara-mall">Our Menu</Link>
              <Link className="shrink-0 rounded-md px-4 py-3 transition hover:bg-white/10" href="/feedback">Reviews</Link>
              <Link className="shrink-0 rounded-md px-4 py-3 transition hover:bg-white/10" href="/menu/lana-plaza">About Us</Link>
              <Link className="shrink-0 rounded-md px-4 py-3 transition hover:bg-white/10" href="/admin">My account</Link>
            </nav>
            <Link className="hidden h-20 items-center bg-[#168df2] px-8 text-lg font-black text-white transition hover:bg-[#0877bd] md:flex" href="/feedback">
              Make a reservation
            </Link>
          </div>
        </div>
      </header>
      <div className="text-slate-900">
        {children}
      </div>
    </main>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-white/10 pl-6">
      <p className="text-xl font-black leading-tight text-white">{label}</p>
      <p className="mt-2 max-w-48 text-base font-medium leading-7 text-[#b8d8ff]">{value}</p>
    </div>
  );
}
