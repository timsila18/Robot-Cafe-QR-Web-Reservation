"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { AdminBranch, AdminCategory, AdminImage, AdminMenuItem } from "@/lib/admin-store";
import { compressImage } from "@/lib/images/image-compression";
import { canUseDemoPersistence, readDemoBranches, readDemoCategories, readDemoMenuItems, saveDemoMenuItems } from "@/lib/demo-persistence";
import { deleteImage, replaceImage, uploadImage } from "@/lib/images/image-storage";
import type { UploadProgress } from "@/lib/images/image-types";
import { maxImagesPerItem, validateImageCount, validateImageFile } from "@/lib/images/image-validation";
import { formatBytes, getOptimizedImageUrl, normalizeImageOrder } from "@/lib/images/image-utils";

type AdminMenuManagerProps = {
  initialItems: AdminMenuItem[];
  categories: AdminCategory[];
  branches: AdminBranch[];
};

const pageSize = 8;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const emptyItem = (categories: AdminCategory[], branches: AdminBranch[]): AdminMenuItem => ({
  id: "",
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  price: 0,
  preparationTime: 15,
  ingredients: [],
  allergens: [],
  calories: 0,
  categoryId: categories[0]?.id ?? "",
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  isActive: true,
  isSoldOut: false,
  displayOrder: 0,
  availableBranches: branches.filter((branch) => branch.isActive).map((branch) => branch.slug),
  images: [],
  updatedAt: new Date().toISOString(),
});

