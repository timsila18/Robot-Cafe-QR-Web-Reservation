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
      <div className="absolute inset-x-8 top-24 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-5xl font-black leading-[0.95] text-white drop-shadow-[0_12px_32px_rgba(0,0,0,.42)] sm:text-7xl lg:text-8xl">{title}</h1>
        <p className="mt-6 text-2xl font-extrabold text-[#6dc6ff] sm:text-4xl">{subtitle}</p>
        <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-[#d7e7f8] sm:text-lg">{description}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link className="premium-button" href={primaryHref}>{primaryLabel}</Link>
          {secondaryHref && secondaryLabel ? (
            <Link className="ghost-button" href={secondaryHref}>{secondaryLabel}</Link>
          ) : null}
        </div>
      </div>
      <div className="relative z-10">
        <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 shadow-[0_30px_90px_rgba(0,0,0,.32)] backdrop-blur-2xl">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_18%,rgba(22,141,242,0.28),transparent_18rem),linear-gradient(145deg,#071827,#0a2235)] p-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[#b8d8ff]">
              <span>Live Menu</span>
              <span className="text-[#6dc6ff]">QR Ready</span>
            </div>
            <div className="mt-10 rounded-xl border border-white/10 bg-white/10 p-4 shadow-[0_18px_50px_rgba(0,0,0,.24)]">
              <p className="text-sm text-[#b8d8ff]">Imaara Mall</p>
              <p className="mt-2 text-3xl font-black text-white">Reserve Cappuccino</p>
              <p className="mt-3 text-sm leading-6 text-[#d7e7f8]">Velvety espresso, microfoam, and cocoa finish.</p>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-2xl font-black text-[#6dc6ff]">KES 420</span>
                <span className="rounded-md border border-[#6dc6ff]/35 bg-[#168df2]/12 px-3 py-2 text-xs font-bold text-[#d7efff]">Featured</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs text-[#b8d8ff]">Search</p>
                <p className="mt-3 text-sm font-bold text-white">Coffee</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs text-[#b8d8ff]">Branch</p>
                <p className="mt-3 text-sm font-bold text-white">Auto detected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
