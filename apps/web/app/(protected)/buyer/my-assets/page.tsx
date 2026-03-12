import { Container } from "@/components/layout/Container";
import { MyAssetsList } from "@/components/buyer/MyAssetsList";
import { getMyAssets } from "@/app/lib/actions/enrollment";
import { Suspense } from "react";

export default async function MyAssetsPage() {
  // We cast the result to any[] (or your specific Asset interface) 
  // to resolve the 'unknown' assignment error.
  const enrolledAssets = (await getMyAssets()) as any[];

  return (
    <div className="py-12 bg-bg min-h-screen">
      <Container>
        <div className="mb-10">
          <h1 className="text-4xl font-medium text-text-main tracking-tight">
            My Assets
          </h1>
          <p className="text-muted mt-2 text-lg">
            Manage and download your claimed premium digital resources.
          </p>
        </div>

        <Suspense fallback={<div className="text-primary font-bold animate-pulse">Loading Library...</div>}>
          <MyAssetsList initialAssets={enrolledAssets} />
        </Suspense>
      </Container>
    </div>
  );
}