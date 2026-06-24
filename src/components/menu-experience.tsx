"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryFilter } from "@/components/category-filter";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { MenuGrid } from "@/components/menu-grid";
import { MenuItemModal } from "@/components/menu-item-modal";
import { SearchBar } from "@/components/search-bar";
import type { Branch, Category, MenuItem } from "@/lib/demo-data";
import { getCategoryById } from "@/lib/demo-data";

type MenuExperienceProps = {
  branch: Branch;
  categories: Category[];
  items: MenuItem[];
};

export function MenuExperience({ branch, categories, items }: MenuExperienceProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("featured");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const key = "robot-cafe-session-id";
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.sessionStorage.setItem(key, next);
    return next;
  }, []);

  const track = useCallback((payload: Record<string, string | undefined>) => {
    void fetch("/api/qr-scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchId: branch.id,
        page: `/menu/${branch.slug}`,
        route: `/menu/${branch.slug}`,
        sessionId,
        ...payload,
      }),
    }).catch(() => undefined);
  }, [branch.id, branch.slug, sessionId]);

  useEffect(() => {
    track({});
  }, [track]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries.find((entry) => entry.isIntersecting);
        if (active?.target.id) {
          setSelectedCategory(active.target.id.replace("category-", ""));
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0.05 },
    );

    Object.values(categoryRefs.current).forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [categories]);

  const filteredItems = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const category = getCategoryById(item.categoryId);
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "featured" && item.isFeatured) ||
        item.categoryId === selectedCategory;
        const matchesQuery =
          cleanQuery.length === 0 ||
          item.name.toLowerCase().includes(cleanQuery) ||
          item.description.toLowerCase().includes(cleanQuery) ||
          category?.name.toLowerCase().includes(cleanQuery) ||
          item.ingredients.some((ingredient) => ingredient.toLowerCase().includes(cleanQuery));

      return matchesCategory && matchesQuery;
    });
  }, [items, query, selectedCategory]);

  const handleCategory = (categoryId: string) => {
    setIsLoading(true);
    setSelectedCategory(categoryId);
    if (categoryId !== "featured" && categoryId !== "all") {
      categoryRefs.current[categoryId]?.scrollIntoView({ behavior: "smooth", block: "start" });
      track({ categoryId });
    }
    window.setTimeout(() => setIsLoading(false), 220);
  };

  const setSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length > 1) {
      track({ searchQuery: value.trim() });
    }
  };

  const commitSearch = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    setRecentSearches((current) => [clean, ...current.filter((entry) => entry !== clean)].slice(0, 5));
  };

  const sections = [
    ["Featured Items", items.filter((item) => item.isFeatured)],
    ["Best Sellers", items.filter((item) => item.isBestSeller)],
    ["New Arrivals", items.filter((item) => item.isNewArrival)],
    ["Chef Recommendations", items.filter((item) => item.isFeatured || item.isBestSeller).slice(0, 6)],
    ["Popular This Week", [...items].sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller)).slice(0, 6)],
    ["Recently Added", [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6)],
  ].filter(([, sectionItems]) => Array.isArray(sectionItems) && sectionItems.length > 0) as [string, MenuItem[]][];

  const suggestions = query.trim()
    ? filteredItems.slice(0, 5).map((item) => item.name)
    : items.filter((item) => item.isBestSeller || item.isFeatured).slice(0, 5).map((item) => item.name);

  return (
    <>
      <section className="mx-auto w-full max-w-7xl overflow-hidden px-5 pb-20 pt-8 sm:px-8">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div className="min-w-0 max-w-full">
            <p className="text-sm uppercase tracking-[0.28em] text-gold">ROBOT CAFE</p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-6xl">{branch.name.replace("Robot Cafe - ", "")}</h1>
            <p className="mt-4 max-w-2xl break-words text-base leading-7 text-slate-600">
              Browse the live branch menu with instant search, refined categories, and premium dish details.
            </p>
          </div>
          <div className="luxury-panel w-[calc(100vw-2.5rem)] min-w-0 max-w-full p-4 sm:w-full">
            <SearchBar value={query} onBlur={() => commitSearch(query)} onChange={setSearch} suggestions={suggestions} onSuggestion={(value) => { setSearch(value); commitSearch(value); }} />
            {recentSearches.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {recentSearches.map((entry) => (
                  <button className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-gold/10 hover:text-gold" key={entry} type="button" onClick={() => setSearch(entry)}>
                    {entry}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="sticky top-20 z-30 mt-8 w-[calc(100vw-2.5rem)] min-w-0 max-w-full rounded-2xl border border-slate-200 bg-white/90 px-3 backdrop-blur-xl sm:w-full">
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelect={handleCategory} />
        </div>

        {query.trim().length === 0 && selectedCategory === "featured" ? (
          <div className="mt-10 space-y-10">
            {sections.map(([label, sectionItems]) => (
              <section key={label}>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">{label}</h2>
                    <p className="mt-1 text-sm text-slate-500">{sectionItems.length} premium selections curated for this branch.</p>
                  </div>
                  <Link className="hidden text-sm font-semibold text-gold sm:block" href="/feedback">Share feedback</Link>
                </div>
                <MenuGrid items={sectionItems} onViewDetails={(item) => { track({ itemId: item.id, categoryId: item.categoryId }); setSelectedItem(item); }} />
              </section>
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Featured Discovery</h2>
              <p className="mt-1 text-sm text-slate-500">{filteredItems.length} curated items available for this view.</p>
            </div>
          </div>
          <div className="w-[calc(100vw-2.5rem)] min-w-0 max-w-full sm:w-full">
            {isLoading ? <LoadingSkeleton /> : <MenuGrid items={filteredItems} onViewDetails={(item) => { track({ itemId: item.id, categoryId: item.categoryId }); setSelectedItem(item); }} />}
          </div>
        </div>

        <div className="mt-12 space-y-10">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.categoryId === category.id);
            if (!categoryItems.length) return null;
            return (
              <section id={`category-${category.id}`} key={category.id} ref={(element) => { categoryRefs.current[category.id] = element; }} className="scroll-mt-40">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold text-slate-950">{category.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{categoryItems.length} branch-ready selections.</p>
                </div>
                <MenuGrid items={categoryItems} onViewDetails={(item) => { track({ itemId: item.id, categoryId: item.categoryId }); setSelectedItem(item); }} />
              </section>
            );
          })}
        </div>

        <div className="mt-12 luxury-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">How was your Robot Cafe experience?</h2>
            <p className="mt-1 text-sm text-slate-500">Share a quick signal with the team after browsing or dining.</p>
          </div>
          <Link className="premium-button" href={`/feedback?branch=${branch.slug}`}>Give Feedback</Link>
        </div>
      </section>
      <MenuItemModal branch={branch} item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
