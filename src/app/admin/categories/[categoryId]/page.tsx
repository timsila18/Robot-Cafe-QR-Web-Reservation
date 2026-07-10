import { AdminCategoryManager } from "@/components/admin-category-manager";
import { listAdminState } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function AdminCategoryEditPage({ params }: PageProps) {
  const [{ categoryId }, state] = await Promise.all([params, listAdminState()]);

  return <AdminCategoryManager initialCategories={state.categories} initialEditingId={categoryId} menuItems={state.menuItems} />;
}
