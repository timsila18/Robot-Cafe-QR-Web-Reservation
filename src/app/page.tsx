import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { PublicLayout } from "@/components/public-layout";
import { branches, formatPrice, menuItems } from "@/lib/demo-data";
import { getOptimizedImageUrl, getPrimaryImage } from "@/lib/images/image-utils";

export default function Home() {
  const showcaseItems = menuItems.filter((item) => item.isFeatured || item.isBestSeller).slice(0, 4);

  return (
    <PublicLayout>
      <HeroSection
        title="ROBOT CAFE"
        subtitle="Premium Dining Experience"
        description="A polished QR-powered dining platform built for fast branch menus, modern service workflows, and future-ready hospitality operations."
        primaryHref="/menu"
        primaryLabel="Open Digital Menu"
        secondaryHref="/admin"
        secondaryLabel="View Admin"
      />

      <section className="mx-auto w-full max-w-7xl px-5 pb-5 pt-2 sm:px-8">
        <div className="luxury-panel p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black text-white">Our Menu</h2>
              <p className="mt-2 text-sm font-medium text-[#9fb3c8]">Crafted with passion. Served with technology.</p>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {["All", "Signature", "Mains", "Beverages", "Desserts"].map((label) => (
                <span className={`shrink-0 rounded-lg border px-4 py-2 text-xs font-bold ${label === "All" ? "border-gold bg-gold/24 text-gold" : "border-white/10 bg-white/5 text-[#d7e7f8]"}`} key={label}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {showcaseItems.map((item) => {
              const image = getOptimizedImageUrl(getPrimaryImage(item.images), "card");
              return (
                <article className="group overflow-hidden rounded-2xl border border-gold/18 bg-black/26 shadow-[0_24px_70px_rgba(0,0,0,.32)] transition hover:-translate-y-1 hover:border-gold/50" key={item.id}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image alt={item.name} className="object-cover transition duration-500 group-hover:scale-105" fill sizes="(min-width: 1280px) 280px, 50vw" src={image} unoptimized={image.startsWith("data:")} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/78" />
                    <span className="absolute left-3 top-3 rounded-md border border-gold/35 bg-black/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gold">Signature</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-black text-white">{item.name}</h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#9fb3c8]">{item.shortDescription}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-black text-gold">{formatPrice(item.price)}</p>
                      <span className="grid size-9 place-items-center rounded-full border border-gold/35 bg-gold/12 text-xl leading-none text-gold">+</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-4">
            {[
              [branches.length, "Branches"],
              [menuItems.length, "Menu Items"],
              ["99%", "Happy Customers"],
              ["24/7", "Digital Experience"],
            ].map(([value, label]) => (
              <div className="border-white/10 text-center sm:border-r last:border-r-0" key={label}>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs text-[#9fb3c8]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 pt-5 sm:px-8">
        <div className="grid gap-5 rounded-[24px] border border-gold/35 bg-black/22 p-5 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-2xl lg:grid-cols-[0.82fr_1.18fr]">
          <div className="relative hidden min-h-72 overflow-hidden rounded-2xl border border-[#34b8ff]/20 bg-[radial-gradient(circle_at_50%_50%,rgba(52,184,255,.24),transparent_12rem),linear-gradient(145deg,#02060d,#061827)] lg:block">
            <div className="absolute inset-10 rounded-[36px] border border-[#34b8ff]/25" />
            <div className="absolute inset-20 rounded-[28px] border border-[#34b8ff]/18" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid size-28 place-items-center rounded-3xl border border-[#34b8ff]/50 bg-[#34b8ff]/10 text-4xl font-black text-[#34b8ff]">RC</div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">Make a Reservation</h2>
            <p className="mt-2 text-sm font-medium text-[#9fb3c8]">Book your table in seconds. The request routes to the selected branch.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Branch", "Date", "Time", "Guests", "Email", "Phone"].map((label) => (
                <div className="rounded-xl border border-white/10 bg-[#06111f]/80 px-4 py-3" key={label}>
                  <p className="text-xs text-[#9fb3c8]">{label}</p>
                  <p className="mt-2 text-sm font-bold text-white">{label === "Guests" ? "2 Guests" : label === "Branch" ? "Select branch" : label === "Phone" ? "07X XXX XXXX" : label === "Email" ? "you@email.com" : "Select"}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-[#06111f]/80 px-4 py-3">
              <p className="text-xs text-[#9fb3c8]">Special Request</p>
              <p className="mt-2 text-sm font-bold text-white/70">Any special requests...</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#9fb3c8]">
                <span className="text-gold">● Instant routing</span>
                <span className="text-gold">● Branch email alerts</span>
              </div>
              <Link className="premium-button" href="/reservations">Reserve Table</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </PublicLayout>
  );
}
