type CategoryChipProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

export function CategoryChip({ label, isActive, onClick }: CategoryChipProps) {
  return (
    <button
      className={`h-11 shrink-0 rounded-lg border px-4 text-sm font-extrabold transition ${
        isActive
          ? "border-[#168df2] bg-[#168df2] text-white shadow-[0_12px_28px_rgba(8,119,189,0.24)]"
          : "border-white/10 bg-white/8 text-[#d7e7f8] hover:border-[#168df2]/50 hover:bg-[#168df2]/14 hover:text-white"
      }`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
