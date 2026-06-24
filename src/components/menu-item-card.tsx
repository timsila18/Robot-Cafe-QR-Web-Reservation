import Image from "next/image";
import { AvailabilityBadge, FeaturedBadge, StatusBadge } from "@/components/badges";
import { formatPrice, getCategoryById, type MenuItem } from "@/lib/demo-data";
import { getOptimizedImageUrl, getPrimaryImage, imageAlt, robotCafeImageFallback } from "@/lib/images/image-utils";

type MenuItemCardProps = {
  item: MenuItem;
  onViewDetails: (item: MenuItem) => void;
};

export function MenuItemCard({ item, onViewDetails }: MenuItemCardProps) {
  const category = getCategoryById(item.categoryId);
  const primaryImage = getPrimaryImage(item.images);
  const imageUrl = getOptimizedImageUrl(primaryImage, "card");

  return (
    <article className="group luxury-panel w-full min-w-0 max-w-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_30px_80px_rgba(8,119,189,.18)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          alt={imageAlt(item.name)}
          blurDataURL={robotCafeImageFallback}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          loading="lazy"
          placeholder="blur"
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
          src={imageUrl}
          unoptimized={imageUrl.startsWith("data:")}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/62" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {item.isFeatured ? <FeaturedBadge /> : null}
          {item.isBestSeller ? <StatusBadge>Bestseller</StatusBadge> : null}
          {item.isNewArrival ? <StatusBadge>New Arrival</StatusBadge> : null}
        </div>
        <div className="absolute bottom-4 right-4">
          <AvailabilityBadge isSoldOut={item.isSoldOut} />
        </div>
      </div>

      <div className="bg-white/90 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{category?.name}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">{item.name}</h3>
          </div>
          <p className="shrink-0 text-lg font-semibold text-gold">{formatPrice(item.price)}</p>
        </div>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">{item.description}</p>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-gold/10 bg-gradient-to-r from-sky-50 to-emerald-50 px-3 py-2 text-xs font-semibold text-slate-600">
          <span>{item.preparationTime} min prep</span>
          <span>{item.calories} cal</span>
        </div>
        <button
          className="ghost-button mt-5 w-full"
          type="button"
          onClick={() => onViewDetails(item)}
        >
          View Details
        </button>
      </div>
    </article>
  );
}
