import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CalendarDays,
  Trash2,
  ChevronUp,
  ChevronDown,
  Zap,
  Clock,
  CheckCircle,
  Pencil,
  ExternalLink,
} from "lucide-react";
import {
  studentCatalogStore,
  paymentMethodsStore,
  type StudentTour,
} from "@/lib/localStore";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";

// ─── Constants ────────────────────────────────────────────────
const SEPT_2026 = "2026-09-04"; // First Thursday of September 2026
const WEEKS_SEP_DEC = 17;       // Sep 4 → Dec 25

const statusConfig: Record<string, { label: string; color: string }> = {
  open:      { label: "Open",      color: "bg-emerald-100 text-emerald-700" },
  filling:   { label: "Filling",   color: "bg-amber-100 text-amber-700" },
  full:      { label: "Full",      color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", color: "bg-stone-100 text-stone-500" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700" },
};

const PAYMENT_ICONS: Record<string, string> = {
  wise: "🏦",
  paypal: "🅿️",
  card: "💳",
};

// ─── Seat progress bar ────────────────────────────────────────
function SeatBar({ booked, max }: { booked: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((booked / max) * 100)) : 0;
  const color = pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-stone-200">
        <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-stone-500 w-10 text-right">{booked}/{max}</span>
    </div>
  );
}

