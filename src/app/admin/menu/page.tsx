import { AdminMenuManager } from "@/components/admin-menu-manager";
import { listAdminState } from "@/lib/admin-engine";

export default function AdminMenuPage() {
  const state = listAdminState();

  return (
    <AdminMenuManager
      branches={state.branches}
      categories={state.categories}
      initialItems={state.menuItems}
    />
  );
}
