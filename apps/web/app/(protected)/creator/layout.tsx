// apps/web/app/(creator)/layout.tsx
import { CreatorSidebar } from "@/components/creator/CreatorSidebar";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Interactive Client Component for Sidebar */}
      <CreatorSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}