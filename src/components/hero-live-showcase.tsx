"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export type HeroShowcaseItem = {
  badge: string;
  branchName: string;
  description: string;
  imageUrl?: string;
  name: string;
  price: string;
};

const fallbackItem: HeroShowcaseItem = {
  badge: "QR Ready",
  branchName: "Robot Cafe",
  description: "Fresh selections appear here as soon as the admin publishes the menu.",
  name: "Live Menu Ready",
  price: "Live Menu",
};

export function HeroLiveShowcase({ items }: { items: HeroShowcaseItem[] }) {
  const safeItems = useMemo(() => (items.length ? items : [fallbackItem]), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = safeItems[activeIndex % safeItems.length] ?? fallbackItem;

  useEffect(() => {
    if (safeItems.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeItems.length);
    }, 3600);

    return () => window.clearInterval(interval);
  }, [safeItems.length]);

  return (
    <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-gold/18 bg-black/58 p-4 shadow-[0_18px_50px_rgba(0,0,0,.34)] backdrop-blur-xl">
      <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_24%_20%,rgba(216,169,40,.24),transparent_28%),linear-gradient(145deg,#02060d,#09233a)]">
        {active.imageUrl ? (
          <Image
            alt={active.name}
            className="object-cover transition duration-700"
            fill
            priority
            sizes="(min-width: 1024px) 430px, 86vw"
            src={active.imageUrl}
            unoptimized={active.imageUrl.startsWith("data:")}
          />
        ) : (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-gold">Live Menu</p>
              <p className="mt-2 text-2xl font-black text-white">Robot Cafe</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/50" />
      </div>
      <p className="text-sm font-semibold text-[#b8d8ff]">{active.branchName}</p>
      <p className="mt-2 text-3xl font-black text-white">{active.name}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#d7e7f8]">{active.description}</p>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-2xl font-black text-gold">{active.price}</span>
        <span className="rounded-md border border-gold/35 bg-gold/12 px-3 py-2 text-xs font-bold text-[#fff2bf]">{active.badge}</span>
      </div>
      {safeItems.length > 1 ? (
        <div className="mt-4 flex gap-1.5">
          {safeItems.slice(0, 6).map((item, index) => (
            <button
              aria-label={`Show ${item.name}`}
              className={`h-1.5 rounded-full transition-all ${index === activeIndex % safeItems.length ? "w-8 bg-gold" : "w-3 bg-white/24"}`}
              key={`${item.name}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