export function AdminMenuManager({ initialItems, categories, branches }: AdminMenuManagerProps) {
  const [items, setItems] = useState(() => readDemoMenuItems(initialItems));
  const [availableCategories] = useState(() => readDemoCategories(categories));
  const [availableBranches] = useState(() => readDemoBranches(branches));
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [view, setView] = useState<"table" | "cards">("table");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<AdminMenuItem | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return items
      .filter((item) => {
        const category = availableCategories.find((entry) => entry.id === item.categoryId);
        const matchesQuery =
          !cleanQuery ||
          item.name.toLowerCase().includes(cleanQuery) ||
          item.description.toLowerCase().includes(cleanQuery) ||
          category?.name.toLowerCase().includes(cleanQuery);
        const matchesCategory = categoryFilter === "all" || item.categoryId === categoryFilter;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.isActive) ||
          (statusFilter === "inactive" && !item.isActive) ||
          (statusFilter === "sold-out" && item.isSoldOut) ||
          (statusFilter === "featured" && item.isFeatured);
        return matchesQuery && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "price") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "display") return a.displayOrder - b.displayOrder;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [availableCategories, categoryFilter, items, query, sortBy, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const persistItems = (nextItems: AdminMenuItem[]) => {
    setItems(nextItems);
    saveDemoMenuItems(nextItems);
  };

  const saveDemoItem = (item: AdminMenuItem, message?: string) => {
    const isNew = !item.id;
    const savedItem = {
      ...item,
      id: isNew ? uniqueItemId(items, item.slug || item.name) : item.id,
      slug: slugify(item.slug || item.name),
      updatedAt: new Date().toISOString(),
    };
    const nextItems = isNew ? [savedItem, ...items] : items.map((entry) => (entry.id === item.id ? savedItem : entry));
    persistItems(nextItems);
    setEditing(null);
    notify(message ?? (isNew ? "Menu item created in demo storage." : "Menu item updated in demo storage."));
  };

  const saveItem = async (item: AdminMenuItem) => {
    if (item.availableBranches.length === 0) {
      notify("Select at least one branch.");
      return;
    }

    const isNew = !item.id;
    const payload = { ...item, id: undefined };
    const response = await fetch(isNew ? "/api/admin/menu-items" : `/api/admin/menu-items/${item.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      if (canUseDemoPersistence(result.error)) {
        saveDemoItem(item, `${isNew ? "Created" : "Saved"} locally for this Vercel demo.`);
        return;
      }
      notify(result.error ?? "Unable to save item.");
      return;
    }

    persistItems(isNew ? [result.data, ...items] : items.map((entry) => (entry.id === item.id ? result.data : entry)));
    setEditing(null);
    notify(isNew ? "Menu item created." : "Menu item updated.");
  };

  const removeItem = async (itemId: string) => {
    if (!window.confirm("Delete this menu item? This requires confirmation.")) return;
    const response = await fetch(`/api/admin/menu-items/${itemId}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      if (canUseDemoPersistence(result.error)) {
        persistItems(items.filter((item) => item.id !== itemId));
        notify("Menu item deleted locally for this Vercel demo.");
        return;
      }
      notify(result.error ?? "Unable to delete menu item.");
      return;
    }
    persistItems(items.filter((item) => item.id !== itemId));
    notify("Menu item deleted.");
  };

  const patchItem = async (itemId: string, patch: Partial<AdminMenuItem>, message: string) => {
    const currentItem = items.find((item) => item.id === itemId);
    if (!currentItem) return;
    const nextItem = { ...currentItem, ...patch, updatedAt: new Date().toISOString() };
    const response = await fetch(`/api/admin/menu-items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nextItem, id: undefined }),
    });
    const result = await response.json();
    if (!response.ok) {
      if (canUseDemoPersistence(result.error)) {
        saveDemoItem(nextItem, message);
        return;
      }
      notify(result.error ?? "Unable to update item.");
      return;
    }
    persistItems(items.map((item) => (item.id === itemId ? result.data : item)));
    notify(message);
  };

  const duplicate = async (item: AdminMenuItem) => {
    const copy = {
      ...item,
      id: "",
      name: `${item.name} Copy`,
      slug: `${item.slug}-copy-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    await saveItem(copy);
  };

  const bulk = async (patch: Partial<AdminMenuItem>, message: string) => {
    for (const itemId of selected) {
      await patchItem(itemId, patch, message);
    }
    setSelected([]);
  };

  return (
    <div className="space-y-6">
      {toast ? <div className="fixed right-5 top-24 z-50 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div> : null}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-950">Menu Management</h2>
          <p className="mt-2 text-sm text-slate-500">Create, edit, publish, and control branch visibility for every menu item.</p>
        </div>
        <button className="premium-button" type="button" onClick={() => setEditing(emptyItem(availableCategories, availableBranches))}>
          Create Item
        </button>
      </section>

      <section className="luxury-panel grid gap-3 p-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <input className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" placeholder="Search menu items" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
        <select className="h-12 rounded-xl border border-slate-200 px-4" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="all">All categories</option>
          {availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select className="h-12 rounded-xl border border-slate-200 px-4" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="sold-out">Sold out</option>
          <option value="featured">Featured</option>
        </select>
        <select className="h-12 rounded-xl border border-slate-200 px-4" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="updated">Recently updated</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="display">Display order</option>
        </select>
        <button className="ghost-button min-h-12" type="button" onClick={() => setView(view === "table" ? "cards" : "table")}>{view === "table" ? "Card View" : "Table View"}</button>
      </section>

      <section className="flex flex-wrap gap-2">
        <button className="ghost-button min-h-10 px-3" disabled={!selected.length} type="button" onClick={() => void bulk({ isActive: true }, "Selected items activated.")}>Activate</button>
        <button className="ghost-button min-h-10 px-3" disabled={!selected.length} type="button" onClick={() => void bulk({ isActive: false }, "Selected items deactivated.")}>Deactivate</button>
        <button className="ghost-button min-h-10 px-3" disabled={!selected.length} type="button" onClick={() => void bulk({ isSoldOut: true }, "Selected items marked sold out.")}>Sold Out</button>
      </section>

      {view === "table" ? (
        <MenuTable
          categories={availableCategories}
          duplicate={duplicate}
          items={visible}
          patchItem={patchItem}
          removeItem={removeItem}
          selected={selected}
          setEditing={setEditing}
          setSelected={setSelected}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <MenuCard key={item.id} categories={availableCategories} duplicate={duplicate} item={item} patchItem={patchItem} removeItem={removeItem} setEditing={setEditing} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Page {page} of {pageCount} · {filtered.length} items</p>
        <div className="flex gap-2">
          <button className="ghost-button min-h-10 px-3" disabled={page === 1} type="button" onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <button className="ghost-button min-h-10 px-3" disabled={page === pageCount} type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
        </div>
      </div>

      {editing ? <MenuItemEditor branches={availableBranches} categories={availableCategories} item={editing} onClose={() => setEditing(null)} onSave={saveItem} /> : null}
    </div>
  );
}

function MenuTable(props: {
  items: AdminMenuItem[];
  categories: AdminCategory[];
  selected: string[];
  setSelected: (value: string[]) => void;
  setEditing: (item: AdminMenuItem) => void;
  patchItem: (itemId: string, patch: Partial<AdminMenuItem>, message: string) => Promise<void>;
  duplicate: (item: AdminMenuItem) => Promise<void>;
  removeItem: (itemId: string) => void;
}) {
  return (
    <div className="luxury-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-4">Select</th>
              <th className="px-4 py-4">Item</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Price</th>
              <th className="px-4 py-4">Branches</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {props.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-4">
                  <input
                    checked={props.selected.includes(item.id)}
                    type="checkbox"
                    onChange={(event) =>
                      props.setSelected(event.target.checked ? [...props.selected, item.id] : props.selected.filter((id) => id !== item.id))
                    }
                  />
                </td>
                <td className="px-4 py-4 font-semibold text-slate-950">{item.name}</td>
                <td className="px-4 py-4 text-slate-500">{props.categories.find((category) => category.id === item.categoryId)?.name}</td>
                <td className="px-4 py-4 text-gold">KES {item.price.toLocaleString()}</td>
                <td className="px-4 py-4 text-slate-500">{item.availableBranches.join(", ")}</td>
                <td className="px-4 py-4 text-slate-500">{item.isActive ? "Active" : "Inactive"} · {item.isSoldOut ? "Sold out" : "Available"}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button className="text-gold" type="button" onClick={() => props.setEditing(item)}>Edit</button>
                    <button className="text-gold" type="button" onClick={() => void props.duplicate(item)}>Duplicate</button>
                    <button className="text-slate-500" type="button" onClick={() => void props.patchItem(item.id, { isActive: !item.isActive }, item.isActive ? "Item deactivated." : "Item activated.")}>{item.isActive ? "Deactivate" : "Activate"}</button>
                    <button className="text-slate-500" type="button" onClick={() => void props.patchItem(item.id, { isActive: false, archivedAt: new Date().toISOString() }, "Item archived.")}>Archive</button>
                    <button className="text-red-600" type="button" onClick={() => props.removeItem(item.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuCard(props: {
  item: AdminMenuItem;
  categories: AdminCategory[];
  setEditing: (item: AdminMenuItem) => void;
  patchItem: (itemId: string, patch: Partial<AdminMenuItem>, message: string) => Promise<void>;
  duplicate: (item: AdminMenuItem) => Promise<void>;
  removeItem: (itemId: string) => void;
}) {
  const primaryImage = props.item.images.find((image) => image.isPrimary) ?? props.item.images[0];

  return (
    <article className="luxury-panel overflow-hidden">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <Image
          alt={props.item.name}
          className="object-cover"
          fill
          sizes="(min-width: 1280px) 28vw, (min-width: 768px) 45vw, 100vw"
          src={getOptimizedImageUrl(primaryImage, "card")}
          unoptimized={getOptimizedImageUrl(primaryImage, "card").startsWith("data:")}
        />
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{props.categories.find((category) => category.id === props.item.categoryId)?.name}</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">{props.item.name}</h3>
        <p className="mt-2 text-sm text-slate-500">{props.item.shortDescription}</p>
        <p className="mt-4 font-semibold text-gold">KES {props.item.price.toLocaleString()}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <button className="text-gold" type="button" onClick={() => props.setEditing(props.item)}>Edit</button>
          <button className="text-gold" type="button" onClick={() => void props.duplicate(props.item)}>Duplicate</button>
          <button className="text-slate-500" type="button" onClick={() => void props.patchItem(props.item.id, { isSoldOut: !props.item.isSoldOut }, "Availability changed.")}>Toggle Sold Out</button>
          <button className="text-red-600" type="button" onClick={() => props.removeItem(props.item.id)}>Delete</button>
        </div>
      </div>
    </article>
  );
}

function MenuItemEditor({
  item,
  categories,
  branches,
  onSave,
  onClose,
}: {
  item: AdminMenuItem;
  categories: AdminCategory[];
  branches: AdminBranch[];
  onSave: (item: AdminMenuItem) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(item);
  const [imageUrl, setImageUrl] = useState("");
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [mediaError, setMediaError] = useState("");

  const set = <K extends keyof AdminMenuItem>(key: K, value: AdminMenuItem[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const addImage = (url: string) => {
    if (!url) return;
    const image: AdminImage = {
      id: `image-${crypto.randomUUID()}`,
      imageUrl: url,
      thumbnailUrl: url,
      cardUrl: url,
      detailUrl: url,
      fileName: "external-image",
      fileSize: 0,
      mimeType: "image/url",
      width: 0,
      height: 0,
      isPrimary: draft.images.length === 0,
      sortOrder: draft.images.length + 1,
      createdAt: new Date().toISOString(),
    };
    set("images", [...draft.images, image]);
    setImageUrl("");
  };
  const updateProgress = (fileName: string, patch: Partial<UploadProgress>) => {
    setProgress((current) =>
      current.map((entry) => (entry.fileName === fileName ? { ...entry, ...patch } : entry)),
    );
  };
  const handleFiles = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files);
    const countCheck = validateImageCount(draft.images.length, selectedFiles.length);
    setMediaError("");

    if (!countCheck.ok) {
      setMediaError(countCheck.error);
      return;
    }

    setProgress(selectedFiles.map((file) => ({ fileName: file.name, progress: 8, status: "validating" })));

    let nextImageCount = draft.images.length;
    for (const file of selectedFiles) {
      const validation = validateImageFile(file);
      if (!validation.ok) {
        updateProgress(file.name, { progress: 100, status: "error", error: validation.error });
        setMediaError(validation.error);
        continue;
      }

      try {
        updateProgress(file.name, { progress: 32, status: "optimizing" });
        const bundle = await compressImage(file);
        updateProgress(file.name, { progress: 76, status: "uploading" });
        const image = await uploadImage({
          file,
          bundle,
          menuItemId: draft.id || undefined,
          sortOrder: nextImageCount + 1,
          isPrimary: nextImageCount === 0,
        });
        nextImageCount += 1;
        setDraft((current) => ({ ...current, images: normalizeImageOrder([...current.images, image]) }));
        updateProgress(file.name, { progress: 100, status: "complete" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Image upload failed.";
        updateProgress(file.name, { progress: 100, status: "error", error: message });
        setMediaError(message);
      }
    }
  };
  const replaceExistingImage = async (image: AdminImage, file: File) => {
    const validation = validateImageFile(file);
    if (!validation.ok) {
      setMediaError(validation.error);
      return;
    }

    try {
      setMediaError("");
      setProgress([{ fileName: file.name, progress: 20, status: "optimizing" }]);
      const bundle = await compressImage(file);
      setProgress([{ fileName: file.name, progress: 78, status: "uploading" }]);
      const replacement = await replaceImage(image, file, bundle);
      set("images", draft.images.map((entry) => (entry.id === image.id ? replacement : entry)));
      setProgress([{ fileName: file.name, progress: 100, status: "complete" }]);
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Unable to replace this image.");
    }
  };
  const removeImage = async (image: AdminImage) => {
    await deleteImage(image);
    set("images", normalizeImageOrder(draft.images.filter((entry) => entry.id !== image.id)));
  };
  const setPrimary = (imageId: string) => {
    set("images", draft.images.map((entry) => ({ ...entry, isPrimary: entry.id === imageId })));
  };
  const moveImage = (index: number, direction: -1 | 1) => {
    set("images", reorder(draft.images, index, index + direction));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-950">{draft.id ? "Edit Menu Item" : "Create Menu Item"}</h3>
            <p className="mt-1 text-sm text-slate-500">Branch availability controls exactly where this item appears.</p>
          </div>
          <button className="ghost-button min-h-10 px-3" type="button" onClick={onClose}>Close</button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Field label="Name" value={draft.name} onChange={(value) => { set("name", value); set("slug", slugify(value)); }} />
          <Field label="Slug" value={draft.slug} onChange={(value) => set("slug", slugify(value))} />
          <Field label="Short Description" value={draft.shortDescription} onChange={(value) => set("shortDescription", value)} />
          <Field label="Price" type="number" value={String(draft.price)} onChange={(value) => set("price", Number(value))} />
          <Field label="Preparation Time" type="number" value={String(draft.preparationTime)} onChange={(value) => set("preparationTime", Number(value))} />
          <Field label="Calories" type="number" value={String(draft.calories)} onChange={(value) => set("calories", Number(value))} />
          <label className="block text-sm font-medium text-slate-700">
            Category
            <select className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" value={draft.categoryId} onChange={(event) => set("categoryId", event.target.value)}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <Field label="Display Order" type="number" value={String(draft.displayOrder)} onChange={(value) => set("displayOrder", Number(value))} />
          <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
            Description
            <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 p-4" value={draft.description} onChange={(event) => set("description", event.target.value)} />
          </label>
          <Field label="Ingredients" value={draft.ingredients.join(", ")} onChange={(value) => set("ingredients", value.split(",").map((part) => part.trim()).filter(Boolean))} />
          <Field label="Allergens" value={draft.allergens.join(", ")} onChange={(value) => set("allergens", value.split(",").map((part) => part.trim()).filter(Boolean))} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <fieldset className="luxury-panel p-4">
            <legend className="text-sm font-semibold text-slate-950">Branch Availability</legend>
            <div className="mt-4 space-y-3">
              {branches.map((branch) => (
                <label className="flex items-center gap-3 text-sm text-slate-700" key={branch.id}>
                  <input
                    checked={draft.availableBranches.includes(branch.slug)}
                    type="checkbox"
                    onChange={(event) =>
                      set(
                        "availableBranches",
                        event.target.checked
                          ? [...draft.availableBranches, branch.slug]
                          : draft.availableBranches.filter((slug) => slug !== branch.slug),
                      )
                    }
                  />
                  {branch.name.replace("Robot Cafe - ", "")}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="luxury-panel p-4">
            <legend className="text-sm font-semibold text-slate-950">Flags</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["isFeatured", "Featured"],
                ["isBestSeller", "Best Seller"],
                ["isNewArrival", "New Arrival"],
                ["isActive", "Active"],
                ["isSoldOut", "Sold Out"],
              ].map(([key, label]) => (
                <label className="flex items-center gap-3 text-sm text-slate-700" key={key}>
                  <input checked={Boolean(draft[key as keyof AdminMenuItem])} type="checkbox" onChange={(event) => set(key as keyof AdminMenuItem, event.target.checked as never)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <section className="mt-6 luxury-panel p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-950">Media Library</h4>
              <p className="mt-1 text-xs text-slate-500">Upload up to {maxImagesPerItem} optimized food photos. Each file is resized into thumbnail, card, and detail versions before saving.</p>
            </div>
            <p className="text-xs font-semibold text-gold">{draft.images.length}/{maxImagesPerItem} images</p>
          </div>
          <div
            className="mt-4 rounded-2xl border border-dashed border-gold/35 bg-gradient-to-br from-white via-sky-50/65 to-emerald-50/55 p-5 transition hover:border-gold"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void handleFiles(event.dataTransfer.files);
            }}
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-base font-semibold text-slate-950">Drop high-resolution food photos here</p>
                <p className="mt-1 text-sm text-slate-500">JPG, JPEG, PNG, WEBP. Max 20MB per image. Robot Cafe creates lightweight WEBP versions for fast menu browsing.</p>
              </div>
              <label className="premium-button cursor-pointer">
                Select Images
                <input
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="sr-only"
                  multiple
                  type="file"
                  onChange={(event) => {
                    if (event.target.files) void handleFiles(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4" placeholder="Paste existing Robot Cafe image URL" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
              <button className="ghost-button" type="button" onClick={() => addImage(imageUrl)}>Add URL</button>
            </div>
          </div>
          {mediaError ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{mediaError}</p> : null}
          {progress.length ? (
            <div className="mt-4 grid gap-2">
              {progress.map((entry) => (
                <div className="rounded-xl border border-slate-200 bg-white p-3" key={entry.fileName}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate font-semibold text-slate-700">{entry.fileName}</span>
                    <span className={entry.status === "error" ? "text-red-600" : "text-gold"}>{entry.status}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${entry.progress}%` }} />
                  </div>
                  {entry.error ? <p className="mt-2 text-xs text-red-600">{entry.error}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
          {draft.images.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-sky-50 text-gold">RC</div>
              <p className="mt-4 font-semibold text-slate-950">No menu photos yet</p>
              <p className="mt-1 text-sm text-slate-500">Add premium dish photography to make this item feel ready for a flagship Robot Cafe menu.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {draft.images.map((image, index) => (
                <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl" key={image.id}>
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <Image
                      alt={image.fileName}
                      className="object-cover transition duration-300 group-hover:scale-105"
                      fill
                      sizes="(min-width: 1280px) 26vw, (min-width: 640px) 44vw, 100vw"
                      src={getOptimizedImageUrl(image, "card")}
                      unoptimized={getOptimizedImageUrl(image, "card").startsWith("data:")}
                    />
                    {image.isPrimary ? <span className="absolute left-3 top-3 rounded-full bg-success px-3 py-1 text-xs font-bold text-white">Primary</span> : null}
                  </div>
                  <div className="space-y-3 p-3">
                    <div>
                      <p className="truncate text-sm font-semibold text-slate-950">{image.fileName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {image.width}x{image.height} · {formatBytes(image.fileSize)} · {image.mimeType.replace("image/", "").toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(image.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                      <button className="ghost-button min-h-9 px-2 text-xs" type="button" onClick={() => setPrimary(image.id)}>Primary</button>
                      <button className="ghost-button min-h-9 px-2 text-xs" disabled={index === 0} type="button" onClick={() => moveImage(index, -1)}>Left</button>
                      <button className="ghost-button min-h-9 px-2 text-xs" disabled={index === draft.images.length - 1} type="button" onClick={() => moveImage(index, 1)}>Right</button>
                      <label className="ghost-button min-h-9 cursor-pointer px-2 text-xs">
                        Replace
                        <input
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="sr-only"
                          type="file"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void replaceExistingImage(image, file);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                      <button className="ghost-button min-h-9 px-2 text-xs text-red-600" type="button" onClick={() => void removeImage(image)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button className="ghost-button" type="button" onClick={onClose}>Cancel</button>
          <button className="premium-button" type="button" onClick={() => onSave(draft)}>Save Menu Item</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function uniqueItemId(items: AdminMenuItem[], value: string) {
  const base = `item-${slugify(value) || "new"}`;
  if (!items.some((item) => item.id === base)) return base;
  return `${base}-${items.length + 1}`;
}

function reorder<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next.map((entry, index) => ({ ...entry, sortOrder: index + 1 }));
}
