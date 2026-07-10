import { BrandMark } from "@/components/brand-mark";

export function RouteLoading({ label = "Preparing Robot Cafe" }: { label?: string }) {
  return (
    <main className="grid min-h-[70svh] place-items-center px-5 text-white">
      <section className="luxury-panel w-full max-w-md p-7 text-center">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <div className="mx-auto mt-7 h-1.5 w-44 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-gold" />
        </div>
        <p className="mt-5 text-sm font-black uppercase tracking-[0.24em] text-gold">{label}</p>
        <p className="mt-3 text-sm leading-6 text-[#d7e7f8]">Loading the latest live dining experience.</p>
      </section>
    </main>
  );
}