// ─── Tour card ─────────────────────────────────────────────────
function TourCard({
  tour,
  onEdit,
  onGenerate,
}: {
  tour: StudentTour;
  onEdit: (t: StudentTour) => void;
  onGenerate: (t: StudentTour) => void;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold text-stone-900 leading-snug">
              {tour.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-amber-50 text-amber-700 text-xs">
                <Clock className="h-3 w-3 mr-1" />{tour.days} days
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 text-xs font-semibold">
                From €{tour.basePrice}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onEdit(tour)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pt-0">
        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{tour.description}</p>

        {/* Group pricing table */}
        <div>
          <p className="text-xs font-medium text-stone-600 mb-1.5">Price per person by group size</p>
          <div className="rounded border border-stone-100 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-2 py-1 text-left text-stone-400 font-medium">Group</th>
                  <th className="px-2 py-1 text-right text-stone-400 font-medium">€/person</th>
                </tr>
              </thead>
              <tbody>
                {tour.groupPricing.map((row, i) => (
                  <tr key={i} className="border-t border-stone-100">
                    <td className="px-2 py-1 text-stone-600">
                      {row.minPax}–{row.maxPax} pax
                    </td>
                    <td className="px-2 py-1 text-right font-semibold text-stone-800">
                      €{row.pricePerPerson}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Button
          size="sm"
          className="w-full bg-[#D4A574] hover:bg-[#c49668] text-xs"
          onClick={() => onGenerate(tour)}
        >
          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
          Generate departures
        </Button>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function StudentTripsPage() {
  const qc = useQueryClient();

  // ─── Local state ─────────────────────────
  const [editTour, setEditTour] = useState<StudentTour | null>(null);
  const [generateTour, setGenerateTour] = useState<StudentTour | null>(null);
  const [genForm, setGenForm] = useState({
    startDate: SEPT_2026,
    count: WEEKS_SEP_DEC,
    maxSeats: 16,
    pricePerPerson: 0,
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [editSeats, setEditSeats] = useState(0);
  const [filterTourId, setFilterTourId] = useState<string>("");


  // ─── Data ─────────────────────────────────
  const tours = studentCatalogStore.getAll();
  const paymentMethods = paymentMethodsStore.getAll();

  const departuresQuery = trpc.departures.list.useQuery({ upcomingOnly: false });
  const generateMutation = trpc.departures.generateForTour.useMutation({
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departures"] });
      setGenerateTour(null);
    },
  });
  const updateMutation = trpc.departures.updateSeats.useMutation({
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departures"] }); setEditId(null); },
  });
  const deleteMutation = trpc.departures.delete.useMutation({
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departures"] }),
  });

  const allDepartures = departuresQuery.data ?? [];
  const departures = filterTourId
    ? allDepartures.filter((d) => d.tourId === filterTourId)
    : allDepartures;

  // Group by month
  const byMonth = departures.reduce<Record<string, typeof departures>>((acc, d) => {
    const m = d.departureDate.slice(0, 7);
    if (!acc[m]) acc[m] = [];
    acc[m].push(d);
    return acc;
  }, {});
  const months = Object.keys(byMonth).sort();

  // ─── Bulk generate all Sept → Dec ─────────
  function handleBulkGenerate() {
    if (!confirm(`Generate ${WEEKS_SEP_DEC} weekly Thu–Sun departures for ALL 5 tours from ${SEPT_2026}?`)) return;
    for (const tour of tours) {
      generateMutation.mutate({
        tourId: tour.id,
        tourName: tour.title,
        count: WEEKS_SEP_DEC,
        startDate: SEPT_2026,
        maxSeats: 16,
        pricePerPerson: tour.basePrice,
      });
    }
  }

  // ─── Save tour edits ──────────────────────
  function saveTourEdit(updates: Partial<StudentTour>) {
    if (!editTour) return;
    studentCatalogStore.update(editTour.id, updates);
    qc.invalidateQueries();
    setEditTour(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Student Trips</h2>
          <p className="mt-1 text-stone-500">
            Weekly Thu → Sun departures · {allDepartures.length} scheduled
          </p>
        </div>
        <Button
          className="bg-[#D4A574] hover:bg-[#c49668]"
          onClick={handleBulkGenerate}
          disabled={generateMutation.isPending}
        >
          <Zap className="mr-2 h-4 w-4" />
          Generate Sept – Dec 2026
        </Button>
      </div>

      <Tabs defaultValue="tours">
        <TabsList>
          <TabsTrigger value="tours">Tour Catalog</TabsTrigger>
          <TabsTrigger value="schedule">Departure Schedule</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Tour Catalog ─────────────────── */}
        <TabsContent value="tours" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                onEdit={setEditTour}
                onGenerate={(t) => {
                  setGenerateTour(t);
                  setGenForm({
                    startDate: SEPT_2026,
                    count: WEEKS_SEP_DEC,
                    maxSeats: 16,
                    pricePerPerson: t.basePrice,
                  });
                }}
              />
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 2: Departure Schedule ───────────── */}
        <TabsContent value="schedule" className="mt-4 space-y-4">
          {/* Tour filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filterTourId === "" ? "default" : "outline"}
              className={filterTourId === "" ? "bg-[#D4A574] hover:bg-[#c49668]" : ""}
              onClick={() => setFilterTourId("")}
            >
              All tours
            </Button>
            {tours.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={filterTourId === t.id ? "default" : "outline"}
                className={filterTourId === t.id ? "bg-[#D4A574] hover:bg-[#c49668]" : ""}
                onClick={() => setFilterTourId(t.id)}
              >
                {t.days}D
              </Button>
            ))}
          </div>

          {departures.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-stone-400">
                <CalendarDays className="mx-auto h-10 w-10 mb-3 opacity-30" />
                <p className="mb-4">No departures yet</p>
                <Button className="bg-[#D4A574] hover:bg-[#c49668]" onClick={handleBulkGenerate}>
                  <Zap className="mr-2 h-4 w-4" /> Generate Sept – Dec 2026 for all tours
                </Button>
              </CardContent>
            </Card>
          ) : (
            months.map((month) => {
              const label = format(parseISO(month + "-01"), "MMMM yyyy");
              return (
                <Card key={month}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-semibold text-stone-600">{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-stone-50 text-xs">
                            <th className="px-3 py-2 text-left font-medium text-stone-500">Tour</th>
                            <th className="px-3 py-2 text-left font-medium text-stone-500">Dates</th>
                            <th className="px-3 py-2 text-left font-medium text-stone-500 w-44">Seats</th>
                            <th className="px-3 py-2 text-left font-medium text-stone-500">€/person</th>
                            <th className="px-3 py-2 text-left font-medium text-stone-500">Status</th>
                            <th className="px-3 py-2 text-right font-medium text-stone-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {byMonth[month].map((dep) => {
                            const sc = statusConfig[dep.status] ?? statusConfig.open;
                            const isEditing = editId === dep.id;
                            return (
                              <tr key={dep.id} className="border-b last:border-0 hover:bg-stone-50 transition-colors">
                                <td className="px-3 py-2.5">
                                  <p className="text-xs font-medium text-stone-800 max-w-[160px] truncate">{dep.tourName}</p>
                                </td>
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                  <p className="text-xs text-stone-700 font-medium">Thu {dep.departureDate}</p>
                                  <p className="text-xs text-stone-400">→ Sun {dep.returnDate}</p>
                                </td>
                                <td className="px-3 py-2.5 w-44">
                                  {isEditing ? (
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setEditSeats(Math.max(0, editSeats - 1))}>
                                        <ChevronDown className="h-3 w-3" />
                                      </Button>
                                      <span className="w-6 text-center text-xs font-semibold">{editSeats}</span>
                                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setEditSeats(Math.min(dep.maxSeats, editSeats + 1))}>
                                        <ChevronUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="h-5 px-2 text-xs bg-[#D4A574] hover:bg-[#c49668]"
                                        onClick={() => updateMutation.mutate({
                                          id: dep.id,
                                          bookedSeats: editSeats,
                                          status: editSeats >= dep.maxSeats ? "full" : editSeats >= dep.maxSeats * 0.7 ? "filling" : "open",
                                        })}
                                      >
                                        ✓
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-5 px-1 text-xs" onClick={() => setEditId(null)}>✕</Button>
                                    </div>
                                  ) : (
                                    <button className="w-full text-left" onClick={() => { setEditId(dep.id); setEditSeats(dep.bookedSeats); }}>
                                      <SeatBar booked={dep.bookedSeats} max={dep.maxSeats} />
                                    </button>
                                  )}
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="text-xs font-semibold text-stone-800">
                                    {dep.pricePerPerson ? `€${dep.pricePerPerson}` : "—"}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5">
                                  <Badge className={`${sc.color} text-xs`}>{sc.label}</Badge>
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-400 hover:text-red-600"
                                    onClick={() => { if (confirm("Delete this departure?")) deleteMutation.mutate({ id: dep.id }); }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ── TAB 3: Payment Methods ──────────────── */}
        <TabsContent value="payments" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {paymentMethods.map((method) => (
              <Card key={method.id} className={method.enabled ? "" : "opacity-60"}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <span>{PAYMENT_ICONS[method.id]}</span>
                      {method.label}
                    </CardTitle>
                    <Switch
                      checked={method.enabled}
                      onCheckedChange={(v) => {
                        paymentMethodsStore.update(method.id, { enabled: v });
                        qc.invalidateQueries();
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-stone-500">Payment link</p>
                    <div className="flex items-center gap-2">
                      <Input
                        className="text-xs h-7"
                        value={method.link}
                        onChange={(e) => {
                          paymentMethodsStore.update(method.id, { link: e.target.value });
                          qc.invalidateQueries();
                        }}
                      />
                      <a href={method.link} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-stone-500">Instructions for customer</p>
                    <textarea
                      className="w-full text-xs rounded border border-stone-200 p-2 h-20 resize-none focus:outline-none focus:border-amber-400"
                      value={method.instructions}
                      onChange={(e) => {
                        paymentMethodsStore.update(method.id, { instructions: e.target.value });
                        qc.invalidateQueries();
                      }}
                    />
                  </div>
                  {method.enabled && (
                    <a href={method.link} target="_blank" rel="noopener noreferrer" className="block">
                      <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574] hover:text-white">
                        <ExternalLink className="h-3 w-3" /> Test link
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment summary card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Active payment methods shown to students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.filter((m) => m.enabled).map((m) => (
                  <a
                    key={m.id}
                    href={m.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-[#D4A574] hover:text-[#D4A574] transition-colors"
                  >
                    <span>{PAYMENT_ICONS[m.id]}</span>
                    {m.label}
                    <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Generate departures dialog ─────────── */}
      <Dialog open={!!generateTour} onOpenChange={() => setGenerateTour(null)}>
        {generateTour && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Departures</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-stone-500">{generateTour.title}</p>
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Start date (Thursday)</label>
                  <Input
                    type="date"
                    value={genForm.startDate}
                    onChange={(e) => setGenForm((p) => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Number of weeks</label>
                  <Input
                    type="number"
                    min={1}
                    max={52}
                    value={genForm.count}
                    onChange={(e) => setGenForm((p) => ({ ...p, count: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Max seats</label>
                  <Input
                    type="number"
                    min={1}
                    value={genForm.maxSeats}
                    onChange={(e) => setGenForm((p) => ({ ...p, maxSeats: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Base price/person (€)</label>
                  <Input
                    type="number"
                    min={0}
                    value={genForm.pricePerPerson}
                    onChange={(e) => setGenForm((p) => ({ ...p, pricePerPerson: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <p className="text-xs text-stone-400">
                This will create {genForm.count} weekly Thu → Sun departures starting {genForm.startDate}.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setGenerateTour(null)}>Cancel</Button>
                <Button
                  className="bg-[#D4A574] hover:bg-[#c49668]"
                  disabled={generateMutation.isPending}
                  onClick={() =>
                    generateMutation.mutate({
                      tourId: generateTour.id,
                      tourName: generateTour.title,
                      count: genForm.count,
                      startDate: genForm.startDate,
                      maxSeats: genForm.maxSeats,
                      pricePerPerson: genForm.pricePerPerson || undefined,
                    })
                  }
                >
                  {generateMutation.isPending ? "Generating…" : `Generate ${genForm.count} departures`}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Edit tour pricing dialog ──────────── */}
      <Dialog open={!!editTour} onOpenChange={() => setEditTour(null)}>
        {editTour && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Pricing — {editTour.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Base price (shared) €</label>
                  <Input
                    type="number"
                    value={editTour.basePrice}
                    onChange={(e) => setEditTour((p) => p ? { ...p, basePrice: Number(e.target.value) } : p)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Private room €</label>
                  <Input
                    type="number"
                    value={editTour.privatePrice ?? ""}
                    onChange={(e) => setEditTour((p) => p ? { ...p, privatePrice: Number(e.target.value) } : p)}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-stone-600 mb-2">Group pricing tiers</p>
                <div className="space-y-2">
                  {editTour.groupPricing.map((row, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-stone-500 w-20">{row.minPax}–{row.maxPax} pax</span>
                      <span className="text-stone-400">€</span>
                      <Input
                        type="number"
                        className="h-7 text-xs w-24"
                        value={row.pricePerPerson}
                        onChange={(e) => {
                          const newPricing = [...editTour.groupPricing];
                          newPricing[i] = { ...row, pricePerPerson: Number(e.target.value) };
                          setEditTour((p) => p ? { ...p, groupPricing: newPricing } : p);
                        }}
                      />
                      <span className="text-stone-400">per person</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setEditTour(null)}>Cancel</Button>
                <Button
                  className="bg-[#D4A574] hover:bg-[#c49668]"
                  onClick={() => saveTourEdit({ basePrice: editTour.basePrice, privatePrice: editTour.privatePrice, groupPricing: editTour.groupPricing })}
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" /> Save pricing
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
