import { useRef, useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Image, Upload, Search, Trash2, Copy, Check } from "lucide-react";
import type { LocalMedia } from "@/lib/localStore";

export default function MediaPage() {
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useContext();
  const invalidate = () => {
    utils.media.list.invalidate();
    utils.dashboard.stats.invalidate();
  };

  const listQuery = trpc.media.list.useQuery();
  const createMutation = trpc.media.create.useMutation();
  const deleteMutation = trpc.media.delete.useMutation();

  const allMedia: LocalMedia[] = listQuery.data ?? [];
  const media = allMedia.filter((m) =>
    !search || m.name.toLowerCase().includes(search.toLowerCase())
  );

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        createMutation.mutate(
          { id: crypto.randomUUID(), name: file.name, url, type: "image", size: file.size },
          { onSuccess: invalidate }
        );
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this image?")) {
      deleteMutation.mutate(id, { onSuccess: invalidate });
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
          <p className="mt-1 text-stone-500">{allMedia.length} file{allMedia.length !== 1 ? "s" : ""} uploaded</p>
        </div>
        <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Upload
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
            Uploaded Files ({media.length}{search && allMedia.length !== media.length ? ` of ${allMedia.length}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400">
              <Image className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">{search ? "No images match your search" : "No images uploaded yet"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((m) => (
                <div key={m.id} className="group relative rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                  <div className="aspect-square overflow-hidden">
                    <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
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
                      onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
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
