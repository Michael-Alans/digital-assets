"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useAssets } from "@app/lib/hooks/useAssets";
import { AssetGrid } from "@components/assets/AssetGrid";
import { SearchBar } from "@components/search/SearchBar";
import { Container } from "@components/layout/Container";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { LayoutGrid, ShieldCheck, Zap, Download } from "lucide-react"; // Icons for features

function HomePageContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const q = searchParams.get("q") || "";
  const { assets, isLoading } = useAssets({ q });

  const isCreator = user?.publicMetadata?.role === "CREATOR";

  const categories = [
    { name: "UI Kits", icon: "🎨", href: "/assets?q=uikit" },
    { name: "Icons", icon: "✨", href: "/assets?q=icons" },
    { name: "Templates", icon: "📑", href: "/assets?q=templates" },
    { name: "3D Assets", icon: "📦", href: "/assets?q=3d" },
  ];

  return (
    <div className="bg-bg">
      <div className="py-20">
        <Container>
          {/* --- HERO SECTION --- */}
          <section className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 text-text-main">
              Build faster with <span className="text-primary">premium assets.</span>
            </h1>
            <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              The marketplace for high-quality design templates, icons, and kits curated by the world's best creators.
            </p>
            
            <div className="max-w-2xl mx-auto drop-shadow-sm hover:drop-shadow-md transition-shadow mb-8">
              <SearchBar />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              {!isCreator ? (
                <Link 
                  href="/creator/onboarding"
                  className="bg-primary text-white rounded-full font-semibold py-3 px-8 hover:opacity-90 transition-all shadow-md flex items-center gap-2"
                >
                  Become a Creator
                </Link>
              ) : (
                <Link 
                  href="/creator/assets"
                  className="px-8 py-3 rounded-full border border-border text-sm font-medium hover:bg-muted/50 transition-all flex items-center gap-2"
                >
                  Manage Your Dashboard <LayoutGrid size={16} />
                </Link>
              )}
            </div>
          </section>

          {/* --- QUICK CATEGORIES --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
            {categories.map((cat) => (
              <Link 
                key={cat.name} 
                href={cat.href}
                className="flex items-center justify-center gap-3 p-4 bg-bg border border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="font-medium text-text-main">{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* --- ASSETS RESULTS --- */}
          <section className="mt-20">
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <h2 className="text-2xl font-medium text-text-main">
                {q ? `Results for "${q}"` : "Featured Assets"}
              </h2>
              {!isLoading && (
                <span className="text-sm text-muted">
                  {assets.length} items found
                </span>
              )}
            </div>
            <div className="min-h-[400px]">
               <AssetGrid assets={assets} isLoading={isLoading} />
            </div>
          </section>

          {/* --- FEATURES SECTION --- */}
          <section className="py-24 grid md:grid-cols-3 gap-12 border-t border-border mt-24">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold">Curated Quality</h3>
              <p className="text-muted leading-relaxed">Every asset is manually reviewed to ensure it meets our high design standards and licensing requirements.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold">Instant Integration</h3>
              <p className="text-muted leading-relaxed">Download assets in multiple formats. Ready to use in Figma, React, or your favorite design tool instantly.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Download size={24} />
              </div>
              <h3 className="text-xl font-bold">Lifetime Access</h3>
              <p className="text-muted leading-relaxed">Buy once, use forever. All your purchased assets are stored in your library for easy access anytime.</p>
            </div>
          </section>

          {/* --- FOOTER CTA --- */}
          <section className="mt-24 p-12 bg-text-main rounded-[2rem] text-center text-bg overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to share your work?</h2>
              <p className="text-bg/70 max-w-lg mx-auto mb-8">
                Join our community of creators and start earning by selling your digital designs to thousands of developers.
              </p>
              <Link 
                href={isCreator ? "/creator/assets" : "/creator/onboarding"}
                className="inline-block bg-primary text-white font-bold py-4 px-10 rounded-xl hover:scale-105 transition-transform"
              >
                {isCreator ? "Upload an Asset" : "Get Started Now"}
              </Link>
            </div>
          </section>

        </Container>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-primary animate-pulse font-medium">Loading Marketplace...</div>}>
      <HomePageContent />
    </Suspense>
  );
}