"use client";

import { BrandMark } from "@/components/brand-mark";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="premium-shell grid min-h-screen place-items-center px-5 text-white">
          <section className="luxury-panel w-full max-w-xl p-8 text-center">
            <div className="flex justify-center">
              <BrandMark />
            </div>
            <p className="mt-8 text-sm font-black uppercase tracking-[0.28em] text-gold">System Recovery</p>
            <h1 className="mt-3 text-4xl font-black text-white">Robot Cafe is recovering.</h1>
            <p className="mt-4 text-sm leading-7 text-[#d7e7f8]">A temporary issue occurred. Retry the experience and the platform will request fresh live data.</p>
            <button className="premium-button mt-7" type="button" onClick={reset}>Retry</button>
          </section>
        </main>
      </body>
    </html>
  );
}
