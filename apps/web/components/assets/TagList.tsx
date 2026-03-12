"use client";

const TAGS = ["All", "Templates", "Icons", "Kits", "UI", "Code"];

export function TagList({ selected, onSelect }: { selected: string; onSelect: (tag: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag === "All" ? "" : tag)}
          className={`px-6 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${
            (selected || "All") === tag 
              ? "bg-primary border-primary text-white shadow-premium" 
              : "bg-surface border-border text-muted hover:border-primary/50"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}