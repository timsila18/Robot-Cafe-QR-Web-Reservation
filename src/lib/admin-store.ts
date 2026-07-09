import { branches } from "@/lib/demo-data";
import type { ManagedImage } from "@/lib/images/image-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

type AdminState = {
  menuItems: AdminMenuItem[];
  categories: AdminCategory[];
  branches: AdminBranch[];
  activityLogs: ActivityLog[];
  feedbackCount: number;
  qrScans: number;
};

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const fallbackBranches: AdminBranch[] = branches.map((branch) => ({
  id: branch.id,
  name: branch.name,
  slug: branch.slug,
  location: branch.location,
  phone: branch.phone,
  email: branch.email,
  openingHours: "8:00 AM - 10:00 PM",
  isActive: branch.isActive,
  updatedAt: branch.updatedAt,
}));

const emptyAdminState = (): AdminState => ({
  menuItems: [],
  categories: [],
  branches: fallbackBranches,
  activityLogs: [],
  feedbackCount: 0,
  qrScans: 0,
});

declare global {
  var robotCafeDemoAdminState: AdminState | undefined;
}

const demoState = () => {
  globalThis.robotCafeDemoAdminState ??= emptyAdminState();
  return globalThis.robotCafeDemoAdminState;
};

const requireSupabase = () => {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Database persistence is not configured. Add Supabase environment variables before saving admin changes.");
  }
  return supabase;
};

const toBranch = (row: Record<string, unknown>): AdminBranch => {
  const openingHours = row.opening_hours as Record<string, unknown> | null;
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    location: String(row.location),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    openingHours: String(openingHours?.daily ?? "8:00 AM - 10:00 PM"),
    isActive: Boolean(row.is_active),
    updatedAt: String(row.updated_at ?? row.created_at ?? now()),
  };
};

const toCategory = (row: Record<string, unknown>): AdminCategory => ({
  id: String(row.id),
  name: String(row.name),
  slug: String(row.slug),
  description: String(row.description ?? ""),
  imageUrl: String(row.image_url ?? ""),
  sortOrder: Number(row.sort_order ?? 0),
  isActive: Boolean(row.is_active),
  updatedAt: String(row.updated_at ?? row.created_at ?? now()),
});

const categoryPayload = (input: CategoryInput) => ({
  name: input.name,
  slug: input.slug,
  description: input.description,
  image_url: input.imageUrl || null,
  sort_order: input.sortOrder,
  is_active: input.isActive,
});

const categoryPayloadWithoutImage = (input: CategoryInput) => {
  const { image_url: _imageUrl, ...payload } = categoryPayload(input);
  void _imageUrl;
  return payload;
};

const isMissingImageColumnError = (message: string) => message.toLowerCase().includes("image_url");

const toImage = (row: Record<string, unknown>): AdminImage => ({
  id: String(row.id),
  imageUrl: String(row.image_url),
  thumbnailUrl: String(row.thumbnail_url ?? row.image_url),
  cardUrl: String(row.card_url ?? row.image_url),
  detailUrl: String(row.detail_url ?? row.image_url),
  fileName: String(row.file_name ?? "menu-image.webp"),
  fileSize: Number(row.file_size ?? 0),
  mimeType: String(row.mime_type ?? "image/webp"),
  width: Number(row.width ?? 0),
  height: Number(row.height ?? 0),
  isPrimary: Boolean(row.is_primary),
  sortOrder: Number(row.sort_order ?? 0),
  createdAt: String(row.created_at ?? now()),
});

const toMenuItem = (row: Record<string, unknown>): AdminMenuItem => {
  const images = Array.isArray(row.menu_item_images) ? row.menu_item_images.map((image) => toImage(image as Record<string, unknown>)) : [];
  const availability = Array.isArray(row.menu_item_branch_availability) ? row.menu_item_branch_availability : [];
  const availableBranches = availability
    .map((entry) => {
      const record = entry as Record<string, unknown>;
      const branch = record.branches as Record<string, unknown> | null;
      return branch?.slug ? String(branch.slug) : "";
    })
    .filter(Boolean);

  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    shortDescription: String(row.short_description ?? row.description ?? ""),
    price: Number(row.price ?? 0),
    preparationTime: Number(row.preparation_time ?? 0),
    ingredients: Array.isArray(row.ingredients) ? row.ingredients.map(String) : [],
    allergens: Array.isArray(row.allergens) ? row.allergens.map(String) : [],
    calories: Number(row.calories ?? 0),
    categoryId: String(row.category_id),
    isFeatured: Boolean(row.is_featured),
    isBestSeller: Boolean(row.is_best_seller),
    isNewArrival: Boolean(row.is_new_arrival),
    isActive: Boolean(row.is_active),
    isSoldOut: Boolean(row.is_sold_out),
    displayOrder: Number(row.display_order ?? 0),
    availableBranches,
    images: images.sort((a, b) => a.sortOrder - b.sortOrder),
    updatedAt: String(row.updated_at ?? row.created_at ?? now()),
  };
};

