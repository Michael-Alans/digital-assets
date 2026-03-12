"use client";

import { EmptyState } from "@components/states/EmptyState";
import { DownloadButton } from "./DownloadButton";
import Link from "next/link";
import Image from "next/image";

interface MyAssetsListProps {
  initialAssets: any[]; 
}

export function MyAssetsList({ initialAssets }: MyAssetsListProps) {
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;

  if (!initialAssets || initialAssets.length === 0) {
    return (
      <EmptyState 
        title="Your library is empty" 
        message="Browse the marketplace to find and claim premium assets."
        actionLabel="Browse Marketplace"
        onAction={() => window.location.href = "/"}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {initialAssets.map((asset) => {
        // Absolute guard against undefined routes
        if (!asset?.id) return null;

        const previewFile = asset.files?.find((f: any) => f.kind === "PREVIEW");
        const displayImage = previewFile?.s3Key
          ? `https://${bucket}.s3.${region}.amazonaws.com/${previewFile.s3Key}`
          : "https://placehold.co/600x400?text=No+Preview+Available";

        return (
          <div 
            key={asset.id} 
            className="group relative p-[2px] rounded-3xl transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 overflow-hidden"
          >
            {/* GEMINI GLOW LAYER */}
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#4285f4,#9b72cb,#d96570,#d96570,#9b72cb,#4285f4)] animate-[spin_4s_linear_infinite]" />

            <div className="relative z-10 bg-surface p-4 rounded-[calc(1.5rem-1px)] h-full w-full flex flex-col">
              
              {/* Image Container */}
              <div className="aspect-4/3 w-full overflow-hidden rounded-2xl bg-surface border border-border relative shadow-sm mb-4">
                <Image 
                  src={displayImage} 
                  alt={asset.title} 
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Load+Error";
                  }}
                />
              </div>
              
              {/* Content Section */}
              <div className="px-1 space-y-3 mt-auto">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/assets/${asset.id}`} 
                      prefetch={false} // Stops pre-fetching 'undefined' in logs
                      className="font-bold text-text-main hover:text-primary transition-colors line-clamp-1 block text-lg"
                    >
                      {asset.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">
                        {asset.category || "Asset"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="shrink-0">
                    <DownloadButton assetId={asset.id} />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
                  {asset.description || "Premium asset in your library."}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}