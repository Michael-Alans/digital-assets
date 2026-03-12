"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Local state for the input field
  const [query, setQuery] = useState(searchParams.get("q") || "");

  // Function to update the URL
  const updateSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    // Using 'push' or 'replace' depending on if you want back-button history
   router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, searchParams, pathname]);

  // Debounce effect: waits 300ms after the user stops typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only update if the query actually changed from the URL param
      if (query !== (searchParams.get("q") || "")) {
        updateSearch(query);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, updateSearch, searchParams]);

  const handleClear = () => {
    setQuery("");
    updateSearch("");
  };

  return (
    <div className="relative max-w-2xl mx-auto w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for premium assets..."
          className="w-full px-6 py-4 pr-24 rounded-2xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
        />
        
        {/* Clear Icon (X) */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-[150px] p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}

        {/* Search Indicator / Button */}
        <div className="absolute right-3 top-2 bottom-2 px-6 bg-primary text-white rounded-xl font-medium flex items-center justify-center pointer-events-none">
          Search
        </div>
      </div>
    </div>
  );
}