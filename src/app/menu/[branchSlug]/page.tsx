import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MenuExperience } from "@/components/menu-experience";
import { PublicLayout } from "@/components/public-layout";
import { listAdminState } from "@/lib/admin-store";
import { toPublicCategories, toPublicMenuItems } from "@/lib/demo-persistence";

type BranchMenuPageProps = {
  params: Promise<{
    branchSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BranchMenuPageProps): Promise<Metadata> {
  const { branchSlug } = await params;
  const state = await listAdminState();
  const branch = state.branches.find((entry) => entry.slug === branchSlug);
  if (!branch) return {};
  return {
    title: `${branch.name.replace("Robot Cafe - ", "")} Menu`,
    description: `Explore the premium Robot Cafe digital dining menu for ${branch.name.replace("Robot Cafe - ", "")}.`,
    openGraph: {
      title: `${branch.name.replace("Robot Cafe - ", "")} Menu | Robot Cafe`,
      description: "Premium QR-powered menu discovery, food photos, and branch dining feedback.",
      type: "website",
    },
  };
}

export default async function BranchMenuPage({ params }: BranchMenuPageProps) {
  const { branchSlug } = await params;
  const state = await listAdminState();
  const branch = state.branches.find((entry) => entry.slug === branchSlug && entry.isActive);

  if (!branch) {
    notFound();
  }

  const activeCategories = toPublicCategories(state.categories.filter((category) => category.isActive));
  const branchItems = toPublicMenuItems(
    state.menuItems.filter((item) => item.isActive && item.availableBranches.includes(branch.slug)),
  );
  const publicBranch = { ...branch, createdAt: branch.updatedAt };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: publicBranch.name,
            address: branch.location,
            telephone: branch.phone,
            servesCuisine: ["Cafe", "Coffee", "Premium Casual Dining"],
            url: `https://qr.robotcafe.co.ke/menu/${branch.slug}`,
          }),
        }}
      />
      <MenuExperience branch={publicBranch} categories={activeCategories} items={branchItems} />
    </PublicLayout>
  );
}
