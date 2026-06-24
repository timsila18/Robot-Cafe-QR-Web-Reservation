type CategoryChipProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

export function CategoryChip({ label, isActive, onClick }: CategoryChipProps) {
  return (
    <button
      className={`h-11 shrink-0 rounded-lg border px-4 text-sm font-medium transition ${
        isActive
          ? "border-gold bg-gold text-white shadow-[0_12px_28px_rgba(8,119,189,0.18)]"
          : "border-slate-200 bg-white text-slate-600 hover:border-gold/50 hover:text-gold"
      }`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
