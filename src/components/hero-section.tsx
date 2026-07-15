import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { HeroLiveShowcase, type HeroShowcaseItem } from "@/components/hero-live-showcase";

type HeroSectionProps = {
  title: string;
  subtitle: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  featuredItem?: HeroShowcaseItem;
  featuredItems?: HeroShowcaseItem[];
};

export function HeroSection({
  title,
  subtitle,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  featuredItem,
  featuredItems = [],
}: HeroSectionProps) {
  const displayItems = featuredItems.length ? featuredItems : featuredItem ? [featuredItem] : [];

  return (
    <section className="relative mx-auto grid min-h-[72svh] w-full max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.82fr]">
      <div className="premium-orbit -left-28 top-24 size-80 opacity-60" />
      <div className="premium-orbit right-8 top-16 size-56 opacity-40" />
      <div className="absolute inset-x-8 top-24 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-5xl font-black leading-[0.95] text-white drop-shadow-[0_18px_42px_rgba(0,0,0,.62)] sm:text-7xl lg:text-8xl">{title}</h1>
        <p className="mt-6 text-2xl font-extrabold text-gold sm:text-4xl">{subtitle}</p>
        <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-[#d7e7f8] sm:text-lg">{description}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link className="premium-button" href={primaryHref}>{primaryLabel}</Link>
          {secondaryHref && secondaryLabel ? (
            <Link className="ghost-button" href={secondaryHref}>{secondaryLabel}</Link>
          ) : null}
        </div>
      </div>
      <div className="relative z-10">
        <div className="rounded-[28px] border border-gold/20 bg-black/25 p-4 shadow-[0_35px_110px_rgba(0,0,0,.52)] backdrop-blur-2xl">
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-gold/16 bg-[radial-gradient(circle_at_50%_18%,rgba(216,169,40,0.18),transparent_16rem),radial-gradient(circle_at_18%_42%,rgba(52,184,255,0.26),transparent_14rem),linear-gradient(145deg,#02060d,#0a2235)] bg-cover bg-center p-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 18%, rgba(216,169,40,0.18), transparent 16rem), radial-gradient(circle at 18% 42%, rgba(52,184,255,0.26), transparent 14rem), linear-gradient(180deg, rgba(2,6,13,.08), rgba(2,6,13,.78)), url('/robot-cafe-hero-robot.png')",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_34%,transparent_0,rgba(2,6,13,.08)_38%,rgba(2,6,13,.78)_100%)]" />
            <div className="robot-scanline left-0 top-16" />
            <div className="relative flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[#b8d8ff]">
              <span className="rounded-lg border border-[#168df2]/35 bg-black/22 px-2 py-2 shadow-[0_14px_34px_rgba(0,0,0,.3)] backdrop-blur-md">
                <BrandMark imageClassName="w-36" />
              </span>
              <span className="text-gold">QR Ready</span>
            </div>
            <HeroLiveShowcase items={displayItems} />
          </div>
        </div>
      </div>
    </section>
  );
}
