import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/brand-mark";

type HeroSectionProps = {
  title: string;
  subtitle: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  featuredItem?: {
    badge: string;
    branchName: string;
    description: string;
    imageUrl?: string;
    name: string;
    price: string;
  };
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
}: HeroSectionProps) {
  const displayItem = featuredItem ?? {
    badge: "Live Menu",
    branchName: "Robot Cafe",
    description: "Fresh selections appear here as soon as the admin publishes the menu.",
    name: "Live Menu Ready",
    price: "QR Powered",
  };

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
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-gold/16 bg-[radial-gradient(circle_at_50%_18%,rgba(216,169,40,0.18),transparent_16rem),radial-gradient(circle_at_18%_42%,rgba(52,184,255,0.26),transparent_14rem),linear-gradient(145deg,#02060d,#0a2235)] p-5">
            <Image
              alt="Robot Cafe futuristic dining service robot"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              src="/robot-cafe-hero-robot.png"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_34%,transparent_0,rgba(2,6,13,.08)_38%,rgba(2,6,13,.78)_100%)]" />
            <div className="robot-scanline left-0 top-16" />
            <div className="relative flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[#b8d8ff]">
              <span className="rounded-lg border border-[#168df2]/35 bg-white px-3 py-2 shadow-[0_14px_34px_rgba(0,0,0,.3)]">
                <BrandMark imageClassName="w-28" />
              </span>
              <span className="text-gold">QR Ready</span>
            </div>
            <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-gold/18 bg-black/48 p-4 shadow-[0_18px_50px_rgba(0,0,0,.34)] backdrop-blur-xl">
              {displayItem.imageUrl ? (
                <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-black/30">
                  <Image
                    alt={displayItem.name}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 430px, 80vw"
                    src={displayItem.imageUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/45" />
                </div>
              ) : null}
              <p className="text-sm text-[#b8d8ff]">{displayItem.branchName}</p>
              <p className="mt-2 text-3xl font-black text-white">{displayItem.name}</p>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#d7e7f8]">{displayItem.description}</p>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-2xl font-black text-gold">{displayItem.price}</span>
                <span className="rounded-md border border-gold/35 bg-gold/12 px-3 py-2 text-xs font-bold text-[#fff2bf]">{displayItem.badge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
