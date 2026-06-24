import { AdminCategoryManager } from "@/components/admin-category-manager";
import { listAdminState } from "@/lib/admin-engine";

export default function AdminCategoriesPage() {
  const state = listAdminState();

  return <AdminCategoryManager initialCategories={state.categories} menuItems={state.menuItems} />;
}
