// apps/web/app/(creator)/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreatorSidebar } from "@/components/creator/CreatorSidebar";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();

  // TypeScript now knows metadata has a 'role' property
  const role = sessionClaims?.metadata?.role;

  if (role !== "CREATOR") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <CreatorSidebar />
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}