import { branches as fallbackBranches } from "@/lib/demo-data";
import { listAdminState, type AdminBranch, type AdminCategory, type AdminMenuItem } from "@/lib/admin-store";

export type PublicState = {
  branches: AdminBranch[];
  categories: AdminCategory[];
  degraded: boolean;
  menuItems: AdminMenuItem[];
};

export async function getPublicState(): Promise<PublicState> {
  try {
    const state = await listAdminState();
    return {
      branches: state.branches,
      categories: state.categories,
      degraded: false,
      menuItems: state.menuItems,
    };
  } catch {
    return {
      branches: fallbackBranches.map((branch) => ({
        ...branch,
        openingHours: "Mon - Sun, 7:30 AM - 10 PM",
      })),
      categories: [],
      degraded: true,
      menuItems: [],
    };
  }
}
