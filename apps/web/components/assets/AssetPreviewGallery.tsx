"use client";
import { useState } from "react";

export function AssetPreviewGallery({ files = [] }: { files?: any[] }) {
  const [active, setActive] = useState(0);

  // 1. Filter only PREVIEW files (We can't render .zip files in an <img> tag)
  const previewFiles = files.filter((f) => f.kind === "PREVIEW");

  // 2. Helper to get the full S3 URL
  const getFullUrl = (file: any) => {
    if (!file) return null;
    if (file.url) return file.url; // Use direct URL if provided by API

    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
    const region = process.env.NEXT_PUBLIC_AWS_REGION;
    return `https://${bucket}.s3.${region}.amazonaws.com/${file.s3Key}`;
  };

  if (!previewFiles.length) {
    return (
      <div className="aspect-video w-full rounded-3xl bg-surface border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground/50">
        <span className="text-4xl mb-2">🖼️</span>
        <p className="text-sm italic">No preview images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Viewport */}
      <div className="aspect-video w-full overflow-hidden rounded-3xl bg-surface border border-border shadow-premium relative group">
        <img
          src={getFullUrl(previewFiles[active])}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
          alt="Asset Preview"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/1200x800?text=Preview+Error";
          }}
        />
        
        {/* Subtle Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Thumbnail List (Only show if there's more than one image) */}
      {previewFiles.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {previewFiles.map((file, idx) => {
            const thumbUrl = getFullUrl(file);
            return (
              <button
                key={file.id || idx}
                onClick={() => setActive(idx)}
                className={`h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  active === idx
                    ? "border-primary ring-4 ring-primary/10 scale-95"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-border"
                }`}
              >
                <img
                  src={thumbUrl}
                  className="h-full w-full object-cover"
                  alt={`Thumbnail ${idx + 1}`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}