const toActivity = (row: Record<string, unknown>): ActivityLog => ({
  id: String(row.id),
  action: String(row.action),
  user: String(row.user_name ?? "Robot Cafe Admin"),
  entity: String(row.entity),
  entityId: String(row.entity_id ?? ""),
  timestamp: String(row.created_at ?? now()),
});

export async function listAdminState(): Promise<AdminState> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") {
      throw new Error("Supabase persistence is required but not configured.");
    }
    return demoState();
  }

  const [branchesResult, categoriesResult, menuItemsResult, activityResult, feedbackResult, qrResult] = await Promise.all([
    supabase.from("branches").select("*").order("name", { ascending: true }),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*, menu_item_images(*), menu_item_branch_availability(is_available, branches(slug))")
      .order("display_order", { ascending: true })
      .order("updated_at", { ascending: false }),
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(30),
    supabase.from("feedback").select("id", { count: "exact", head: true }),
    supabase.from("qr_scans").select("id", { count: "exact", head: true }),
  ]);

  if (branchesResult.error) throw new Error(`Unable to load branches: ${branchesResult.error.message}`);
  if (categoriesResult.error) throw new Error(`Unable to load categories: ${categoriesResult.error.message}`);
  if (menuItemsResult.error) throw new Error(`Unable to load menu items: ${menuItemsResult.error.message}`);

  return {
    branches: branchesResult.data.map(toBranch),
    categories: categoriesResult.data.map(toCategory),
    menuItems: menuItemsResult.data.map(toMenuItem),
    activityLogs: activityResult.error ? [] : activityResult.data.map(toActivity),
    feedbackCount: feedbackResult.count ?? 0,
    qrScans: qrResult.count ?? 0,
  };
}

async function syncMenuItemImages(menuItemId: string, images: AdminImage[]) {
  const supabase = requireSupabase();
  const { error: deleteError } = await supabase.from("menu_item_images").delete().eq("menu_item_id", menuItemId);
  if (deleteError) throw new Error(`Unable to replace menu images: ${deleteError.message}`);
  if (!images.length) return;

  const { error } = await supabase.from("menu_item_images").insert(
    images.map((image, index) => ({
      menu_item_id: menuItemId,
      image_url: image.imageUrl,
      thumbnail_url: image.thumbnailUrl,
      card_url: image.cardUrl,
      detail_url: image.detailUrl,
      file_name: image.fileName,
      file_size: image.fileSize,
      mime_type: image.mimeType,
      width: image.width,
      height: image.height,
      is_primary: image.isPrimary || index === 0,
      sort_order: index + 1,
    })),
  );
  if (error) throw new Error(`Unable to save menu images: ${error.message}`);
}

async function syncMenuItemBranches(menuItemId: string, branchReferences: string[]) {
  const supabase = requireSupabase();
  const { data: allBranches, error: branchError } = await supabase.from("branches").select("id, slug");
  if (branchError) throw new Error(`Unable to validate branches: ${branchError.message}`);

  const branchByReference = new Map<string, { id: string; slug: string }>();
  allBranches.forEach((branch) => {
    branchByReference.set(String(branch.id), { id: String(branch.id), slug: String(branch.slug) });
    branchByReference.set(String(branch.slug), { id: String(branch.id), slug: String(branch.slug) });
  });

  const branchRows = branchReferences.map((branchReference) => {
    const branch = branchByReference.get(branchReference);
    if (!branch) throw new Error(`Invalid branch assignment: ${branchReference}`);
    return branch;
  });

  const uniqueBranchRows = Array.from(new Map(branchRows.map((branch) => [branch.id, branch])).values());

  const { error: deleteError } = await supabase.from("menu_item_branch_availability").delete().eq("menu_item_id", menuItemId);
  if (deleteError) throw new Error(`Unable to replace branch availability: ${deleteError.message}`);
  if (!uniqueBranchRows.length) return;

  const { error } = await supabase.from("menu_item_branch_availability").insert(
    uniqueBranchRows.map((branch) => ({
      menu_item_id: menuItemId,
      branch_id: branch.id,
      is_available: true,
    })),
  );
  if (error) throw new Error(`Unable to save branch availability: ${error.message}`);
}

