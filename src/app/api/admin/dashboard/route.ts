import { listAdminState } from "@/lib/admin-engine";
import { ok } from "@/lib/api-response";

export async function GET() {
  const state = listAdminState();
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
    latestFeedback: [
      { id: "feedback-1", branch: "Imaara Mall", rating: 5, comment: "Loved the menu flow.", status: "new" },
      { id: "feedback-2", branch: "Lana Plaza", rating: 4, comment: "Easy to find coffee and desserts.", status: "reviewed" },
    ],
    recentActivity: state.activityLogs.slice(0, 8),
  });
}
