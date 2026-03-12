import { AssetCard } from "./AssetCard";
import { LoadingState } from "@components/states/LoadingState";
import { EmptyState } from "@components/states/EmptyState";
import { Asset } from "@app/lib/api/types";
import Link from "next/link";

export function AssetGrid({ assets, isLoading }: { assets: Asset[], isLoading: boolean }) {
  // 1. Handle Loading inside the grid area
  if (isLoading) {
    return (
      <div className="py-10">
        <LoadingState />
      </div>
    );
  }

  // 2. Handle Empty State inside the grid area
  if (!assets || assets.length === 0) {
    return (
      <div className="py-10">
        <EmptyState 
          title="No assets found"
          message="We couldn't find any digital assets matching your criteria."
        />
      </div>
    );
  }

  // 3. Slice the assets to only show the first 6
  const featuredAssets = assets.slice(0, 6);

  // 4. Render the actual grid + View All Button
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {featuredAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>

      {/* View All Button - Only show if there were more than 6 assets originally */}
      {assets.length > 6 && (
        <div className="flex justify-center pt-4">
          <Link 
            href="/marketplace" 
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95"
          >
            View All Assets
          </Link>
        </div>
      )}
    </div>
  );
}