async function getMenuItem(itemId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error("Supabase persistence is required but not configured.");
    const item = demoState().menuItems.find((entry) => entry.id === itemId);
    if (!item) throw new Error("Menu item not found.");
    return item;
  }
  const { data, error } = await supabase
    .from("menu_items")
    .select("*, menu_item_images(*), menu_item_branch_availability(is_available, branches(slug))")
    .eq("id", itemId)
    .single();
  if (error) throw new Error(`Unable to load saved menu item: ${error.message}`);
  return toMenuItem(data);
}

export async function createMenuItem(input: MenuItemInput) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error("Supabase persistence is required but not configured.");
    const item = { ...input, id: id("item"), updatedAt: now() };
    const state = demoState();
    state.menuItems = [item, ...state.menuItems];
    await logActivity("Menu Created", "menu_items", item.id);
    return item;
  }
  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      short_description: input.shortDescription,
      price: input.price,
      preparation_time: input.preparationTime,
      ingredients: input.ingredients,
      allergens: input.allergens,
      calories: input.calories,
      category_id: input.categoryId,
      is_featured: input.isFeatured,
      is_best_seller: input.isBestSeller,
      is_new_arrival: input.isNewArrival,
      is_active: input.isActive,
      is_sold_out: input.isSoldOut,
      display_order: input.displayOrder,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Unable to create menu item: ${error.message}`);
  await syncMenuItemImages(data.id, input.images);
  await syncMenuItemBranches(data.id, input.availableBranches);
  await logActivity("Menu Created", "menu_items", data.id);
  return getMenuItem(data.id);
}

export async function updateMenuItem(itemId: string, input: MenuItemInput) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error("Supabase persistence is required but not configured.");
    const state = demoState();
    let updated: AdminMenuItem | undefined;
    state.menuItems = state.menuItems.map((item) => {
      if (item.id !== itemId) return item;
      updated = { ...input, id: itemId, updatedAt: now() };
      return updated;
    });
    if (!updated) throw new Error("Menu item not found.");
    await logActivity("Menu Updated", "menu_items", itemId);
    return updated;
  }
  const { error } = await supabase
    .from("menu_items")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      short_description: input.shortDescription,
      price: input.price,
      preparation_time: input.preparationTime,
      ingredients: input.ingredients,
      allergens: input.allergens,
      calories: input.calories,
      category_id: input.categoryId,
      is_featured: input.isFeatured,
      is_best_seller: input.isBestSeller,
      is_new_arrival: input.isNewArrival,
      is_active: input.isActive,
      is_sold_out: input.isSoldOut,
      display_order: input.displayOrder,
    })
    .eq("id", itemId);

  if (error) throw new Error(`Unable to update menu item: ${error.message}`);
  await syncMenuItemImages(itemId, input.images);
  await syncMenuItemBranches(itemId, input.availableBranches);
  await logActivity("Menu Updated", "menu_items", itemId);
  return getMenuItem(itemId);
}

export async function deleteMenuItem(itemId: string) {
  const existing = await getMenuItem(itemId);
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error("Supabase persistence is required but not configured.");
    const state = demoState();
    state.menuItems = state.menuItems.filter((item) => item.id !== itemId);
    await logActivity("Menu Deleted", "menu_items", itemId);
    return existing;
  }
  const { error } = await supabase.from("menu_items").delete().eq("id", itemId);
  if (error) throw new Error(`Unable to delete menu item: ${error.message}`);
  await logActivity("Menu Deleted", "menu_items", itemId);
  return existing;
}

export async function createCategory(input: CategoryInput) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error("Supabase persistence is required but not configured.");
    const category = { ...input, id: id("category"), updatedAt: now() };
    const state = demoState();
    state.categories = [category, ...state.categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    await logActivity("Category Created", "categories", category.id);
    return category;
  }
  const { data, error } = await supabase
    .from("categories")
    .insert(categoryPayload(input))
    .select("*")
    .single();
  if (error && isMissingImageColumnError(error.message)) {
    const fallback = await supabase.from("categories").insert(categoryPayloadWithoutImage(input)).select("*").single();
    if (fallback.error) throw new Error(`Unable to create category: ${fallback.error.message}`);
    await logActivity("Category Created", "categories", fallback.data.id);
    return toCategory(fallback.data);
  }
  if (error) throw new Error(`Unable to create category: ${error.message}`);
  await logActivity("Category Created", "categories", data.id);
  return toCategory(data);
}

export async function updateCategory(categoryId: string, input: CategoryInput) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error("Supabase persistence is required but not configured.");
    const state = demoState();
    let updated: AdminCategory | undefined;
    state.categories = state.categories
      .map((category) => {
        if (category.id !== categoryId) return category;
        updated = { ...input, id: categoryId, updatedAt: now() };
        return updated;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    if (!updated) throw new Error("Category not found.");
    await logActivity("Category Updated", "categories", categoryId);
    return updated;
  }
  const { data, error } = await supabase
    .from("categories")
    .update(categoryPayload(input))
    .eq("id", categoryId)
    .select("*")
    .single();
  if (error && isMissingImageColumnError(error.message)) {
    const fallback = await supabase.from("categories").update(categoryPayloadWithoutImage(input)).eq("id", categoryId).select("*").single();
    if (fallback.error) throw new Error(`Unable to update category: ${fallback.error.message}`);
    await logActivity("Category Updated", "categories", categoryId);
    return toCategory(fallback.data);
  }
  if (error) throw new Error(`Unable to update category: ${error.message}`);
  await logActivity("Category Updated", "categories", categoryId);
  return toCategory(data);
}

export async function deleteCategory(categoryId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error("Supabase persistence is required but not configured.");
    const state = demoState();
    if (state.menuItems.some((item) => item.categoryId === categoryId)) throw new Error("This category is referenced by menu items. Deactivate it instead.");
    state.categories = state.categories.filter((category) => category.id !== categoryId);
    await logActivity("Category Deleted", "categories", categoryId);
    return;
  }
  const { count, error: countError } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (countError) throw new Error(`Unable to validate category usage: ${countError.message}`);
  if ((count ?? 0) > 0) throw new Error("This category is referenced by menu items. Deactivate it instead.");

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) throw new Error(`Unable to delete category: ${error.message}`);
  await logActivity("Category Deleted", "categories", categoryId);
}

export async function createBranch(input: BranchInput) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error("Supabase persistence is required but not configured.");
    const branch = { ...input, id: id("branch"), updatedAt: now() };
    const state = demoState();
    state.branches = [branch, ...state.branches].sort((a, b) => a.name.localeCompare(b.name));
    await logActivity("Branch Created", "branches", branch.id);
    return branch;
  }
  const { data, error } = await supabase
    .from("branches")
    .insert({
      name: input.name,
      slug: input.slug,
      location: input.location,
      phone: input.phone,
      email: input.email,
      opening_hours: { daily: input.openingHours },
      is_active: input.isActive,
    })
    .select("*")
    .single();
  if (error) throw new Error(`Unable to create branch: ${error.message}`);
  await logActivity("Branch Created", "branches", data.id);
  return toBranch(data);
}

export async function updateBranch(branchId: string, input: BranchInput) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    if (process.env.REQUIRE_SUPABASE_PERSISTENCE === "true") throw new Error("Supabase persistence is required but not configured.");
    const state = demoState();
    let updated: AdminBranch | undefined;
    state.branches = state.branches
      .map((branch) => {
        if (branch.id !== branchId) return branch;
        updated = { ...input, id: branchId, updatedAt: now() };
        return updated;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!updated) throw new Error("Branch not found.");
    await logActivity("Branch Updated", "branches", branchId);
    return updated;
  }
  const { data, error } = await supabase
    .from("branches")
    .update({
      name: input.name,
      slug: input.slug,
      location: input.location,
      phone: input.phone,
      email: input.email,
      opening_hours: { daily: input.openingHours },
      is_active: input.isActive,
    })
    .eq("id", branchId)
    .select("*")
    .single();
  if (error) throw new Error(`Unable to update branch: ${error.message}`);
  await logActivity("Branch Updated", "branches", branchId);
  return toBranch(data);
}

export async function logActivity(action: string, entity: string, entityId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    const state = demoState();
    state.activityLogs = [
      { id: id("activity"), action, user: "Robot Cafe Admin", entity, entityId, timestamp: now() },
      ...state.activityLogs,
    ].slice(0, 50);
    return;
  }
  await supabase.from("activity_logs").insert({
    action,
    entity,
    entity_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entityId) ? entityId : null,
    user_name: "Robot Cafe Admin",
    metadata: { entityId },
  });
}
