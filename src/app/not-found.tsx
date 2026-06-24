import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <main className="luxury-bg grid min-h-screen place-items-center px-5 text-slate-900">
      <section className="luxury-panel max-w-xl p-8 text-center">
        <div className="flex justify-center"><BrandMark /></div>
        <p className="mt-8 text-sm uppercase tracking-[0.28em] text-gold">404</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">This Robot Cafe page is not available</h1>
        <p className="mt-4 text-sm leading-6 text-slate-500">The route may have moved, or the QR destination may be inactive.</p>
        <Link className="premium-button mt-6" href="/menu">Back to Menu</Link>
      </section>
    </main>
  );
}
