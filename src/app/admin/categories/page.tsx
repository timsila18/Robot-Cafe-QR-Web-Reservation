import { AdminCategoryManager } from "@/components/admin-category-manager";
import { listAdminState } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const state = await listAdminState();

  return <AdminCategoryManager initialCategories={state.categories} menuItems={state.menuItems} />;
}
