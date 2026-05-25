import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Plus, Pencil, Trash2, ArrowLeft, Save, MessageSquare } from "lucide-react";
import type { LocalTestimonial } from "@/lib/localStore";

type FormState = Omit<LocalTestimonial, "createdAt">;

const emptyForm = (): FormState => ({
  id: crypto.randomUUID(),
  name: "",
  location: "",
  rating: 5,
  text: "",
  avatar: "",
});

export default function TestimonialsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const utils = trpc.useContext();
  const invalidate = () => {
    utils.testimonials.list.invalidate();
    utils.dashboard.stats.invalidate();
  };

  const listQuery = trpc.testimonials.list.useQuery();
  const createMutation = trpc.testimonials.create.useMutation();
  const updateMutation = trpc.testimonials.update.useMutation();
  const deleteMutation = trpc.testimonials.delete.useMutation();

  const testimonials = listQuery.data ?? [];

  const handleAdd = () => {
    setForm(emptyForm());
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = (t: LocalTestimonial) => {
    setForm({ id: t.id, name: t.name, location: t.location, rating: t.rating, text: t.text, avatar: t.avatar ?? "" });
    setEditId(t.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this testimonial?")) {
      deleteMutation.mutate(id, { onSuccess: invalidate });
    }
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.text.trim()) return;
    if (editId) {
      updateMutation.mutate({ id: editId, name: form.name, location: form.location, rating: form.rating, text: form.text, avatar: form.avatar || undefined }, { onSuccess: invalidate });
    } else {
      createMutation.mutate({ id: form.id, name: form.name, location: form.location, rating: form.rating, text: form.text, avatar: form.avatar || undefined }, { onSuccess: invalidate });
    }
    setShowForm(false);
    setEditId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
  };

  if (showForm) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold text-stone-900">{editId ? "Edit Testimonial" : "Add Testimonial"}</h2>
          </div>
          <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={handleSave}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Sarah Johnson"
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. USA, France, UK"
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, rating: star }))}
                    className="p-0.5 focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${star <= form.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Review Text *</Label>
              <Textarea
                value={form.text}
                onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                rows={4}
                placeholder="What did they say about their experience?"
              />
            </div>

            <div className="space-y-2">
              <Label>Avatar URL</Label>
              <Input
                value={form.avatar}
                onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
                placeholder="https://... (optional)"
              />
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
          <h2 className="text-2xl font-bold text-stone-900">Testimonials</h2>
          <p className="mt-1 text-stone-500">{testimonials.length} testimonials total</p>
        </div>
        <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
              <p>No testimonials yet</p>
              <Button variant="link" className="text-[#D4A574] mt-1" onClick={handleAdd}>
                Add your first testimonial
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-stone-50">
                    <th className="px-4 py-3 text-left font-medium text-stone-500">Reviewer</th>
                    <th className="px-4 py-3 text-left font-medium text-stone-500">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-stone-500">Rating</th>
                    <th className="px-4 py-3 text-left font-medium text-stone-500">Review</th>
                    <th className="px-4 py-3 text-right font-medium text-stone-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-stone-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                            {t.avatar ? (
                              <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-sm font-semibold text-stone-500">
                                {t.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-stone-900">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{t.location}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${star <= t.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-600 max-w-xs">
                        <p className="truncate">{t.text}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
