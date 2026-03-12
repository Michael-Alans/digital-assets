"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export function AssetForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const uploadToS3 = async (file: File, kind: "ZIP" | "PREVIEW") => {
    const token = await getToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/s3/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${file.type}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!res.ok) throw new Error(`Failed to get upload authorization for ${kind}`);
    const { url, key } = await res.json();

    const uploadRes = await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadRes.ok) throw new Error(`S3 Upload failed for ${kind}`);

    return {
      s3Key: key,
      contentType: file.type,
      size: file.size,
      bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "assets-bucket",
      kind: kind, 
    };
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this asset? This action is permanent and will remove all associated files."
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assets/${initialData.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete asset.");
      }

      toast.success("Asset deleted successfully");
      router.push("/creator/assets");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred during deletion.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    
    try {
      const token = await getToken();
      const formData = new FormData(formRef.current);
      
      const payload: any = {
        title: formData.get("title"),
        description: formData.get("description"),
        price: parseFloat(formData.get("price") as string) || 0,
        status: formData.get("status"),
        files: [], 
      };

      if (previewFile) {
        toast.info("Uploading thumbnail...");
        const previewData = await uploadToS3(previewFile, "PREVIEW");
        payload.files.push(previewData);
      }

      if (mainFile) {
        toast.info("Uploading source files...");
        const zipData = await uploadToS3(mainFile, "ZIP");
        payload.files.push(zipData);
      }

      const apiUrl = initialData 
        ? `${process.env.NEXT_PUBLIC_API_URL}/assets/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/assets`;
      
      const res = await fetch(apiUrl, {
        method: initialData ? "PATCH" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save asset record.");
      }

      toast.success(initialData ? "Asset updated!" : "Asset launched successfully!");
      router.refresh();
      router.push("/creator/assets");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Changed p-8 to p-5 md:p-8 and added w-full to prevent overflow */
    <form 
      ref={formRef} 
      onSubmit={handleSubmit} 
      className="space-y-6 bg-surface p-5 md:p-8 rounded-2xl border border-border shadow-premium w-full max-w-full overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2 text-foreground">Asset Title</label>
          <input name="title" defaultValue={initialData?.title} required className="w-full p-3 rounded-xl border border-border bg-transparent outline-none focus:ring-2 ring-primary transition-all text-sm md:text-base" placeholder="e.g. Modern UI Kit" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
          <textarea name="description" defaultValue={initialData?.description} className="w-full p-3 rounded-xl border border-border bg-transparent min-h-[100px] outline-none focus:ring-2 ring-primary transition-all text-sm md:text-base" placeholder="Details about your asset..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Price (USD)</label>
          <input name="price" type="number" step="0.01" defaultValue={initialData ? Number(initialData.price) : "0.00"} required className="w-full p-3 rounded-xl border border-border bg-transparent outline-none focus:ring-2 ring-primary transition-all text-sm md:text-base" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Visibility</label>
          <select name="status" defaultValue={initialData?.status || "DRAFT"} className="w-full p-3 rounded-xl border border-border bg-surface outline-none focus:ring-2 ring-primary transition-all text-sm md:text-base">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      <hr className="border-border" />

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Marketplace Thumbnail</label>
          {/* Changed gap-4 to gap-3 and made flex-col on small mobile to prevent text overflow */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4 border border-border rounded-xl bg-muted/5">
            <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
              {previewFile ? (
                <img src={URL.createObjectURL(previewFile)} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🖼️</span>
              )}
            </div>
            <div className="flex-1 w-full overflow-hidden">
              {/* Added w-full and overflow-hidden to the input container */}
              <input type="file" accept="image/*" className="text-xs w-full block file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80" onChange={(e) => setPreviewFile(e.target.files?.[0] || null)} />
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">PNG or JPG recommended.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Source Files (Private)</label>
          <div className="p-4 md:p-6 border-2 border-dashed border-border rounded-xl bg-muted/10 text-center hover:bg-muted/20 transition-all cursor-pointer">
            <label className="cursor-pointer block">
              <span className="text-primary font-bold block mb-1 text-sm md:text-base">Click to upload main package</span>
              <input type="file" className="hidden" accept=".zip,.rar,.7z" onChange={(e) => setMainFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-muted-foreground break-all">
                {mainFile ? `Selected: ${mainFile.name}` : "ZIP, RAR, or 7Z (Max 50MB)"}
              </p>
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-4">
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full md:flex-[2] bg-primary text-white py-4 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98] text-sm md:text-base"
        >
          {loading ? "Processing..." : initialData ? "Update Asset" : "Launch Asset"}
        </button>

        {initialData && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full md:flex-1 px-6 py-4 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all disabled:opacity-50 active:scale-[0.98] text-sm md:text-base"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}