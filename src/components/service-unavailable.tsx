import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function ServiceUnavailable({ message = "Live data is taking longer than expected." }: { message?: string }) {
  return (
    <main className="grid min-h-[70svh] place-items-center px-5 text-white">
      <section className="luxury-panel w-full max-w-xl p-8 text-center">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.28em] text-gold">Robot Cafe Recovery Mode</p>
        <h1 className="mt-3 text-4xl font-black text-white">We are keeping the experience alive.</h1>
        <p className="mt-4 text-sm font-medium leading-7 text-[#d7e7f8]">{message}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="premium-button" href="/menu">Try Menu Again</Link>
          <Link className="ghost-button" href="/reservations">Make Reservation</Link>
        </div>
      </section>
    </main>
  );
}
