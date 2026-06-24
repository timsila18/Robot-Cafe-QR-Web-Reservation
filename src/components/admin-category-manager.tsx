"use client";

import { useMemo, useState } from "react";
import type { AdminCategory, AdminMenuItem } from "@/lib/admin-engine";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function AdminCategoryManager({
  initialCategories,
  menuItems,
}: {
  initialCategories: AdminCategory[];
  menuItems: AdminMenuItem[];
}) {
  const [categories, setCategories] = useState(initialCategories);
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

  const save = async (category: AdminCategory) => {
    const isNew = !category.id;
    const response = await fetch(isNew ? "/api/admin/categories" : `/api/admin/categories/${category.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...category, id: undefined }),
    });
    const payload = await response.json();

    if (!response.ok) {
      notify(payload.error ?? "Unable to save category.");
      return;
    }

    setCategories((current) => (isNew ? [payload.data, ...current] : current.map((item) => (item.id === category.id ? payload.data : item))));
    setEditing(null);
    notify(isNew ? "Category created." : "Category updated.");
  };

  const remove = async (category: AdminCategory) => {
    const isReferenced = menuItems.some((item) => item.categoryId === category.id);
    if (isReferenced) {
      notify("Category is referenced by menu items. Deactivate it instead.");
      return;
    }
    if (!window.confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    setCategories((current) => current.filter((item) => item.id !== category.id));
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
        <button className="premium-button" type="button" onClick={() => setEditing({ id: "", name: "", slug: "", description: "", sortOrder: categories.length + 1, isActive: true, updatedAt: new Date().toISOString() })}>
          Create Category
        </button>
      </div>

      <input className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" placeholder="Search categories" value={query} onChange={(event) => setQuery(event.target.value)} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((category) => (
          <article className="luxury-panel p-5" key={category.id}>
            <p className="text-xs uppercase tracking-[0.24em] text-gold">Sort {category.sortOrder}</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-950">{category.name}</h3>
            <p className="mt-3 text-sm text-slate-500">{menuItems.filter((item) => item.categoryId === category.id).length} menu items</p>
            <p className="mt-2 text-sm text-slate-500">{category.description}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <button className="text-gold" type="button" onClick={() => setEditing(category)}>Edit</button>
              <button className="text-slate-500" type="button" onClick={() => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, isActive: !item.isActive } : item))}>{category.isActive ? "Deactivate" : "Activate"}</button>
              <button className="text-red-600" type="button" onClick={() => remove(category)}>Delete</button>
            </div>
          </article>
        ))}
      </div>

      {editing ? <CategoryEditor category={editing} onClose={() => setEditing(null)} onSave={save} /> : null}
    </div>
  );
}

function CategoryEditor({ category, onClose, onSave }: { category: AdminCategory; onClose: () => void; onSave: (category: AdminCategory) => void }) {
  const [draft, setDraft] = useState(category);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-2xl font-semibold text-slate-950">{draft.id ? "Edit Category" : "Create Category"}</h3>
        <div className="mt-5 space-y-4">
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" placeholder="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value, slug: slugify(event.target.value) })} />
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" placeholder="Slug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })} />
          <textarea className="min-h-24 w-full rounded-xl border border-slate-200 p-4" placeholder="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" type="number" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} />
          <label className="flex items-center gap-3 text-sm text-slate-700"><input checked={draft.isActive} type="checkbox" onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Active</label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="ghost-button" type="button" onClick={onClose}>Cancel</button>
          <button className="premium-button" type="button" onClick={() => onSave(draft)}>Save Category</button>
        </div>
      </div>
    </div>
  );
}
