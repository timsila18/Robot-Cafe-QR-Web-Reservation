import type { AdminBranch, AdminCategory, AdminMenuItem } from "@/lib/admin-store";
import type { Category, MenuItem } from "@/lib/demo-data";

export const demoBranchStorageKey = "robot-cafe-admin-branches";
export const demoCategoryStorageKey = "robot-cafe-admin-categories";
export const demoMenuStorageKey = "robot-cafe-admin-menu-items";

function isDemoPersistenceEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_PERSISTENCE === "true";
}

export function canUseDemoPersistence(error: unknown) {
  if (!isDemoPersistenceEnabled()) return false;
  const message = String(error ?? "").toLowerCase();
  return message.includes("database persistence is not configured") || message.includes("invalid input syntax for type uuid");
}

export function readDemoBranches(fallback: AdminBranch[]) {
  return readDemoList<AdminBranch>(demoBranchStorageKey, fallback);
}

export function saveDemoBranches(branches: AdminBranch[]) {
  saveDemoList(demoBranchStorageKey, branches);
}

export function readDemoCategories(fallback: AdminCategory[]) {
  return readDemoList<AdminCategory>(demoCategoryStorageKey, fallback);
}

export function saveDemoCategories(categories: AdminCategory[]) {
  saveDemoList(demoCategoryStorageKey, categories);
}

export function readDemoMenuItems(fallback: AdminMenuItem[]) {
  return readDemoList<AdminMenuItem>(demoMenuStorageKey, fallback);
}

export function saveDemoMenuItems(items: AdminMenuItem[]) {
  saveDemoList(demoMenuStorageKey, items);
}

export function toPublicCategories(categories: AdminCategory[]): Category[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    createdAt: category.updatedAt,
    updatedAt: category.updatedAt,
  }));
}

export function toPublicMenuItems(items: AdminMenuItem[]): MenuItem[] {
  return items.map((item) => ({
    ...item,
    imageUrl: item.images[0]?.imageUrl ?? "",
    createdAt: item.updatedAt,
  }));
}

function readDemoList<T>(key: string, fallback: T[]) {
  if (typeof window === "undefined") return fallback;
  if (!isDemoPersistenceEnabled()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore blocked storage. Supabase is the production source of truth.
    }
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function saveDemoList<T>(key: string, values: T[]) {
  if (typeof window === "undefined") return;
  if (!isDemoPersistenceEnabled()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore blocked storage. Supabase is the production source of truth.
    }
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // Demo storage is best-effort. Production persistence remains the Supabase adapter path.
  }
}
