import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Image, Upload, Folder, Search } from "lucide-react";

export default function MediaPage() {
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Media Library</h2>
          <p className="mt-1 text-stone-500">Upload and manage images for your website</p>
        </div>
        <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Upload
        </Button>
        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {["All", "Tours", "Blog", "Destinations"].map((f) => (
            <Button key={f} variant="outline" size="sm" className="gap-1">
              <Folder className="h-3.5 w-3.5" /> {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Upload Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${dragOver ? "border-[#D4A574] bg-[#D4A574]/5" : "border-stone-200"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-stone-300 mb-4" />
          <p className="text-lg font-medium text-stone-600">Drag & drop images here</p>
          <p className="text-sm text-stone-400 mt-1">or click the Upload button above</p>
          <p className="text-xs text-stone-400 mt-2">Supports JPG, PNG, WebP (max 10MB each)</p>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Media Files (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stone-200 p-8 text-stone-400">
              <Image className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-xs">No images yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
