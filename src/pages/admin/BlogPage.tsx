import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import TipTapEditor from "@/components/TipTapEditor";
import {
  FileText, Plus, Search, Pencil, Trash2, ArrowLeft, Save, Calendar, Clock, Tag,
} from "lucide-react";
import type { LocalBlogPost } from "@/lib/localStore";

type FormState = Omit<LocalBlogPost, "createdAt" | "updatedAt">;

const emptyForm = (): FormState => ({
  id: crypto.randomUUID(),
  title: "",
  slug: "",
  excerpt: "",
  content: "<p>Start writing your article...</p>",
  coverImage: "",
  tags: [],
  status: "draft",
  author: "Admin",
});

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const statusColors: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
};

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [tagsInput, setTagsInput] = useState("");

  const utils = trpc.useContext();
  const invalidate = () => {
    utils.blog.list.invalidate();
    utils.dashboard.stats.invalidate();
  };

  const listQuery = trpc.blog.list.useQuery({ search: search || undefined });
  const createMutation = trpc.blog.create.useMutation();
  const updateMutation = trpc.blog.update.useMutation();
  const deleteMutation = trpc.blog.delete.useMutation();

  const posts = listQuery.data ?? [];

  const handleAdd = () => {
    setForm(emptyForm());
    setTagsInput("");
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = (post: LocalBlogPost) => {
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      tags: post.tags,
      status: post.status,
      author: post.author,
    });
    setTagsInput(post.tags.join(", "));
    setEditId(post.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this blog post?")) {
      deleteMutation.mutate(id, { onSuccess: invalidate });
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = { ...form, tags };
    if (editId) {
      updateMutation.mutate({ ...payload, id: editId }, { onSuccess: invalidate });
    } else {
      createMutation.mutate(payload, { onSuccess: invalidate });
    }
    setShowForm(false);
    setEditId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
  };

  const handleTitleChange = (title: string) => {
    setForm((p) => ({ ...p, title, slug: editId ? p.slug : toSlug(title) }));
  };

  if (showForm) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold text-stone-900">
              {editId ? "Edit Blog Post" : "Add Blog Post"}
            </h2>
          </div>
          <div className="flex gap-2">
            <Badge className={form.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
              {form.status}
            </Badge>
            <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save Post
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Post Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Best Time to Visit Morocco"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="auto-generated from title"
              />
            </div>

            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="Short summary for listing pages..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Tags
                </Label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Travel Guide, Tips, Sahara"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Author
                </Label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                  placeholder="Admin"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Status
                </Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as LocalBlogPost["status"] }))}
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input
                value={form.coverImage}
                onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))}
                placeholder="/images/blog_post.jpg"
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div>
          <Label className="mb-2 block">Content</Label>
          <TipTapEditor content={form.content} onChange={(html) => setForm((p) => ({ ...p, content: html }))} />
        </div>

        <Separator />

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-stone-500 mb-2">SEO Preview</h3>
            <div className="rounded-lg bg-stone-50 p-4 space-y-1">
              <p className="text-[#1a0dab] text-lg font-medium truncate">
                {form.title || "Post Title"} | Morocco Travel Blog | Best Travel Morocco
              </p>
              <p className="text-[#006621] text-xs">
                https://www.besttravelmorocco.com/blog/{form.slug || "post-slug"}
              </p>
              <p className="text-stone-600 text-sm line-clamp-2">
                {form.excerpt || "Post excerpt will appear here..."}
              </p>
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
        <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Add Post
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-stone-50">
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Post</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Tags</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Author</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-stone-400">
                      <FileText className="mx-auto h-10 w-10 mb-2 opacity-30" />
                      <p>No posts found</p>
                      <Button variant="link" className="text-[#D4A574] mt-1" onClick={handleAdd}>
                        Add your first post
                      </Button>
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-stone-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                            {post.coverImage ? (
                              <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <FileText className="h-5 w-5 text-stone-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{post.title}</p>
                            <p className="text-xs text-stone-500">/blog/{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {post.tags.slice(0, 2).join(", ")}
                        {post.tags.length > 2 && <span className="text-stone-400"> +{post.tags.length - 2}</span>}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{post.author}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${statusColors[post.status]} text-xs`}>{post.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(post)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
