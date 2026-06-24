import Link from "next/link";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { PublicLayout } from "@/components/public-layout";

export default function Home() {
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

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 pb-16 pt-2 sm:grid-cols-3 sm:px-8">
        {[
          ["Branch-aware", "QR routes open the exact Robot Cafe branch menu instantly."],
          ["Mobile-first", "Search, filters, cards, and detail modals are tuned for touch."],
          ["Future-ready", "Architecture is prepared for ordering, payments, loyalty, and KDS."],
        ].map(([title, body]) => (
          <article className="luxury-panel p-6" key={title}>
            <p className="text-sm uppercase tracking-[0.28em] text-gold">{title}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col gap-5 border-y border-slate-200 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Designed for presentation, ready for scale.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              The customer flow, branch model, admin surfaces, and demo data are all wired as the foundation for a production deployment.
            </p>
          </div>
          <Link className="premium-button w-full sm:w-auto" href="/menu/imaara-mall">
            Enter Imaara Mall
          </Link>
        </div>
      </section>

      <Footer />
    </PublicLayout>
  );
}
