import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
Plus, Trash2, GripVertical, Save, ArrowLeft, Check,
  Calendar, DollarSign, MapPin, Clock, Star, Image, FileText,
Settings, ChevronDown, ChevronUp
} from "lucide-react";

interface ItineraryDay {
  day: number;
  title: string;
  route: string;
  desc: string;
  activities?: string[];
  meals?: { breakfast?: boolean; lunch?: boolean; dinner?: boolean };
  accommodation?: string;
}

interface TourFormData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  days: number;
  fromCity: string;
  toCity: string;
  price: string;
  image: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  itinerary: ItineraryDay[];
  included: string[];
  highlights: string[];
}

const emptyDay = (dayNum: number): ItineraryDay => ({
  day: dayNum,
  title: "",
  route: "",
  desc: "",
  activities: [],
  meals: { breakfast: false, lunch: false, dinner: false },
  accommodation: "",
});

const defaultIncluded = [
  "Private air-conditioned transport",
  "English-speaking driver/guide",
  "Accommodation (hotels/riads/camps)",
  "Daily breakfast",
  "Camel trekking in the Sahara",
  "All entrance fees",
];

interface TourFormProps {
  initialData?: Partial<TourFormData>;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function TourForm({ initialData, onSaved, onCancel }: TourFormProps) {
  const [form, setForm] = useState<TourFormData>({
    id: initialData?.id ?? `tour-${Date.now()}`,
    title: initialData?.title ?? "",
    subtitle: initialData?.subtitle ?? "",
    description: initialData?.description ?? "",
    days: initialData?.days ?? 3,
    fromCity: initialData?.fromCity ?? "Marrakech",
    toCity: initialData?.toCity ?? "Marrakech",
    price: initialData?.price ?? "",
    image: initialData?.image ?? "",
    status: initialData?.status ?? "draft",
    featured: initialData?.featured ?? false,
    itinerary: initialData?.itinerary ?? [emptyDay(1), emptyDay(2), emptyDay(3)],
    included: initialData?.included ?? [...defaultIncluded],
    highlights: initialData?.highlights ?? [],
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [newHighlight, setNewHighlight] = useState("");
  const [newIncluded, setNewIncluded] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const utils = trpc.useContext();
  const createMutation = trpc.tours.create.useMutation({
    onSuccess: () => { utils.tours.list.invalidate(); utils.dashboard.stats.invalidate(); onSaved?.(); },
  });
  const updateMutation = trpc.tours.update.useMutation({
    onSuccess: () => { utils.tours.list.invalidate(); utils.dashboard.stats.invalidate(); onSaved?.(); },
  });

  const updateField = (field: keyof TourFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addDay = () => {
    const newDay = emptyDay(form.itinerary.length + 1);
    setForm((prev) => ({ ...prev, itinerary: [...prev.itinerary, newDay] }));
  };

  const removeDay = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })),
    }));
  };

  const updateDay = (idx: number, field: keyof ItineraryDay, value: any) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((d, i) => (i === idx ? { ...d, [field]: value } : d)),
    }));
  };

  const toggleMeal = (idx: number, meal: "breakfast" | "lunch" | "dinner") => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((d, i) =>
        i === idx ? { ...d, meals: { ...d.meals, [meal]: !d.meals?.[meal] } } : d
      ),
    }));
  };

  const addActivity = (idx: number) => {
    if (!newActivity.trim()) return;
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((d, i) =>
        i === idx ? { ...d, activities: [...(d.activities ?? []), newActivity.trim()] } : d
      ),
    }));
    setNewActivity("");
  };

  const removeActivity = (dayIdx: number, actIdx: number) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((d, i) =>
        i === dayIdx ? { ...d, activities: d.activities?.filter((_, ai) => ai !== actIdx) } : d
      ),
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (initialData?.id) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">
              {initialData?.id ? "Edit Tour" : "Add New Tour"}
            </h2>
            <p className="text-sm text-stone-500">{form.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={form.status === "published" ? "bg-emerald-100 text-emerald-700" : form.status === "draft" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"}>
            {form.status}
          </Badge>
          <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Tour"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-stone-100">
          <TabsTrigger value="basic" className="gap-1"><FileText className="h-3.5 w-3.5" /> Basic Info</TabsTrigger>
          <TabsTrigger value="itinerary" className="gap-1"><Calendar className="h-3.5 w-3.5" /> Itinerary ({form.itinerary.length})</TabsTrigger>
          <TabsTrigger value="included" className="gap-1"><Check className="h-3.5 w-3.5" /> Included</TabsTrigger>
          <TabsTrigger value="highlights" className="gap-1"><Star className="h-3.5 w-3.5" /> Highlights</TabsTrigger>
          <TabsTrigger value="seo" className="gap-1"><Settings className="h-3.5 w-3.5" /> SEO</TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Info */}
        <TabsContent value="basic" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Tour Title *</Label>
                  <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Sahara Desert Adventure" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Subtitle</Label>
                  <Input value={form.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} placeholder="Short tagline for the tour" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Full tour description..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Duration (days)</Label>
                  <Input type="number" min={1} max={30} value={form.days} onChange={(e) => updateField("days", parseInt(e.target.value) || 1)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Price</Label>
                  <Input value={form.price} onChange={(e) => updateField("price", e.target.value)} placeholder="e.g. From EUR 350" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> From City</Label>
                  <Input value={form.fromCity} onChange={(e) => updateField("fromCity", e.target.value)} placeholder="Marrakech" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> To City</Label>
                  <Input value={form.toCity} onChange={(e) => updateField("toCity", e.target.value)} placeholder="Marrakech" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="flex items-center gap-1"><Image className="h-3.5 w-3.5" /> Featured Image URL</Label>
                  <Input value={form.image} onChange={(e) => updateField("image", e.target.value)} placeholder="/images/tour_sahara.jpg" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => updateField("featured", e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300"
                  />
                  <Label className="mb-0">Featured on homepage</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Itinerary */}
        <TabsContent value="itinerary" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Day-by-Day Itinerary</h3>
            <Button variant="outline" size="sm" className="gap-1" onClick={addDay}>
              <Plus className="h-4 w-4" /> Add Day
            </Button>
          </div>

          {form.itinerary.map((day, idx) => (
            <Card key={idx} className="overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 bg-stone-50 cursor-pointer"
                onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
              >
                <GripVertical className="h-4 w-4 text-stone-400" />
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4A574] text-xs font-bold text-white">
                  {day.day}
                </span>
                <span className="flex-1 font-medium text-stone-900">{day.title || `Day ${day.day}`}</span>
                <span className="text-xs text-stone-500">{day.route}</span>
                {expandedDay === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                  onClick={(e) => { e.stopPropagation(); removeDay(idx); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {expandedDay === idx && (
                <CardContent className="pt-4 space-y-4 border-t">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Day Title</Label>
                      <Input value={day.title} onChange={(e) => updateDay(idx, "title", e.target.value)} placeholder="e.g. Atlas Mountains & Ait Benhaddou" />
                    </div>
                    <div className="space-y-2">
                      <Label>Route</Label>
                      <Input value={day.route} onChange={(e) => updateDay(idx, "route", e.target.value)} placeholder="e.g. Marrakech → Ouarzazate" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Description</Label>
                      <Textarea value={day.desc} onChange={(e) => updateDay(idx, "desc", e.target.value)} placeholder="What happens on this day..." rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Accommodation</Label>
                      <Input value={day.accommodation ?? ""} onChange={(e) => updateDay(idx, "accommodation", e.target.value)} placeholder="e.g. Hotel in Ouarzazate" />
                    </div>
                    <div className="space-y-2">
                      <Label>Meals</Label>
                      <div className="flex gap-3 pt-1">
                        {(["breakfast", "lunch", "dinner"] as const).map((m) => (
                          <label key={m} className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.meals?.[m] ?? false}
                              onChange={() => toggleMeal(idx, m)}
                              className="h-4 w-4 rounded"
                            />
                            <span className="capitalize">{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="space-y-2">
                    <Label>Activities</Label>
                    <div className="flex flex-wrap gap-2">
                      {day.activities?.map((act, ai) => (
                        <Badge key={ai} variant="secondary" className="gap-1">
                          {act}
                          <button onClick={() => removeActivity(idx, ai)} className="ml-1 text-stone-500 hover:text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newActivity} onChange={(e) => setNewActivity(e.target.value)} placeholder="Add activity..." className="max-w-xs" onKeyDown={(e) => e.key === "Enter" && addActivity(idx)} />
                      <Button size="sm" variant="outline" onClick={() => addActivity(idx)}>Add</Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* Tab 3: Included */}
        <TabsContent value="included" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-stone-500">Items included in this tour package. Travelers see this on the tour page.</p>
              <div className="space-y-2">
                {form.included.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <Input value={item} onChange={(e) => {
                      setForm((prev) => ({ ...prev, included: prev.included.map((i, j) => j === idx ? e.target.value : i) }));
                    }} className="flex-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setForm((prev) => ({ ...prev, included: prev.included.filter((_, j) => j !== idx) }))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newIncluded} onChange={(e) => setNewIncluded(e.target.value)} placeholder="Add included item..." className="max-w-sm" onKeyDown={(e) => {
                  if (e.key === "Enter" && newIncluded.trim()) {
                    setForm((prev) => ({ ...prev, included: [...prev.included, newIncluded.trim()] }));
                    setNewIncluded("");
                  }
                }} />
                <Button variant="outline" onClick={() => {
                  if (newIncluded.trim()) {
                    setForm((prev) => ({ ...prev, included: [...prev.included, newIncluded.trim()] }));
                    setNewIncluded("");
                  }
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Highlights */}
        <TabsContent value="highlights" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-stone-500">Key selling points of this tour. Displayed on tour cards.</p>
              <div className="flex flex-wrap gap-2">
                {form.highlights.map((h, idx) => (
                  <Badge key={idx} className="gap-1 bg-[#D4A574]/10 text-[#D4A574] hover:bg-[#D4A574]/20">
                    {h}
                    <button onClick={() => setForm((prev) => ({ ...prev, highlights: prev.highlights.filter((_, j) => j !== idx) }))}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newHighlight} onChange={(e) => setNewHighlight(e.target.value)} placeholder="e.g. Camel trek at sunset" className="max-w-sm" onKeyDown={(e) => {
                  if (e.key === "Enter" && newHighlight.trim()) {
                    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, newHighlight.trim()] }));
                    setNewHighlight("");
                  }
                }} />
                <Button variant="outline" onClick={() => {
                  if (newHighlight.trim()) {
                    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, newHighlight.trim()] }));
                    setNewHighlight("");
                  }
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: SEO */}
        <TabsContent value="seo" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input value={`${form.days} Day ${form.title} from ${form.fromCity} | 2026 | Best Travel Morocco`} readOnly className="bg-stone-50" />
                  <p className="text-xs text-stone-500">Auto-generated from tour info</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Description for search engines..." rows={3} />
                  <p className="text-xs text-stone-500">{(form.description ?? "").length}/300 characters</p>
                </div>
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input value={`${form.title.toLowerCase()}, morocco ${form.days <= 3 ? "desert tour" : "tour"}, ${form.fromCity.toLowerCase()} tour, morocco travel, sahara desert`} readOnly className="bg-stone-50" />
                </div>
                <div className="space-y-2">
                  <Label>Canonical URL</Label>
                  <Input value={`https://www.besttravelmorocco.com/tours/${form.id}`} readOnly className="bg-stone-50" />
                </div>
                <div className="rounded-lg bg-stone-50 p-4">
                  <Label className="mb-2 block">Schema Preview</Label>
                  <pre className="text-xs text-stone-600 overflow-auto max-h-40">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  name: `${form.title} - ${form.days} Days`,
  description: form.description,
  offers: { price: form.price, priceCurrency: "EUR" },
  aggregateRating: { ratingValue: "5.0", reviewCount: "6000" },
}, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
