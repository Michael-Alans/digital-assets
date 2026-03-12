"use client";

import { useParams } from "next/navigation";
import { useAsset } from "../../../lib/hooks/useAsset";
import { Container } from "../../../../components/layout/Container";
import { AssetPreviewGallery } from "../../../../components/assets/AssetPreviewGallery";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { ClaimButton } from "@/components/buyer/ClaimButton";

export default function AssetDetailsPage() {
  const { assetId } = useParams();
  const { asset, isLoading, isError, mutate } = useAsset(assetId as string);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;
  if (!asset) return null;

  // Use the hydrated creator data from the backend
  const creator = asset.creator || {
  firstName: asset.creatorProfile?.user?.firstName || "Anonymous",
  lastName: asset.creatorProfile?.user?.lastName || "",
  imageUrl: asset.creatorProfile?.user?.imageUrl || null, // Check if this exists in your DB too
};

  return (
    <div className="py-12">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content: Gallery and Description */}
          <div className="lg:col-span-8 space-y-8">
            <AssetPreviewGallery files={asset.files} />
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">About this asset</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {asset.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Sidebar: Pricing and Actions */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm">
                <h1 className="text-2xl font-bold mb-4">{asset.title}</h1>
                
                {/* Updated Creator Section */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                  {creator.imageUrl ? (
                    <img 
                      src={creator.imageUrl} 
                      alt={creator.firstName} 
                      className="w-10 h-10 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                      {(creator.firstName?.[0] || 'Anonymous').toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Designed by</p>
                    <p className="text-sm font-bold text-text-main">
                      {creator.firstName} {creator.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <span className="text-muted-foreground text-sm mb-1">Price</span>
                  <div className="text-4xl font-bold text-primary">${Number(asset.price).toFixed(2)}</div>
                </div>

                {asset.isOwned ? (
                  <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-900/20 active:scale-[0.98]">
                    You Own This Asset
                  </button>
                ) : (
                  <ClaimButton 
                    assetId={asset.id} 
                    price={asset.price} 
                  />
                )}
                
                <p className="text-[10px] text-center text-muted-foreground mt-4">
                  Secure checkout powered by Clerk & Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}