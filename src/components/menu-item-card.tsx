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
    <article className="group w-full min-w-0 max-w-full overflow-hidden rounded-[22px] border border-gold/14 bg-[linear-gradient(145deg,rgba(5,14,25,.96),rgba(8,37,59,.8))] shadow-[0_24px_80px_rgba(0,0,0,.34)] transition duration-300 hover:-translate-y-1 hover:border-gold/42 hover:shadow-[0_30px_90px_rgba(216,169,40,.14)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#071827]">
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

      <div className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">{category?.name}</p>
            <h3 className="mt-2 text-xl font-black text-white">{item.name}</h3>
          </div>
          <p className="shrink-0 text-lg font-black text-gold">{formatPrice(item.price)}</p>
        </div>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm font-medium leading-6 text-[#d7e7f8]">{item.description}</p>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-[#d7e7f8]">
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
