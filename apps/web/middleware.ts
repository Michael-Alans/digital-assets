import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes per GEMINI.md: Home and Asset Browsing
const isPublicRoute = createRouteMatcher([
  '/', 
  '/assets(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  // 1. Protection Logic
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // 2. Path Injection Logic (The Loop Killer)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};