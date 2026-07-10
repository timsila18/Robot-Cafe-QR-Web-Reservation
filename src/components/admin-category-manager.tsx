"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { AdminCategory, AdminMenuItem } from "@/lib/admin-store";
import { canUseDemoPersistence, readDemoCategories, saveDemoCategories } from "@/lib/demo-persistence";
import { compressImage } from "@/lib/images/image-compression";
import { uploadImage } from "@/lib/images/image-storage";
import { validateImageFile } from "@/lib/images/image-validation";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const isValidImageUrl = (value?: string) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

export function AdminCategoryManager({
  initialCategories,
  menuItems,
}: {
  initialCategories: AdminCategory[];
  menuItems: AdminMenuItem[];
}) {
  const [categories, setCategories] = useState(() => readDemoCategories(initialCategories));
  const [categoryMenuItems, setCategoryMenuItems] = useState(menuItems);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(
    () => categories.filter((category) => category.name.toLowerCase().includes(query.toLowerCase())),
    [categories, query],
  );

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const persistCategories = (nextCategories: AdminCategory[]) => {
    setCategories(nextCategories);
    saveDemoCategories(nextCategories);
  };

  useEffect(() => {
    let isMounted = true;
    const refresh = async () => {
      try {
        const [categoryResponse, itemResponse] = await Promise.all([
          fetch("/api/admin/categories", { cache: "no-store" }),
          fetch("/api/admin/menu-items", { cache: "no-store" }),
        ]);
        const [categoryPayload, itemPayload] = await Promise.all([categoryResponse.json(), itemResponse.json()]);
        if (!isMounted || editing) return;
        if (categoryResponse.ok && Array.isArray(categoryPayload.data)) setCategories(categoryPayload.data);
        if (itemResponse.ok && Array.isArray(itemPayload.data)) setCategoryMenuItems(itemPayload.data);
      } catch {
        // Keep the current view if a background refresh fails.
      }
    };
    const interval = window.setInterval(refresh, 8000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [editing]);

  const saveDemoCategory = (category: AdminCategory, message?: string) => {
    const isNew = !category.id;
    const savedCategory = {
      ...category,
      id: isNew ? uniqueCategoryId(categories, category.slug || category.name) : category.id,
      slug: slugify(category.slug || category.name),
      updatedAt: new Date().toISOString(),
    };
    const nextCategories = isNew ? [savedCategory, ...categories] : categories.map((item) => (item.id === category.id ? savedCategory : item));
    persistCategories(nextCategories);
    setEditing(null);
    notify(message ?? (isNew ? "Category created in demo storage." : "Category updated in demo storage."));
  };

  const save = async (category: AdminCategory) => {
    const isNew = !category.id;
    const response = await fetch(isNew ? "/api/admin/categories" : `/api/admin/categories/${category.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...category, id: undefined }),
    });
    const payload = await response.json();

    if (!response.ok) {
      if (canUseDemoPersistence(payload.error)) {
        saveDemoCategory(category, `${isNew ? "Created" : "Saved"} locally for this Vercel demo.`);
        return;
      }
      notify(payload.error ?? "Unable to save category.");
      return;
    }

    persistCategories(isNew ? [payload.data, ...categories] : categories.map((item) => (item.id === category.id ? payload.data : item)));
    setEditing(null);
    notify(isNew ? "Category created." : "Category updated.");
  };

  const remove = async (category: AdminCategory) => {
    const isReferenced = categoryMenuItems.some((item) => item.categoryId === category.id);
    if (isReferenced) {
      notify("Category is referenced by menu items. Deactivate it instead.");
      return;
    }
    if (!window.confirm("Delete this category?")) return;
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      if (canUseDemoPersistence(payload.error)) {
        persistCategories(categories.filter((item) => item.id !== category.id));
        notify("Category deleted locally for this Vercel demo.");
        return;
      }
      notify(payload.error ?? "Unable to delete category.");
      return;
    }
    persistCategories(categories.filter((item) => item.id !== category.id));
    notify("Category deleted.");
  };

  return (
    <div className="space-y-6">
      {toast ? <div className="fixed right-5 top-24 z-50 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-950">Categories</h2>
          <p className="mt-2 text-sm text-slate-500">Create, edit, sort, activate, deactivate, and safely delete categories.</p>
        </div>
        <button className="premium-button" type="button" onClick={() => setEditing({ id: "", name: "", slug: "", description: "", imageUrl: "", sortOrder: categories.length + 1, isActive: true, updatedAt: new Date().toISOString() })}>
          Create Category
        </button>
      </div>

      <input className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" placeholder="Search categories" value={query} onChange={(event) => setQuery(event.target.value)} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((category) => (
          <article className="luxury-panel overflow-hidden" key={category.id}>
            <div className="relative aspect-[4/3] bg-[#06111f]">
              {isValidImageUrl(category.imageUrl) ? (
                <Image alt={category.name} className="object-cover" fill sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 100vw" src={category.imageUrl} />
              ) : (
                <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(216,169,40,.24),transparent_34%),linear-gradient(135deg,#06111f,#08213a)] text-sm font-bold uppercase tracking-[0.24em] text-gold">
                  Category Photo
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <p className="absolute left-4 top-4 rounded-full border border-gold/35 bg-black/55 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">Sort {category.sortOrder}</p>
            </div>
            <div className="p-5">
              <h3 className="text-2xl font-semibold text-slate-950">{category.name}</h3>
              <p className="mt-3 text-sm text-slate-500">{categoryMenuItems.filter((item) => item.categoryId === category.id).length} menu items</p>
              <p className="mt-2 text-sm text-slate-500">{category.description}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <button className="rounded-lg border border-gold/35 bg-gold/10 px-3 py-2 font-bold text-gold transition hover:bg-gold/20" type="button" onClick={() => setEditing({ ...category })}>Edit</button>
              <button className="rounded-lg border border-white/10 bg-white/8 px-3 py-2 font-bold text-slate-200 transition hover:bg-white/12" type="button" onClick={() => void save({ ...category, isActive: !category.isActive })}>{category.isActive ? "Deactivate" : "Activate"}</button>
              <button className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 font-bold text-red-300 transition hover:bg-red-500/20" type="button" onClick={() => remove(category)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing ? <CategoryEditor key={editing.id || "new-category"} category={editing} onClose={() => setEditing(null)} onSave={save} /> : null}
    </div>
  );
}

function uniqueCategoryId(categories: AdminCategory[], value: string) {
  const base = `category-${slugify(value) || "new"}`;
  if (!categories.some((category) => category.id === base)) return base;
  return `${base}-${categories.length + 1}`;
}

function CategoryEditor({ category, onClose, onSave }: { category: AdminCategory; onClose: () => void; onSave: (category: AdminCategory) => void }) {
  const [draft, setDraft] = useState(category);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    setDraft(category);
    setUploading(false);
    setUploadError("");
  }, [category]);

  const handleCategoryPhoto = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.ok) {
      setUploadError(validation.error);
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      const bundle = await compressImage(file);
      const uploaded = await uploadImage({
        file,
        bundle,
        menuItemId: `category-${slugify(draft.slug || draft.name || "photo")}`,
        sortOrder: 1,
        isPrimary: true,
      });
      setDraft((current) => ({ ...current, imageUrl: uploaded.cardUrl || uploaded.imageUrl }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload category photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto flex min-h-full w-full max-w-xl items-start sm:items-center">
        <div className="my-4 max-h-[calc(100svh-2rem)] w-full overflow-y-auto rounded-2xl border border-gold/20 bg-[#06111f] p-5 text-white shadow-2xl sm:my-8 sm:max-h-[calc(100svh-4rem)] sm:p-6">
          <h3 className="text-2xl font-semibold text-white">{draft.id ? "Edit Category" : "Create Category"}</h3>
          <p className="mt-2 text-sm text-[#9fb3c8]">Add a clean category with a premium photo for the customer menu.</p>
          <div className="mt-5 space-y-4">
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" placeholder="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value, slug: slugify(event.target.value) })} />
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" placeholder="Slug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })} />
          <div
            className="rounded-2xl border border-dashed border-gold/35 bg-white/5 p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              if (file) void handleCategoryPhoto(file);
            }}
          >
            {isValidImageUrl(draft.imageUrl) ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black">
                <Image alt={draft.name || "Category preview"} className="object-cover" fill sizes="(min-width: 640px) 520px, 100vw" src={draft.imageUrl} />
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(216,169,40,.24),transparent_34%),linear-gradient(135deg,#06111f,#08213a)] text-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Category Photo</p>
                  <p className="mt-2 text-sm text-[#9fb3c8]">Drop a real Robot Cafe photo here</p>
                </div>
              </div>
            )}
            {uploadError ? <p className="mt-3 rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">{uploadError}</p> : null}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="premium-button flex-1 cursor-pointer text-center">
                {uploading ? "Uploading..." : draft.imageUrl ? "Replace Photo" : "Upload Photo"}
                <input
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploading}
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleCategoryPhoto(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              {draft.imageUrl ? (
                <button className="ghost-button" disabled={uploading} type="button" onClick={() => setDraft({ ...draft, imageUrl: "" })}>
                  Remove Photo
                </button>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-[#9fb3c8]">JPG, PNG, or WEBP up to 20MB. The file is optimized and stored in Robot Cafe cPanel under qr-menu-images.</p>
          </div>
          <textarea className="min-h-24 w-full rounded-xl border border-slate-200 p-4" placeholder="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" type="number" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} />
          <label className="flex items-center gap-3 text-sm text-[#d7e7f8]"><input checked={draft.isActive} type="checkbox" onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Active</label>
          </div>
          <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-white/10 bg-[#06111f]/95 px-5 pb-1 pt-4 backdrop-blur sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
            <button className="ghost-button" type="button" onClick={onClose}>Cancel</button>
            <button className="premium-button" type="button" onClick={() => onSave(draft)}>Save Category</button>
          </div>
        </div>
      </div>
    </div>
  );
}
