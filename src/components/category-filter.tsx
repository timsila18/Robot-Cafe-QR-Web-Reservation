import type { Category } from "@/lib/demo-data";
import { CategoryChip } from "@/components/category-chip";

type CategoryFilterProps = {
  categories: Category[];
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
};

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="scrollbar-none flex w-full min-w-0 gap-2 overflow-x-auto py-2" aria-label="Menu categories">
      <CategoryChip label="Featured" isActive={selectedCategory === "featured"} onClick={() => onSelect("featured")} />
      <CategoryChip label="All" isActive={selectedCategory === "all"} onClick={() => onSelect("all")} />
      {categories.map((category) => (
        <CategoryChip
          key={category.id}
          label={category.name}
          isActive={selectedCategory === category.id}
          onClick={() => onSelect(category.id)}
        />
      ))}
    </div>
  );
}
