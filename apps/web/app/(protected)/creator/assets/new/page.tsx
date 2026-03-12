import { AssetForm } from "@/components/creator/AssetForm";
import Link from "next/link";

export default function NewAssetPage() {
  return (
    /* 1. Added 'w-full' to ensure it respects parent constraints.
       2. Added 'overflow-x-hidden' as a safety net against stray wide elements.
       3. Kept your exact logic and hierarchy.
    */
    <div className="max-w-4xl mx-auto px-4 py-8 md:p-8 w-full overflow-x-hidden">
      <div className="mb-8">
        <Link 
          href="/creator/assets" 
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back to Assets
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mt-4">Create New Asset</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Fill in the details below to list your digital asset on the marketplace.
        </p>
      </div>

      {/* If the scrollbar persists, the issue is inside AssetForm. 
          We wrap it in a div that prevents it from pushing the page width.
      */}
      <div className="w-full">
        <AssetForm />
      </div>
    </div>
  );
}