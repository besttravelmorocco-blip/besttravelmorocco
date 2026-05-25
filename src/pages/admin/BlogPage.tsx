import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import TipTapEditor from "@/components/TipTapEditor";
import {
  FileText, Plus, Search, Pencil, Trash2, ArrowLeft, Save, Calendar, Clock, Tag
} from "lucide-react";

interface BlogFormData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
  status: "draft" | "published" | "archived";
}

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState<BlogFormData | null>(null);

  // Mock blog data since we need a router
  const [posts, setPosts] = useState<BlogFormData[]>([
    { id: "morocco-travel-guide", title: "Complete Morocco Travel Guide 2026", excerpt: "Everything you need to know...", content: "<p>Morocco is a land of...</p>", image: "/images/blog_1.jpg", category: "Travel Guide", readTime: "8 min", date: "2026-05-01", status: "published" },
    { id: "sahara-desert-tips", title: "10 Tips for Sahara Desert Trips", excerpt: "Essential advice for your desert adventure...", content: "<p>The Sahara desert is...</p>", image: "/images/blog_2.jpg", category: "Tips", readTime: "5 min", date: "2026-04-28", status: "published" },
    { id: "marrakech-medina", title: "Exploring Marrakech Medina", excerpt: "A guide to the old city...", content: "<p>The medina of Marrakech...</p>", image: "/images/blog_3.jpg", category: "Destinations", readTime: "6 min", date: "2026-04-15", status: "draft" },
  ]);

  const [form, setForm] = useState<BlogFormData>({
    id: "", title: "", excerpt: "", content: "<p>Start writing your article...</p>",
    image: "", category: "", readTime: "5 min", date: new Date().toISOString().split("T")[0], status: "draft",
  });

  const filtered = posts.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700",
    draft: "bg-amber-100 text-amber-700",
    archived: "bg-stone-100 text-stone-500",
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editPost) {
      setPosts((prev) => prev.map((p) => (p.id === editPost.id ? { ...form, id: editPost.id } : p)));
    } else {
      const newId = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setPosts((prev) => [...prev, { ...form, id: newId }]);
    }
    setShowForm(false);
    setEditPost(null);
    resetForm();
  };

  const handleEdit = (post: BlogFormData) => {
    setEditPost(post);
    setForm({ ...post });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this blog post?")) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const resetForm = () => {
    setForm({ id: "", title: "", excerpt: "", content: "<p>Start writing your article...</p>", image: "", category: "", readTime: "5 min", date: new Date().toISOString().split("T")[0], status: "draft" });
  };

  if (showForm) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditPost(null); resetForm(); }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold text-stone-900">{editPost ? "Edit Blog Post" : "Add Blog Post"}</h2>
          </div>
          <div className="flex gap-2">
            <Badge className={form.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>{form.status}</Badge>
            <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save Post
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Post Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Best Time to Visit Morocco" />
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} placeholder="Short summary for listing pages..." rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Category</Label>
                <Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Travel Guide" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Read Time</Label>
                <Input value={form.readTime} onChange={(e) => setForm((p) => ({ ...p, readTime: e.target.value }))} placeholder="5 min" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Featured Image URL</Label>
              <Input value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="/images/blog_post.jpg" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))} className="w-full max-w-xs rounded-md border border-stone-200 px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div>
          <Label className="mb-2 block">Content</Label>
          <TipTapEditor content={form.content} onChange={(html) => setForm((p) => ({ ...p, content: html }))} />
        </div>

        <Separator />

        {/* SEO Preview */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-stone-500 mb-2">SEO Preview</h3>
            <div className="rounded-lg bg-stone-50 p-4 space-y-1">
              <p className="text-[#1a0dab] text-lg font-medium truncate">{form.title || "Post Title"} | Morocco Travel Blog | Best Travel Morocco</p>
              <p className="text-[#006621] text-xs">https://www.besttravelmorocco.com/blog/{form.id || "post-slug"}</p>
              <p className="text-stone-600 text-sm line-clamp-2">{form.excerpt || "Post excerpt will appear here..."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Blog Manager</h2>
          <p className="mt-1 text-stone-500">{posts.length} posts total</p>
        </div>
        <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={() => { resetForm(); setEditPost(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Post
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-stone-50">
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Post</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-stone-400">
                    <FileText className="mx-auto h-10 w-10 mb-2 opacity-30" />
                    <p>No posts found</p>
                    <Button variant="link" className="text-[#D4A574] mt-1" onClick={() => setShowForm(true)}>Add your first post</Button>
                  </td></tr>
                ) : (
                  filtered.map((post) => (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-stone-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden">
                            {post.image ? <img src={post.image} alt="" className="h-full w-full object-cover" /> : <FileText className="h-5 w-5 text-stone-400" />}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{post.title}</p>
                            <p className="text-xs text-stone-500">{post.readTime} read</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{post.category}</td>
                      <td className="px-4 py-3 text-stone-600">{post.date}</td>
                      <td className="px-4 py-3"><Badge className={`${statusColors[post.status]} text-xs`}>{post.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(post)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
