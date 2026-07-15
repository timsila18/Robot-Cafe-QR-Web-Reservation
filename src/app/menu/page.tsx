import { BranchCard } from "@/components/branch-card";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { PublicLayout } from "@/components/public-layout";
import { ServiceUnavailable } from "@/components/service-unavailable";
import { formatPrice } from "@/lib/demo-data";
import { getOptimizedImageUrl, getPrimaryImage } from "@/lib/images/image-utils";
import { getPublicState } from "@/lib/public-state";

export const dynamic = "force-dynamic";

export default async function MenuLandingPage() {
  const { branches, degraded, menuItems } = await getPublicState();
  const activeBranches = branches.filter((branch) => branch.isActive);
  const activeItems = menuItems.filter((item) => item.isActive);
  const selectedItems = (activeItems.filter((item) => item.isFeatured || item.isBestSeller).slice(0, 6).length
    ? activeItems.filter((item) => item.isFeatured || item.isBestSeller).slice(0, 6)
    : activeItems.slice(0, 6));
  const heroItems = selectedItems.map((item) => {
    const image = getOptimizedImageUrl(getPrimaryImage(item.images), "card");
    const branch = activeBranches.find((entry) => item.availableBranches.includes(entry.slug));

    return {
      badge: item.isFeatured ? "Featured" : item.isBestSeller ? "Best Seller" : "Live Menu",
      branchName: branch?.name.replace("Robot Cafe - ", "") ?? "Robot Cafe",
      description: item.shortDescription || item.description,
      imageUrl: image,
      name: item.name,
      price: formatPrice(item.price),
    };
  });

  return (
    <PublicLayout>
      {degraded ? <ServiceUnavailable message="The menu database is temporarily unavailable, but branch access and reservations remain available." /> : null}
      <HeroSection
        title="ROBOT CAFE"
        subtitle="Premium Dining Experience"
        description="Choose your branch to enter a refined digital menu designed for speed, clarity, and a luxury hospitality flow."
        primaryHref="#branches"
        primaryLabel="Select Branch"
        secondaryHref="/feedback"
        secondaryLabel="Share Feedback"
        featuredItems={heroItems}
      />

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8" id="branches">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-black text-white">Select your Robot Cafe branch.</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-[#d7e7f8]">
            Every branch gets the same menu visibility, QR experience, and premium hospitality flow.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {activeBranches.map((branch) => (
            <BranchCard branch={{ ...branch, createdAt: branch.updatedAt }} key={branch.id} />
          ))}
        </div>
      </section>
      <Footer />
    </PublicLayout>
  );
}
