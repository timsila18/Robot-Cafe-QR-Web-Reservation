"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryFilter } from "@/components/category-filter";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { MenuGrid } from "@/components/menu-grid";
import { MenuItemModal } from "@/components/menu-item-modal";
import { SearchBar } from "@/components/search-bar";
import type { Branch, Category, MenuItem } from "@/lib/demo-data";
import { readDemoCategories, readDemoMenuItems, toPublicCategories, toPublicMenuItems } from "@/lib/demo-persistence";

type MenuExperienceProps = {
  branch: Branch;
  categories: Category[];
  items: MenuItem[];
};

export function MenuExperience({ branch, categories, items }: MenuExperienceProps) {
  const [activeCategories] = useState(() => {
    const savedCategories = readDemoCategories([]);
    return savedCategories.length ? toPublicCategories(savedCategories).filter((category) => category.isActive) : categories;
  });
  const [activeItems] = useState(() => {
    const savedItems = readDemoMenuItems([]);
    return savedItems.length ? toPublicMenuItems(savedItems).filter((item) => item.isActive && item.availableBranches.includes(branch.slug)) : items;
  });
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
  }, [activeCategories]);

  const filteredItems = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return activeItems.filter((item) => {
      const category = activeCategories.find((entry) => entry.id === item.categoryId);
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
  }, [activeCategories, activeItems, query, selectedCategory]);

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
    ["Featured Items", activeItems.filter((item) => item.isFeatured)],
    ["Best Sellers", activeItems.filter((item) => item.isBestSeller)],
    ["New Arrivals", activeItems.filter((item) => item.isNewArrival)],
    ["Chef Recommendations", activeItems.filter((item) => item.isFeatured || item.isBestSeller).slice(0, 6)],
    ["Popular This Week", [...activeItems].sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller)).slice(0, 6)],
    ["Recently Added", [...activeItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6)],
  ].filter(([, sectionItems]) => Array.isArray(sectionItems) && sectionItems.length > 0) as [string, MenuItem[]][];

  const suggestions = query.trim()
    ? filteredItems.slice(0, 5).map((item) => item.name)
    : activeItems.filter((item) => item.isBestSeller || item.isFeatured).slice(0, 5).map((item) => item.name);

  const categoryTiles = activeCategories
    .map((category) => ({
      category,
      itemCount: activeItems.filter((item) => item.categoryId === category.id).length,
    }))
    .filter((entry) => entry.itemCount > 0);

  return (
    <>
      <section className="mx-auto w-full max-w-7xl overflow-hidden px-5 pb-20 pt-8 sm:px-8">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div className="min-w-0 max-w-full">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#6dc6ff]">ROBOT CAFE</p>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-6xl">{branch.name.replace("Robot Cafe - ", "")}</h1>
            <p className="mt-4 max-w-2xl break-words text-base font-medium leading-7 text-[#d7e7f8]">
              Browse the live branch menu with instant search, refined categories, and premium dish details.
            </p>
          </div>
          <div className="w-[calc(100vw-2.5rem)] min-w-0 max-w-full rounded-[22px] border border-white/10 bg-white/10 p-4 shadow-[0_20px_70px_rgba(0,0,0,.22)] backdrop-blur-xl sm:w-full">
            <SearchBar value={query} onBlur={() => commitSearch(query)} onChange={setSearch} suggestions={suggestions} onSuggestion={(value) => { setSearch(value); commitSearch(value); }} />
            {recentSearches.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {recentSearches.map((entry) => (
                  <button className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-[#d7e7f8] transition hover:bg-[#168df2]/18 hover:text-white" key={entry} type="button" onClick={() => setSearch(entry)}>
                    {entry}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {query.trim().length === 0 ? (
          <section className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Explore Categories</h2>
                <p className="mt-1 text-sm font-medium text-[#d7e7f8]">Image-led menu sections for a richer QR browsing experience.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categoryTiles.map(({ category, itemCount }) => (
                <button
                  className="group relative aspect-[4/3] overflow-hidden rounded-[22px] border border-white/10 bg-[#06111f] text-left shadow-[0_20px_70px_rgba(0,0,0,.24)] transition hover:-translate-y-1 hover:border-gold/60"
                  key={category.id}
                  type="button"
                  onClick={() => handleCategory(category.id)}
                >
                  {category.imageUrl ? (
                    <Image alt={category.name} className="object-cover transition duration-500 group-hover:scale-105" fill sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 100vw" src={category.imageUrl} />
                  ) : (
                    <div className="h-full bg-[radial-gradient(circle_at_30%_20%,rgba(216,169,40,.25),transparent_34%),linear-gradient(135deg,#06111f,#08213a)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">{itemCount} selections</p>
                    <h3 className="mt-2 text-2xl font-black text-white">{category.name}</h3>
                    {category.description ? <p className="mt-2 line-clamp-2 text-sm font-medium text-[#d7e7f8]">{category.description}</p> : null}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <div className="sticky top-20 z-30 mt-8 w-[calc(100vw-2.5rem)] min-w-0 max-w-full rounded-2xl border border-white/10 bg-[#04101c]/88 px-3 shadow-[0_16px_45px_rgba(0,0,0,.24)] backdrop-blur-xl sm:w-full">
          <CategoryFilter categories={activeCategories} selectedCategory={selectedCategory} onSelect={handleCategory} />
        </div>

        {query.trim().length === 0 && selectedCategory === "featured" ? (
          <div className="mt-10 space-y-10">
            {sections.map(([label, sectionItems]) => (
              <section key={label}>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">{label}</h2>
                    <p className="mt-1 text-sm font-medium text-[#d7e7f8]">{sectionItems.length} premium selections curated for this branch.</p>
                  </div>
                  <Link className="hidden text-sm font-bold text-[#6dc6ff] sm:block" href="/feedback">Share feedback</Link>
                </div>
                <MenuGrid items={sectionItems} onViewDetails={(item) => { track({ itemId: item.id, categoryId: item.categoryId }); setSelectedItem(item); }} />
              </section>
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Featured Discovery</h2>
              <p className="mt-1 text-sm font-medium text-[#d7e7f8]">{filteredItems.length} curated items available for this view.</p>
            </div>
          </div>
          <div className="w-[calc(100vw-2.5rem)] min-w-0 max-w-full sm:w-full">
            {isLoading ? <LoadingSkeleton /> : <MenuGrid items={filteredItems} onViewDetails={(item) => { track({ itemId: item.id, categoryId: item.categoryId }); setSelectedItem(item); }} />}
          </div>
        </div>

        <div className="mt-12 space-y-10">
          {activeCategories.map((category) => {
            const categoryItems = activeItems.filter((item) => item.categoryId === category.id);
            if (!categoryItems.length) return null;
            return (
              <section id={`category-${category.id}`} key={category.id} ref={(element) => { categoryRefs.current[category.id] = element; }} className="scroll-mt-40">
                <div className="mb-5">
                  <h2 className="text-2xl font-black text-white">{category.name}</h2>
                  <p className="mt-1 text-sm font-medium text-[#d7e7f8]">{categoryItems.length} branch-ready selections.</p>
                </div>
                <MenuGrid items={categoryItems} onViewDetails={(item) => { track({ itemId: item.id, categoryId: item.categoryId }); setSelectedItem(item); }} />
              </section>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col gap-4 rounded-[22px] border border-white/10 bg-white/10 p-5 shadow-[0_20px_70px_rgba(0,0,0,.22)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-white">How was your Robot Cafe experience?</h2>
            <p className="mt-1 text-sm font-medium text-[#d7e7f8]">Share a quick signal with the team after browsing or dining.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link className="ghost-button border-white/15 bg-white/10 text-white hover:bg-white/15" href={`/reservations?branch=${branch.slug}`}>Reserve Table</Link>
            <Link className="premium-button" href={`/feedback?branch=${branch.slug}`}>Give Feedback</Link>
          </div>
        </div>
      </section>
      <MenuItemModal branch={branch} item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
