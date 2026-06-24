import { EmptyState } from "@/components/empty-state";
import { MenuItemCard } from "@/components/menu-item-card";
import type { MenuItem } from "@/lib/demo-data";

type MenuGridProps = {
  items: MenuItem[];
  onViewDetails: (item: MenuItem) => void;
};

export function MenuGrid({ items, onViewDetails }: MenuGridProps) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid min-w-0 max-w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <MenuItemCard item={item} key={item.id} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
}
