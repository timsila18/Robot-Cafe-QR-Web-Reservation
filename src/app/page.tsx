import Image from "next/image";
import { Footer } from "@/components/footer";
import { BranchCard } from "@/components/branch-card";
import { BrandMark } from "@/components/brand-mark";
import { HomeReservationPanel } from "@/components/home-reservation-panel";
import { PublicLayout } from "@/components/public-layout";
import { formatPrice } from "@/lib/demo-data";
import { getOptimizedImageUrl, getPrimaryImage } from "@/lib/images/image-utils";
import { getPublicState } from "@/lib/public-state";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await getPublicState();
  const branches = state.branches.filter((branch) => branch.isActive);
  const menuItems = state.menuItems.filter((item) => item.isActive);
  const showcaseItems = menuItems.filter((item) => item.isFeatured || item.isBestSeller).slice(0, 6);

  return (
    <PublicLayout>
      <section className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-10 sm:px-8 sm:pt-14" id="branches">
        <div className="premium-orbit -left-28 top-24 size-80 opacity-60" />
        <div className="premium-orbit right-8 top-10 size-56 opacity-40" />
        <div className="absolute inset-x-8 top-20 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <BrandMark imageClassName="w-[190px] sm:w-[240px]" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.32em] text-gold">Choose branch</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">Select your Robot Cafe branch.</h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-[#d7e7f8] sm:text-lg">
              Scan, choose your branch, and open the live menu instantly. Reservations and feedback stay available after you enter.
            </p>
          </div>
          <div className="rounded-[28px] border border-gold/18 bg-black/24 p-4 shadow-[0_35px_110px_rgba(0,0,0,.48)] backdrop-blur-2xl">
            {branches.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {branches.map((branch) => (
                  <BranchCard branch={{ ...branch, createdAt: branch.updatedAt }} key={branch.id} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-gold/15 bg-[#06111f] p-8 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">Branch setup</p>
                <p className="mt-3 text-lg font-black text-white">Robot Cafe branches are being prepared.</p>
              </div>
            )}
          </div>
        </div>
      </section>

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

      <HomeReservationPanel branches={branches} />

      <Footer />
    </PublicLayout>
  );
}
