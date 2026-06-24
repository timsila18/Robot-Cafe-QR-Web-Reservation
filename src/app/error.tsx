"use client";

import { BrandMark } from "@/components/brand-mark";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="luxury-bg grid min-h-screen place-items-center px-5 text-slate-900">
      <section className="luxury-panel max-w-xl p-8 text-center">
        <div className="flex justify-center"><BrandMark /></div>
        <p className="mt-8 text-sm uppercase tracking-[0.28em] text-gold">Recovery</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Robot Cafe hit a temporary issue</h1>
        <p className="mt-4 text-sm leading-6 text-slate-500">Please retry the experience. If the issue persists, the operations team can review audit and deployment logs.</p>
        <button className="premium-button mt-6" type="button" onClick={reset}>Retry</button>
      </section>
    </main>
  );
}
