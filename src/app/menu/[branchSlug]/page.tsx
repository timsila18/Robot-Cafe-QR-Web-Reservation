import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MenuExperience } from "@/components/menu-experience";
import { PublicLayout } from "@/components/public-layout";
import { categories, getBranchBySlug, getItemsForBranch } from "@/lib/demo-data";

type BranchMenuPageProps = {
  params: Promise<{
    branchSlug: string;
  }>;
};

export function generateStaticParams() {
  return [{ branchSlug: "imaara-mall" }, { branchSlug: "lana-plaza" }];
}

export async function generateMetadata({ params }: BranchMenuPageProps): Promise<Metadata> {
  const { branchSlug } = await params;
  const branch = getBranchBySlug(branchSlug);
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
  const branch = getBranchBySlug(branchSlug);

  if (!branch) {
    notFound();
  }

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: branch.name,
            address: branch.location,
            telephone: branch.phone,
            servesCuisine: ["Cafe", "Coffee", "Premium Casual Dining"],
            url: `https://qr.robotcafe.co.ke/menu/${branch.slug}`,
          }),
        }}
      />
      <MenuExperience branch={branch} categories={categories} items={getItemsForBranch(branch.slug)} />
    </PublicLayout>
  );
}
