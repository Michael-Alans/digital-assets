import { AssetForm } from "@/components/creator/AssetForm";
import { apiFetch } from "@/app/lib/api/client";
import Link from "next/link";
import { notFound } from "next/navigation";

// Define the shape of params as a Promise for Next.js 15 compatibility
interface EditAssetPageProps {
  params: Promise<{
    assetId: string;
  }>;
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  // 1. Await the params to get the actual ID
  const resolvedParams = await params;
  const assetId = resolvedParams.assetId;

  // Safety check to prevent the 'undefined' fetch
  if (!assetId || assetId === "undefined") {
    return notFound();
  }

  let asset;
  try {
    // 2. Now the URL will be /assets/cmmj90xta... instead of /assets/undefined
    asset = await apiFetch<any>(`/assets/${assetId}`);
  } catch (error) {
    console.error("Failed to fetch asset for editing:", error);
    return notFound();
  }

  if (!asset) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link 
          href="/creator/assets" 
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          ← Back to Managed Assets
        </Link>
        <div className="flex justify-between items-end mt-4">
          <div>
            <h1 className="text-3xl font-bold italic tracking-tight">Edit Asset</h1>
            <p className="text-muted-foreground">
              Update your listing details or replace source files.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Entry ID</span>
            <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              {assetId}
            </p>
          </div>
        </div>
      </div>

      <AssetForm initialData={asset} />
    </div>
  );
}