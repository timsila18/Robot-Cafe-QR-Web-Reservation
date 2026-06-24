import { branches, categories, getCategoryById, menuItems } from "@/lib/demo-data";

export type FeedbackRecord = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  branchId: string;
  foodRating: number;
  serviceRating: number;
  ambienceRating: number;
  overallRating: number;
  comment: string;
  status: "new" | "reviewed" | "archived";
  createdAt: string;
  reviewedAt?: string;
  archivedAt?: string;
};

export type QrScanRecord = {
  id: string;
  branchId?: string;
  route: string;
  page: string;
  deviceType: string;
  browser: string;
  os: string;
  sessionId: string;
  referrer: string;
  itemId?: string;
  categoryId?: string;
  searchQuery?: string;
  createdAt: string;
};

const now = new Date();
const isoHoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

let feedbackStore: FeedbackRecord[] = [
  {
    id: "feedback-1",
    name: "Ali R.",
    phone: "+254700000111",
    email: "ali@example.com",
    branchId: "branch-imaara",
    foodRating: 5,
    serviceRating: 5,
    ambienceRating: 4,
    overallRating: 5,
    comment: "The premium photo menu made choosing dinner easy.",
    status: "new",
    createdAt: isoHoursAgo(2),
  },
  {
    id: "feedback-2",
    name: "Sara K.",
    phone: "+254700000222",
    branchId: "branch-lana",
    foodRating: 4,
    serviceRating: 5,
    ambienceRating: 5,
    overallRating: 5,
    comment: "Loved the coffee discovery and branch menu speed.",
    status: "reviewed",
    createdAt: isoHoursAgo(8),
    reviewedAt: isoHoursAgo(5),
  },
  {
    id: "feedback-3",
    name: "Zainab M.",
    phone: "+254700000333",
    email: "",
    branchId: "branch-imaara",
    foodRating: 5,
    serviceRating: 4,
    ambienceRating: 5,
    overallRating: 4,
    comment: "Would like table ordering when it is ready.",
    status: "new",
    createdAt: isoHoursAgo(18),
  },
];

let qrScanStore: QrScanRecord[] = Array.from({ length: 42 }, (_, index) => {
  const branch = branches[index % branches.length];
  const item = menuItems[index % menuItems.length];
  const category = getCategoryById(item.categoryId);
  return {
    id: `scan-${index + 1}`,
    branchId: branch.id,
    route: `/menu/${branch.slug}`,
    page: `/menu/${branch.slug}`,
    deviceType: index % 3 === 0 ? "desktop" : "mobile",
    browser: index % 4 === 0 ? "Safari" : index % 4 === 1 ? "Chrome" : index % 4 === 2 ? "Edge" : "Firefox",
    os: index % 3 === 0 ? "Windows" : index % 3 === 1 ? "Android" : "iOS",
    sessionId: `demo-session-${Math.floor(index / 2)}`,
    referrer: index % 5 === 0 ? "instagram.com" : "",
    itemId: item.id,
    categoryId: category?.id,
    searchQuery: index % 6 === 0 ? category?.name : undefined,
    createdAt: isoHoursAgo(index * 3),
  };
});

export function createFeedback(input: Omit<FeedbackRecord, "id" | "createdAt" | "status">) {
  const feedback: FeedbackRecord = {
    ...input,
    id: id("feedback"),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  feedbackStore = [feedback, ...feedbackStore];
  return feedback;
}

export function listFeedback() {
  return feedbackStore;
}

export function updateFeedbackStatus(feedbackId: string, status: FeedbackRecord["status"]) {
  let updated: FeedbackRecord | undefined;
  feedbackStore = feedbackStore.map((feedback) => {
    if (feedback.id !== feedbackId) return feedback;
    updated = {
      ...feedback,
      status,
      reviewedAt: status === "reviewed" ? new Date().toISOString() : feedback.reviewedAt,
      archivedAt: status === "archived" ? new Date().toISOString() : feedback.archivedAt,
    };
    return updated;
  });
  if (!updated) throw new Error("Feedback not found.");
  return updated;
}

export function createQrScan(input: Omit<QrScanRecord, "id" | "createdAt">) {
  const scan = { ...input, id: id("scan"), createdAt: new Date().toISOString() };
  qrScanStore = [scan, ...qrScanStore].slice(0, 1000);
  return scan;
}

export function listQrScans() {
  return qrScanStore;
}

export function getFeedbackMetrics() {
  const active = feedbackStore.filter((entry) => entry.status !== "archived");
  const avg = (field: keyof Pick<FeedbackRecord, "foodRating" | "serviceRating" | "ambienceRating" | "overallRating">) =>
    active.length ? active.reduce((sum, entry) => sum + entry[field], 0) / active.length : 0;
  return {
    total: feedbackStore.length,
    averageRating: avg("overallRating"),
    foodRating: avg("foodRating"),
    serviceRating: avg("serviceRating"),
    ambienceRating: avg("ambienceRating"),
    recent: active.slice(0, 8),
  };
}

export function getAnalyticsMetrics() {
  const scans = qrScanStore;
  const since = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const countSince = (days: number) => scans.filter((scan) => new Date(scan.createdAt) >= since(days)).length;
  const byBranch = (branchSlug: string) => scans.filter((scan) => scan.branchId === branches.find((branch) => branch.slug === branchSlug)?.id).length;
  const rank = (values: (string | undefined)[]) => {
    const counts = new Map<string, number>();
    values.filter(Boolean).forEach((value) => counts.set(String(value), (counts.get(String(value)) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  };

  return {
    todayVisits: countSince(1),
    weeklyVisits: countSince(7),
    monthlyVisits: countSince(30),
    totalVisits: scans.length,
    imaaraVisits: byBranch("imaara-mall"),
    lanaVisits: byBranch("lana-plaza"),
    topViewedItems: rank(scans.map((scan) => menuItems.find((item) => item.id === scan.itemId)?.name)),
    mostSearchedItems: rank(scans.map((scan) => scan.searchQuery)),
    mostViewedCategories: rank(scans.map((scan) => categories.find((category) => category.id === scan.categoryId)?.name)),
    popularDevices: rank(scans.map((scan) => scan.deviceType)),
    popularBrowsers: rank(scans.map((scan) => scan.browser)),
    peakVisitTimes: rank(scans.map((scan) => `${new Date(scan.createdAt).getHours()}:00`)),
    feedbackConversion: scans.length ? Math.round((feedbackStore.length / scans.length) * 100) : 0,
  };
}

export function detectDevice(userAgent: string) {
  const lower = userAgent.toLowerCase();
  return {
    deviceType: /mobile|android|iphone/.test(lower) ? "mobile" : /ipad|tablet/.test(lower) ? "tablet" : "desktop",
    browser: lower.includes("edg") ? "Edge" : lower.includes("chrome") ? "Chrome" : lower.includes("safari") ? "Safari" : lower.includes("firefox") ? "Firefox" : "Unknown",
    os: lower.includes("windows") ? "Windows" : lower.includes("android") ? "Android" : lower.includes("iphone") || lower.includes("ipad") ? "iOS" : lower.includes("mac") ? "macOS" : "Unknown",
  };
}
