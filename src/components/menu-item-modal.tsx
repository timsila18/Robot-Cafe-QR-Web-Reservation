"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AvailabilityBadge, FeaturedBadge, StatusBadge } from "@/components/badges";
import { branches, formatPrice, getCategoryById, menuItems, type Branch, type MenuItem } from "@/lib/demo-data";
import { getOptimizedImageUrl, getPrimaryImage, imageAlt, robotCafeImageFallback } from "@/lib/images/image-utils";

type MenuItemModalProps = {
  item: MenuItem | null;
  branch: Branch;
  onClose: () => void;
};

export function MenuItemModal({ item, branch, onClose }: MenuItemModalProps) {
  const [activeSelection, setActiveSelection] = useState({ itemId: "", imageId: "" });
  const gallery = useMemo(() => (item?.images.length ? [...item.images].sort((a, b) => a.sortOrder - b.sortOrder) : []), [item]);
  const primaryImage = getPrimaryImage(gallery);
  const activeImage =
    activeSelection.itemId === item?.id ? gallery.find((image) => image.id === activeSelection.imageId) ?? primaryImage : primaryImage;

  if (!item) {
    return null;
  }

  const category = getCategoryById(item.categoryId);
  const detailUrl = getOptimizedImageUrl(activeImage, "detail");
  const availableBranchNames = branches
    .filter((availableBranch) => item.availableBranches.includes(availableBranch.slug))
    .map((availableBranch) => availableBranch.name.replace("Robot Cafe - ", ""))
    .join(", ");
  const relatedItems = menuItems
    .filter((entry) => entry.id !== item.id && entry.categoryId === item.categoryId && entry.availableBranches.includes(branch.slug))
    .slice(0, 3);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-5"
      role="dialog"
    >
      <div className="max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-2xl border border-gold/20 bg-[#050e19] text-white shadow-2xl sm:rounded-2xl">
        <div className="relative min-h-80 overflow-hidden bg-slate-100">
          <Image
            alt={imageAlt(item.name, "detail photo")}
            blurDataURL={robotCafeImageFallback}
            className="object-cover transition duration-500"
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 896px, 100vw"
            src={detailUrl}
            unoptimized={detailUrl.startsWith("data:")}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/10 to-black/92" />
          <button
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-xl border border-white/20 bg-black/55 text-xl text-white transition hover:border-gold hover:text-gold"
            type="button"
            onClick={onClose}
            aria-label="Close details"
          >
            x
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {item.isFeatured ? <FeaturedBadge /> : null}
              {item.isBestSeller ? <StatusBadge>Bestseller</StatusBadge> : null}
              {item.isNewArrival ? <StatusBadge>New Arrival</StatusBadge> : null}
              <AvailabilityBadge isSoldOut={item.isSoldOut} />
            </div>
            <h2 className="mt-5 text-4xl font-semibold text-white">{item.name}</h2>
            <p className="mt-3 text-2xl font-semibold text-gold">{formatPrice(item.price)}</p>
          </div>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_0.72fr] sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gold">Details</p>
            <p className="mt-4 text-base leading-8 text-[#d7e7f8]">{item.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTile label="Prep Time" value={`${item.preparationTime} min`} />
              <InfoTile label="Calories" value={`${item.calories} cal`} />
              <InfoTile label="Status" value={item.isSoldOut ? "Unavailable" : "Ready"} />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <PillList label="Ingredients" values={item.ingredients} />
              <PillList label="Allergens" values={item.allergens.length ? item.allergens : ["None declared"]} />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {(gallery.length ? gallery : [{ id: "fallback", thumbnailUrl: robotCafeImageFallback, cardUrl: robotCafeImageFallback, detailUrl: robotCafeImageFallback, imageUrl: robotCafeImageFallback, isPrimary: true, sortOrder: 1 }]).map((image) => {
                const thumbUrl = getOptimizedImageUrl(image, "thumbnail");
                const isSelected = image.id === activeImage?.id;
                return (
                  <button
                    className={`relative aspect-square overflow-hidden rounded-xl border transition ${isSelected ? "border-gold ring-2 ring-gold/20" : "border-slate-200"}`}
                    key={image.id}
                    type="button"
                    onClick={() => setActiveSelection({ itemId: item.id, imageId: image.id })}
                    aria-label={`Show ${item.name} image ${image.sortOrder}`}
                  >
                    <Image
                      alt={imageAlt(item.name, "thumbnail")}
                      className="object-cover"
                      fill
                      sizes="96px"
                      src={thumbUrl}
                      unoptimized={thumbUrl.startsWith("data:")}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <dl className="luxury-panel space-y-5 p-5">
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-slate-400">Category</dt>
              <dd className="mt-2 text-sm text-slate-950">{category?.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-slate-400">Current Branch</dt>
              <dd className="mt-2 text-sm text-slate-950">{branch.name.replace("Robot Cafe - ", "")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-slate-400">Branch Availability</dt>
              <dd className="mt-2 text-sm leading-6 text-slate-950">{availableBranchNames}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</dt>
              <dd className="mt-2 text-sm text-slate-950">{item.isSoldOut ? "Temporarily unavailable" : "Ready for service"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-slate-400">Recommended</dt>
              <dd className="mt-3 space-y-2">
                {relatedItems.length ? relatedItems.map((entry) => (
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" key={entry.id}>
                    {entry.name}
                  </div>
                )) : <span className="text-sm text-slate-500">More recommendations coming soon.</span>}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gold/15 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[#9fb3c8]">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function PillList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => (
          <span className="rounded-full border border-gold/15 bg-gold/5 px-3 py-1 text-xs font-semibold text-gold" key={value}>
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
