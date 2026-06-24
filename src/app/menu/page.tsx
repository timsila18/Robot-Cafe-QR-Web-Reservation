import { BranchCard } from "@/components/branch-card";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { PublicLayout } from "@/components/public-layout";
import { branches } from "@/lib/demo-data";

export default function MenuLandingPage() {
  return (
    <PublicLayout>
      <HeroSection
        title="ROBOT CAFE"
        subtitle="Premium Dining Experience"
        description="Choose your branch to enter a refined digital menu designed for speed, clarity, and a luxury hospitality flow."
        primaryHref="#branches"
        primaryLabel="Select Branch"
        secondaryHref="/menu/imaara-mall"
        secondaryLabel="Imaara Mall"
      />

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8" id="branches">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-semibold text-slate-950">Select your Robot Cafe branch.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Branch QR codes skip this step and open the right menu instantly. Manual visitors can choose here.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {branches.map((branch) => (
            <BranchCard branch={branch} key={branch.id} />
          ))}
        </div>
      </section>
      <Footer />
    </PublicLayout>
  );
}
