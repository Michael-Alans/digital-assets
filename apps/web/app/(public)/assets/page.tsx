// apps/web/app/marketplace/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { apiFetch } from "@/app/lib/api/client";
import { Asset } from "@/app/lib/api/types";
import { AssetCard } from "@/components/assets/AssetCard";
import { SearchBar } from "@/components/search/SearchBar";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { SlidersHorizontal } from "lucide-react";

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  
  // 1. Get the search query directly from the URL parameter 'q'
  const query = searchParams.get("q") || "";

  // 2. Fetch assets using the query. SWR automatically re-fetches when the key changes.
  // Explicitly typing (url: string) fixes the "any" type error.
  const { data: assets, isLoading } = useSWR<Asset[]>(
    `/assets?search=${query}`,
    (url: string) => apiFetch<Asset[]>(url)
  );

  return (
    <main className="min-h-screen bg-bg px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Header & Your Self-Contained SearchBar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-main">Marketplace</h1>
            <p className="text-muted mt-2">Browse our full collection of premium digital assets.</p>
          </div>

          <div className="w-full md:w-96">
            {/* No props passed here because your component handles its own logic */}
            <SearchBar />
          </div>
        </div>

        <hr className="border-border" />

        {/* Results Area */}
        {isLoading ? (
          <div className="py-20">
            <LoadingState />
          </div>
        ) : !assets || assets.length === 0 ? (
          <div className="py-20">
            <EmptyState 
              title="No assets found"
              message={query ? `No results for "${query}"` : "The marketplace is currently empty."}
            />
          </div>
        ) : (
          <div className="space-y-8">
             <div className="flex justify-between items-center px-2">
                <p className="text-sm font-medium text-muted">
                  Showing <span className="text-text-main">{assets.length}</span> assets
                </p>
                <button className="flex items-center gap-2 text-sm font-semibold text-text-main hover:text-primary transition-colors">
                  <SlidersHorizontal size={18} />
                  Filters
                </button>
             </div>

             {/* Full Responsive Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {assets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
             </div>
          </div>
        )}
      </div>
    </main>
  );
}