import { branches, categories, menuItems } from "@/lib/demo-data";
import type { ManagedImage } from "@/lib/images/image-types";
import type { BranchInput, CategoryInput, MenuItemInput } from "@/lib/validation";

export type AdminImage = ManagedImage;

export type AdminMenuItem = MenuItemInput & {
  id: string;
  updatedAt: string;
  archivedAt?: string;
};

export type AdminCategory = CategoryInput & {
  id: string;
  updatedAt: string;
};

export type AdminBranch = BranchInput & {
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  user: string;
  entity: string;
  entityId: string;
  timestamp: string;
};

const now = () => new Date().toISOString();

export const adminBranchesSeed: AdminBranch[] = branches.map((branch) => ({
  id: branch.id,
  name: branch.name,
  slug: branch.slug,
  location: branch.location,
  phone: branch.phone,
  email: branch.slug === "imaara-mall" ? "imaara@robotcafe.co.ke" : "lana@robotcafe.co.ke",
  openingHours: "8:00 AM - 10:00 PM",
  isActive: branch.isActive,
  updatedAt: branch.updatedAt,
}));

export const adminCategoriesSeed: AdminCategory[] = categories.map((category) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: `${category.name} selections for the Robot Cafe digital menu.`,
  sortOrder: category.sortOrder,
  isActive: category.isActive,
  updatedAt: category.updatedAt,
}));

export const adminMenuItemsSeed: AdminMenuItem[] = menuItems.map((item, index) => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  description: item.description,
  shortDescription: item.description.slice(0, 120),
  price: item.price,
  preparationTime: 18 + (index % 6) * 3,
  ingredients: ["House prepared", "Chef selected", "Robot Cafe signature"],
  allergens: index % 4 === 0 ? ["Dairy", "Gluten"] : [],
  calories: 280 + index * 24,
  categoryId: item.categoryId,
  isFeatured: item.isFeatured,
  isBestSeller: item.isBestSeller,
  isNewArrival: item.isNewArrival,
  isActive: item.isActive,
  isSoldOut: item.isSoldOut,
  displayOrder: index + 1,
  availableBranches: item.availableBranches,
  images: [
    {
      id: `${item.id}-image-primary`,
      imageUrl: item.imageUrl,
      thumbnailUrl: item.images[0]?.thumbnailUrl ?? item.imageUrl,
      cardUrl: item.images[0]?.cardUrl ?? item.imageUrl,
      detailUrl: item.images[0]?.detailUrl ?? item.imageUrl,
      fileName: `${item.slug}.webp`,
      fileSize: 0,
      mimeType: "image/webp",
      width: 900,
      height: 720,
      isPrimary: true,
      sortOrder: 1,
      createdAt: item.createdAt,
    },
  ],
  updatedAt: item.updatedAt,
}));

export const activityLogsSeed: ActivityLog[] = [
  {
    id: "activity-1",
    action: "Menu Updated",
    user: "Robot Cafe Admin",
    entity: "menu_items",
    entityId: "item-1",
    timestamp: now(),
  },
  {
    id: "activity-2",
    action: "Branch Updated",
    user: "Robot Cafe Admin",
    entity: "branches",
    entityId: "branch-imaara",
    timestamp: now(),
  },
  {
    id: "activity-3",
    action: "Admin Login",
    user: "Robot Cafe Admin",
    entity: "admin_users",
    entityId: "local-admin",
    timestamp: now(),
  },
];

let serverMenuItems = [...adminMenuItemsSeed];
let serverCategories = [...adminCategoriesSeed];
let serverBranches = [...adminBranchesSeed];
let serverActivity = [...activityLogsSeed];

const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export function listAdminState() {
  return {
    menuItems: serverMenuItems,
    categories: serverCategories,
    branches: serverBranches,
    activityLogs: serverActivity,
    feedbackCount: 11,
    qrScans: 1284,
  };
}

export function createMenuItem(input: MenuItemInput) {
  const item: AdminMenuItem = { ...input, id: id("item"), updatedAt: now() };
  serverMenuItems = [item, ...serverMenuItems];
  logActivity("Menu Created", "menu_items", item.id);
  return item;
}

export function updateMenuItem(itemId: string, input: MenuItemInput) {
  let updated: AdminMenuItem | undefined;
  serverMenuItems = serverMenuItems.map((item) => {
    if (item.id !== itemId) return item;
    updated = { ...item, ...input, id: itemId, updatedAt: now() };
    return updated;
  });
  if (!updated) throw new Error("Menu item not found.");
  logActivity("Menu Updated", "menu_items", itemId);
  return updated;
}

export function deleteMenuItem(itemId: string) {
  const existing = serverMenuItems.find((item) => item.id === itemId);
  if (!existing) throw new Error("Menu item not found.");
  serverMenuItems = serverMenuItems.filter((item) => item.id !== itemId);
  logActivity("Menu Deleted", "menu_items", itemId);
  return existing;
}

export function createCategory(input: CategoryInput) {
  const category: AdminCategory = { ...input, id: id("cat"), updatedAt: now() };
  serverCategories = [category, ...serverCategories];
  logActivity("Category Created", "categories", category.id);
  return category;
}

export function updateCategory(categoryId: string, input: CategoryInput) {
  let updated: AdminCategory | undefined;
  serverCategories = serverCategories.map((category) => {
    if (category.id !== categoryId) return category;
    updated = { ...category, ...input, id: categoryId, updatedAt: now() };
    return updated;
  });
  if (!updated) throw new Error("Category not found.");
  logActivity("Category Updated", "categories", categoryId);
  return updated;
}

export function deleteCategory(categoryId: string) {
  if (serverMenuItems.some((item) => item.categoryId === categoryId)) {
    throw new Error("This category is referenced by menu items. Deactivate it instead.");
  }
  serverCategories = serverCategories.filter((category) => category.id !== categoryId);
  logActivity("Category Deleted", "categories", categoryId);
}

export function updateBranch(branchId: string, input: BranchInput) {
  let updated: AdminBranch | undefined;
  serverBranches = serverBranches.map((branch) => {
    if (branch.id !== branchId) return branch;
    updated = { ...branch, ...input, id: branchId, updatedAt: now() };
    return updated;
  });
  if (!updated) throw new Error("Branch not found.");
  logActivity("Branch Updated", "branches", branchId);
  return updated;
}

export function logActivity(action: string, entity: string, entityId: string) {
  serverActivity = [
    {
      id: id("activity"),
      action,
      entity,
      entityId,
      user: "Robot Cafe Admin",
      timestamp: now(),
    },
    ...serverActivity,
  ].slice(0, 30);
}
