import Link from "next/link";

type HeroSectionProps = {
  title: string;
  subtitle: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function HeroSection({
  title,
  subtitle,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: HeroSectionProps) {
  return (
    <section className="relative mx-auto grid min-h-[72svh] w-full max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.82fr]">
      <div className="absolute inset-x-8 top-24 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-5xl font-semibold leading-[0.95] text-slate-950 sm:text-7xl lg:text-8xl">{title}</h1>
        <p className="mt-6 text-2xl font-medium text-gold sm:text-4xl">{subtitle}</p>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link className="premium-button" href={primaryHref}>{primaryLabel}</Link>
          {secondaryHref && secondaryLabel ? (
            <Link className="ghost-button" href={secondaryHref}>{secondaryLabel}</Link>
          ) : null}
        </div>
      </div>
      <div className="relative z-10">
        <div className="luxury-panel p-4">
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_18%,rgba(8,119,189,0.14),transparent_18rem),linear-gradient(145deg,#ffffff,#f3f7fb)] p-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-400">
              <span>Live Menu</span>
              <span className="text-gold">QR Ready</span>
            </div>
            <div className="mt-10 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
              <p className="text-sm text-slate-500">Imaara Mall</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">Reserve Cappuccino</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">Velvety espresso, microfoam, and cocoa finish.</p>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-2xl font-semibold text-gold">KES 420</span>
                <span className="rounded-md border border-gold/30 px-3 py-2 text-xs text-gold">Featured</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
                <p className="text-xs text-slate-400">Search</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">Coffee</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
                <p className="text-xs text-slate-400">Branch</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">Auto detected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
