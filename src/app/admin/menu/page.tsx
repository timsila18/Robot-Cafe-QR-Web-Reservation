import { AdminMenuManager } from "@/components/admin-menu-manager";
import { listAdminState } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const state = await listAdminState();

  return (
    <AdminMenuManager
      branches={state.branches}
      categories={state.categories}
      initialItems={state.menuItems}
    />
  );
}
