// app/lib/api/client.ts

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "NEXT_PUBLIC_API_URL=http://127.0.0.1:4000";
  const url = `${baseUrl}${endpoint}`;
  
  const headers = new Headers(options.headers);

  if (!headers.has("Authorization") && typeof window === "undefined") {
    const { auth } = await import("@clerk/nextjs/server");
    const { getToken } = await auth();
    const token = await getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    
    // DEBUG: Ensure token is actually being retrieved on the server
    console.log(`[Server Fetch] Token found: ${!!token} for URL: ${url}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    // This will catch the ECONNREFUSED and tell us the exact URL attempted
    console.error(`[apiFetch Error] Failed to fetch ${url}:`, error.message);
    throw error;
  }
}