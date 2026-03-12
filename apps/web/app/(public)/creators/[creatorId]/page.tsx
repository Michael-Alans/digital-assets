"use client";
import { useParams } from "next/navigation";
import { useAssets } from "../../../lib/hooks/useAssets";
import { Container } from "../../../../components/layout/Container";
import { AssetGrid } from "../../../../components/assets/AssetGrid";

export default function CreatorStorefrontPage() {
  const { creatorId } = useParams();
  // In a real scenario, you'd fetch creator details here. 
  // For now, we filter assets by this creator.
  const { assets, isLoading } = useAssets(); 
  const creatorAssets = assets.filter(a => a.creatorProfileId === creatorId);

  return (
    <div className="py-12">
      <Container>
        <div className="mb-12 border-b border-border pb-12">
          <div className="w-24 h-24 rounded-full bg-primary/10 mb-6 flex items-center justify-center text-3xl">👤</div>
          <h1 className="text-4xl font-bold">Creator Storefront</h1>
          <p className="text-muted mt-2">Browse all assets created by this designer.</p>
        </div>
        <AssetGrid assets={creatorAssets} isLoading={isLoading} />
      </Container>
    </div>
  );
}