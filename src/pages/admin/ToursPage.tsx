import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TourForm from "@/components/TourForm";
import { Map, Plus, Search, Pencil, Trash2 } from "lucide-react";

const statusColors: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-stone-100 text-stone-500",
};

export default function ToursPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "draft" | "published" | "archived">("");
  const [showForm, setShowForm] = useState(false);
  const [editTour, setEditTour] = useState<any>(null);

  const toursQuery = trpc.tours.list.useQuery({ status: statusFilter || undefined, search: search || undefined });
  const utils = trpc.useContext();
  const deleteMutation = trpc.tours.delete.useMutation({
    onSuccess: () => { utils.tours.list.invalidate(); utils.dashboard.stats.invalidate(); },
  });

  const tours = toursQuery.data ?? [];

  if (showForm) {
    return (
      <TourForm
        initialData={editTour ?? undefined}
        onSaved={() => { setShowForm(false); setEditTour(null); }}
        onCancel={() => { setShowForm(false); setEditTour(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Tours Manager</h2>
          <p className="mt-1 text-stone-500">{tours.length} tours total</p>
        </div>
        <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={() => { setEditTour(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Tour
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input placeholder="Search tours..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(["", "published", "draft", "archived"] as const).map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? "bg-[#D4A574] hover:bg-[#c49668]" : ""}>
              {s || "All"}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-stone-50">
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Tour</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Route</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Days</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                    <Map className="mx-auto h-10 w-10 mb-2 opacity-30" />
                    <p>No tours found</p>
                    <Button variant="link" className="text-[#D4A574] mt-1" onClick={() => setShowForm(true)}>Add your first tour</Button>
                  </td></tr>
                ) : (
                  tours.map((tour) => (
                    <tr key={tour.id} className="border-b last:border-0 hover:bg-stone-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden">
                            {tour.image ? <img src={tour.image} alt="" className="h-full w-full object-cover" /> : <Map className="h-5 w-5 text-stone-400" />}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{tour.title}</p>
                            {tour.subtitle && <p className="text-xs text-stone-500">{tour.subtitle}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{tour.fromCity} {tour.toCity && tour.toCity !== tour.fromCity ? `→ ${tour.toCity}` : ""}</td>
                      <td className="px-4 py-3 text-stone-600">{tour.days} days</td>
                      <td className="px-4 py-3 text-stone-600 font-medium">{tour.price ?? "—"}</td>
                      <td className="px-4 py-3"><Badge className={`${statusColors[tour.status]} text-xs`}>{tour.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditTour(tour); setShowForm(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: tour.id }); }}><Trash2 className="h-4 w-4" /></Button>
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
