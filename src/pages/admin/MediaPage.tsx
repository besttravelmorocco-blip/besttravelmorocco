import { useRef, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Image, Upload, Search, Trash2, Copy, Check, Loader2 } from "lucide-react";

const SUPABASE_URL = "https://uxkfqxistjvtofskqtwy.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4a2ZxeGlzdGp2dG9mc2txdHd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1MjI3MSwiZXhwIjoyMDk1MDI4MjcxfQ.rxGrWajWcJUt71bHr2fQJ4o9nLpHlhVLhFVl0W3CnGI";
const BUCKET = "images";
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

const storageClient = createClient(SUPABASE_URL, SERVICE_KEY);

async function listImages(): Promise<{ name: string; url: string; size: number; id: string }[]> {
  const { data, error } = await storageClient.storage.from(BUCKET).list("", {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;
  return (data ?? [])
    .filter((f) => f.name && !f.name.endsWith("/"))
    .map((f) => ({
      id: f.id ?? f.name,
      name: f.name,
      url: `${PUBLIC_BASE}/${f.name}`,
      size: f.metadata?.size ?? 0,
    }));
}

async function uploadImage(file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const { error } = await storageClient.storage
    .from(BUCKET)
    .upload(safeName, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return `${PUBLIC_BASE}/${safeName}`;
}

async function deleteImage(name: string): Promise<void> {
  const { error } = await storageClient.storage.from(BUCKET).remove([name]);
  if (error) throw error;
}

export default function MediaPage() {
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data: allMedia = [], isLoading } = useQuery({
    queryKey: ["storage-media"],
    queryFn: listImages,
    staleTime: 0,
  });

  const media = allMedia.filter(
    (m) => !search || m.name.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: (name: string) => deleteImage(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["storage-media"] }),
  });

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      await Promise.all(Array.from(files).map(uploadImage));
      qc.invalidateQueries({ queryKey: ["storage-media"] });
    } finally {
      setUploading(false);
    }
  }, [qc]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      deleteMutation.mutate(name);
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Media Library</h2>
          <p className="mt-1 text-stone-500">
            {isLoading ? "Loading…" : `${allMedia.length} file${allMedia.length !== 1 ? "s" : ""} in Supabase Storage`}
          </p>
        </div>
        <Button
          className="gap-2 bg-[#D4A574] hover:bg-[#c49668]"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${dragOver ? "border-[#D4A574] bg-[#D4A574]/5" : "border-stone-200 hover:border-stone-300"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Upload className={`h-10 w-10 mb-3 transition-colors ${dragOver ? "text-[#D4A574]" : "text-stone-300"}`} />
          <p className="text-base font-medium text-stone-600">Drag & drop images here</p>
          <p className="text-sm text-stone-400 mt-1">or click to browse — JPG, PNG, WebP</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Files ({media.length}{search && allMedia.length !== media.length ? ` of ${allMedia.length}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-stone-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading from storage…</span>
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400">
              <Image className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">{search ? "No images match your search" : "No images uploaded yet"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((m) => (
                <div key={m.id} className="group relative rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                  <div className="aspect-square overflow-hidden">
                    <img src={m.url} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-stone-700 truncate" title={m.name}>{m.name}</p>
                    <p className="text-xs text-stone-400">{formatSize(m.size)}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); handleCopy(m.url, m.id); }}
                      title="Copy URL"
                    >
                      {copied === m.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 text-red-500"
                      onClick={(e) => { e.stopPropagation(); handleDelete(m.name); }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
