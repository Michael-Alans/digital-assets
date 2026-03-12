import Link from "next/link";
import { apiFetch } from "@/app/lib/api/client";

export default async function CreatorAssetsPage() {
  const assets = await apiFetch<any[]>("/assets/creator/me");

  return (
    /* Changed p-8 to px-4 py-8 md:p-8 */
    <div className="px-4 py-8 md:p-8 max-w-7xl mx-auto">
      
      {/* Header: Stacks on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Managed Assets</h1>
          <p className="text-sm text-muted-foreground">Manage your digital products and track performance.</p>
        </div>
        <Link 
          href="/creator/assets/new" 
          className="w-full md:w-auto text-center bg-primary text-white px-6 py-2.5 rounded-lg font-semibold shadow-premium hover:opacity-90 transition-all"
        >
          + New Asset
        </Link>
      </div>

      {/* Table Container: overflow-x-auto allows horizontal swiping on mobile */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-sm">Asset Name</th>
                <th className="p-4 font-semibold text-sm text-center">Status</th>
                <th className="p-4 font-semibold text-sm">Price</th>
                <th className="p-4 font-semibold text-sm text-center">Sales</th>
                <th className="p-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📦</span>
                      <p className="text-muted-foreground">No assets found. Start by uploading your first one!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-medium min-w-[150px]">{asset.title}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${
                        asset.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {asset.status === 'PUBLISHED' ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-mono">
                      ${Number(asset.price).toFixed(2)}
                    </td>
                    <td className="p-4 text-center text-sm">
                      <span className="bg-muted px-2 py-1 rounded-md">
                         {asset._count?.claims ?? 0}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/creator/assets/${asset.id}/edit`} 
                        className="text-primary hover:text-primary/80 font-medium text-sm whitespace-nowrap"
                      >
                        Edit Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile Hint: Visible only on small screens */}
      <p className="text-center text-[10px] text-muted-foreground mt-4 md:hidden">
        Scroll horizontally to view all columns
      </p>
    </div>
  );
}