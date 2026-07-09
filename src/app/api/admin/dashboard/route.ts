import { listAdminState } from "@/lib/admin-store";
import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await listAdminState();
  const activeItems = state.menuItems.filter((item) => item.isActive);
  const soldOutItems = state.menuItems.filter((item) => item.isSoldOut);

  return ok({
    totals: {
      totalMenuItems: state.menuItems.length,
      activeItems: activeItems.length,
      soldOutItems: soldOutItems.length,
      featuredItems: state.menuItems.filter((item) => item.isFeatured).length,
      categories: state.categories.length,
      branches: state.branches.length,
      feedbackCount: state.feedbackCount,
      qrScans: state.qrScans,
    },
    recentlyUpdatedItems: [...state.menuItems]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 8),
    latestFeedback: [],
    recentActivity: state.activityLogs.slice(0, 8),
  });
}
