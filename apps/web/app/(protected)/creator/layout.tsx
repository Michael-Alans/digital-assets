import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreatorSidebar } from "@/components/creator/CreatorSidebar";

export const dynamic = "force-dynamic";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims, userId } = await auth();

  // 1. If not logged in at all, go to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  const role = sessionClaims?.metadata?.role;

  // 2. The Gatekeeper
  // We check specifically for "CREATOR". 
  if (role !== "CREATOR") {
    console.log("🚫 Access Denied. Current Role in JWT:", role);
    redirect("/"); 
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <CreatorSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}