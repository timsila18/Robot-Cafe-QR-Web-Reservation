import { BranchCard } from "@/components/branch-card";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { PublicLayout } from "@/components/public-layout";
import { listAdminState } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export default async function MenuLandingPage() {
  const { branches } = await listAdminState();

  return (
    <PublicLayout>
      <HeroSection
        title="ROBOT CAFE"
        subtitle="Premium Dining Experience"
        description="Choose your branch to enter a refined digital menu designed for speed, clarity, and a luxury hospitality flow."
        primaryHref="#branches"
        primaryLabel="Select Branch"
        secondaryHref="/feedback"
        secondaryLabel="Share Feedback"
      />

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8" id="branches">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-black text-white">Select your Robot Cafe branch.</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-[#d7e7f8]">
            Every branch gets the same menu visibility, QR experience, and premium hospitality flow.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {branches.filter((branch) => branch.isActive).map((branch) => (
            <BranchCard branch={{ ...branch, createdAt: branch.updatedAt }} key={branch.id} />
          ))}
        </div>
      </section>
      <Footer />
    </PublicLayout>
  );
}
