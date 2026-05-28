import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Plus,
  Trash2,
  Users,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-emerald-100 text-emerald-700" },
  filling: { label: "Filling", color: "bg-amber-100 text-amber-700" },
  full: { label: "Full", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", color: "bg-stone-100 text-stone-500" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700" },
};

const generateSchema = z.object({
  tourName: z.string().min(1, "Tour name required"),
  count: z.coerce.number().min(1).max(52).default(12),
  startWeeks: z.coerce.number().min(0).default(0),
  maxSeats: z.coerce.number().min(1).default(16),
  pricePerPerson: z.coerce.number().optional(),
});

type GenerateForm = z.infer<typeof generateSchema>;

function SeatBar({ booked, max }: { booked: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((booked / max) * 100)) : 0;
  const color =
    pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-stone-200">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-stone-500 w-12 text-right">
        {booked}/{max}
      </span>
    </div>
  );
}

export default function StudentTripsPage() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editSeats, setEditSeats] = useState<number>(0);

  const utils = trpc.useContext();

  const listQuery = trpc.departures.list.useQuery({ upcomingOnly: false });

  const generateMutation = trpc.departures.generateForTour.useMutation({
    onSuccess: () => {
      utils.departures.list.invalidate();
      setGenerateOpen(false);
      form.reset();
    },
  });

  const updateMutation = trpc.departures.updateSeats.useMutation({
    onSuccess: () => {
      utils.departures.list.invalidate();
      setEditId(null);
    },
  });

  const deleteMutation = trpc.departures.delete.useMutation({
    onSuccess: () => utils.departures.list.invalidate(),
  });

  const form = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
    defaultValues: { count: 12, startWeeks: 0, maxSeats: 16 },
  });

  const departures = listQuery.data ?? [];

  // Group by month
  const byMonth = departures.reduce<Record<string, typeof departures>>((acc, d) => {
    const month = d.departureDate.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(d);
    return acc;
  }, {});

  const months = Object.keys(byMonth).sort().reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Student Departures</h2>
          <p className="mt-1 text-stone-500">
            Thursday–Sunday group departures for student packages
          </p>
        </div>
        <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4A574] hover:bg-[#c49668]">
              <RefreshCw className="mr-2 h-4 w-4" /> Generate Departures
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Weekly Departures</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-stone-500">
              Auto-generates Thursday → Sunday dates recurring every week.
            </p>
            <form
              onSubmit={form.handleSubmit((data) =>
                generateMutation.mutate({ ...data, tourId: "student-5day" })
              )}
              className="space-y-4 pt-2"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Tour Name *</label>
                <Input
                  {...form.register("tourName")}
                  placeholder="5-Day Marrakech Sahara Student"
                />
                {form.formState.errors.tourName && (
                  <p className="text-xs text-red-500">{form.formState.errors.tourName.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    Number of weeks
                  </label>
                  <Input {...form.register("count")} type="number" min={1} max={52} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    Start in (weeks)
                  </label>
                  <Input {...form.register("startWeeks")} type="number" min={0} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Max seats</label>
                  <Input {...form.register("maxSeats")} type="number" min={1} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    Price/person ($)
                  </label>
                  <Input {...form.register("pricePerPerson")} type="number" placeholder="350" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGenerateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#D4A574] hover:bg-[#c49668]"
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? "Generating..." : "Generate"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {departures.length === 0 && !listQuery.isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-stone-400">
            <CalendarDays className="mx-auto h-10 w-10 mb-2 opacity-30" />
            <p className="mb-4">No departures yet</p>
            <Button
              className="bg-[#D4A574] hover:bg-[#c49668]"
              onClick={() => setGenerateOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Generate first batch
            </Button>
          </CardContent>
        </Card>
      ) : (
        months.map((month) => {
          const label = format(parseISO(month + "-01"), "MMMM yyyy");
          return (
            <Card key={month}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-stone-700">
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-stone-50">
                        <th className="px-4 py-2 text-left font-medium text-stone-500">Tour</th>
                        <th className="px-4 py-2 text-left font-medium text-stone-500">Dates</th>
                        <th className="px-4 py-2 text-left font-medium text-stone-500">Seats</th>
                        <th className="px-4 py-2 text-left font-medium text-stone-500">Price</th>
                        <th className="px-4 py-2 text-left font-medium text-stone-500">Status</th>
                        <th className="px-4 py-2 text-right font-medium text-stone-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byMonth[month].map((dep) => {
                        const sc = statusConfig[dep.status] ?? statusConfig.open;
                        const isEditing = editId === dep.id;
                        return (
                          <tr
                            key={dep.id}
                            className="border-b last:border-0 hover:bg-stone-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-stone-800">
                              {dep.tourName}
                            </td>
                            <td className="px-4 py-3 text-stone-600">
                              <p>{dep.departureDate}</p>
                              <p className="text-xs text-stone-400">→ {dep.returnDate}</p>
                            </td>
                            <td className="px-4 py-3 w-40">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setEditSeats(Math.max(0, editSeats - 1))}
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">{editSeats}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      setEditSeats(Math.min(dep.maxSeats, editSeats + 1))
                                    }
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-6 text-xs bg-[#D4A574] hover:bg-[#c49668]"
                                    onClick={() =>
                                      updateMutation.mutate({
                                        id: dep.id,
                                        bookedSeats: editSeats,
                                        status:
                                          editSeats >= dep.maxSeats
                                            ? "full"
                                            : editSeats >= dep.maxSeats * 0.7
                                            ? "filling"
                                            : "open",
                                      })
                                    }
                                  >
                                    Save
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  className="w-full text-left"
                                  onClick={() => {
                                    setEditId(dep.id);
                                    setEditSeats(dep.bookedSeats);
                                  }}
                                >
                                  <SeatBar
                                    booked={dep.bookedSeats}
                                    max={dep.maxSeats}
                                  />
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-stone-600">
                              {dep.pricePerPerson ? `$${dep.pricePerPerson}` : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`${sc.color} text-xs`}>{sc.label}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600"
                                  onClick={() => {
                                    if (confirm("Delete this departure?"))
                                      deleteMutation.mutate({ id: dep.id });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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
    </div>
  );
}
