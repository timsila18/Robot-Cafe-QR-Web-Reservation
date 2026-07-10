import { EmptyState } from "@/components/empty-state";
import { MenuItemCard } from "@/components/menu-item-card";
import type { Category, MenuItem } from "@/lib/demo-data";

type MenuGridProps = {
  categories?: Category[];
  items: MenuItem[];
  onViewDetails: (item: MenuItem) => void;
};

export function MenuGrid({ categories = [], items, onViewDetails }: MenuGridProps) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid min-w-0 max-w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <MenuItemCard category={categories.find((category) => category.id === item.categoryId)} item={item} key={item.id} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
}
