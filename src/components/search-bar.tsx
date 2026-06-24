type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  suggestions?: string[];
  onSuggestion?: (value: string) => void;
};

export function SearchBar({ value, onChange, onBlur, suggestions = [], onSuggestion }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <label className="block w-full">
        <span className="sr-only">Search menu</span>
        <input
          className="h-14 w-full min-w-0 max-w-full rounded-xl border border-white/10 bg-white px-4 text-base font-semibold text-[#071827] outline-none transition placeholder:text-slate-500 focus:border-[#168df2] focus:bg-white"
          placeholder="Search dishes, categories, descriptions, ingredients"
          type="search"
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onBlur?.();
            }
          }}
        />
      </label>
      {suggestions.length ? (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Search suggestions">
          {suggestions.map((suggestion) => (
            <button
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-[#d7e7f8] transition hover:border-[#168df2]/50 hover:bg-[#168df2]/18 hover:text-white"
              key={suggestion}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSuggestion?.(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
