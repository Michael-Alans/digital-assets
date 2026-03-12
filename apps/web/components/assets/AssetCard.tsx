"use client";

import Link from "next/link";
import { Asset } from "../../app/lib/api/types";

export function AssetCard({ asset }: { asset: any }) { // Using any temporarily until types are updated
  // 1. Find the PREVIEW file object
  const previewFile = asset.files?.find((f: any) => f.kind === "PREVIEW");

  // 2. Construct the Public S3 URL
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;

  const fullImageUrl = previewFile?.s3Key
    ? `https://${bucket}.s3.${region}.amazonaws.com/${previewFile.s3Key}`
    : null;

  // 3. Extract Creator Data (Hydrated from Clerk via Backend)
  const creator = asset.creator || {
    firstName: asset.creatorProfile?.user?.firstName || "Anonymous",
    lastName: asset.creatorProfile?.user?.lastName || "",
    imageUrl: null,
  };

  return (
    <Link
      href={`/assets/${asset.id}`}
      className="group relative block p-[2px] rounded-3xl transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 overflow-hidden"
    >
      {/* GEMINI GLOW LAYER */}
      <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#4285f4,#9b72cb,#d96570,#d96570,#9b72cb,#4285f4)] animate-[spin_4s_linear_infinite]" />

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 bg-surface p-4 rounded-[calc(1.5rem-1px)] h-full w-full">
        {/* Thumbnail Container */}
        <div className="aspect-4/3 w-full overflow-hidden rounded-2xl bg-surface border border-border relative shadow-sm transition-shadow group-hover:shadow-lg">
          {fullImageUrl ? (
            <img
              src={fullImageUrl}
              alt={asset.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Preview+Error";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 bg-muted/10 space-y-2">
              <span className="text-3xl">🖼️</span>
              <span className="text-xs italic">No Preview Available</span>
            </div>
          )}

          {asset.status === "DRAFT" && (
            <div className="absolute top-3 left-3 bg-yellow-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
              Draft
            </div>
          )}
        </div>

        {/* Metadata Section */}
        <div className="mt-4 px-1 space-y-1.5">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1 flex-1 text-sm md:text-base">
              {asset.title}
            </h3>
            <span className="font-bold text-primary shrink-0 text-sm md:text-base">
              ${Number(asset.price).toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
            {asset.description || "No description provided for this asset."}
          </p>

          {/* NEW: Enhanced Creator Section with Clerk Image */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-2">
            {creator.imageUrl ? (
              <img 
                src={creator.imageUrl} 
                alt={creator.firstName}
                className="w-6 h-6 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold border border-primary/20">
                {creator.firstName[0].toUpperCase()}
              </div>
            )}
            
            <p className="text-[11px] font-semibold text-text-main/80 truncate">
              by {creator.firstName} {creator.lastName}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}