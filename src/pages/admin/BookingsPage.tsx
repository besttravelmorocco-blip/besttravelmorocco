import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Completed", color: "bg-stone-100 text-stone-600" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600" },
  refunded: { label: "Refunded", color: "bg-purple-100 text-purple-700" },
};

const paymentConfig: Record<string, { label: string; color: string }> = {
  unpaid: { label: "Unpaid", color: "bg-red-50 text-red-600" },
  partial: { label: "Partial", color: "bg-amber-50 text-amber-600" },
  paid: { label: "Paid", color: "bg-emerald-50 text-emerald-700" },
  refunded: { label: "Refunded", color: "bg-purple-50 text-purple-700" },
};

const createSchema = z.object({
  customerName: z.string().min(1, "Name required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().optional(),
  customerCountry: z.string().optional(),
  tourName: z.string().optional(),
  departureDate: z.string().optional(),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  accommodation: z.enum(["shared", "private", "luxury"]).default("shared"),
  totalPrice: z.coerce.number().optional(),
  notes: z.string().optional(),
  source: z.string().default("admin"),
});

type CreateForm = z.infer<typeof createSchema>;

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);

  const utils = trpc.useContext();

  const listQuery = trpc.bookings.list.useQuery({
    status: (statusFilter as Parameters<typeof trpc.bookings.list.useQuery>[0]["status"]) || undefined,
    search: search || undefined,
  });

  const statsQuery = trpc.bookings.stats.useQuery();

  const createMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.bookings.stats.invalidate();
      setCreateOpen(false);
      form.reset();
    },
  });

  const updateMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.bookings.stats.invalidate();
    },
  });

  const deleteMutation = trpc.bookings.delete.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.bookings.stats.invalidate();
      setSelectedBooking(null);
    },
  });

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { adults: 1, children: 0, accommodation: "shared", source: "admin" },
  });

  const bookings = listQuery.data ?? [];
  const stats = statsQuery.data;

  const detailBooking = selectedBooking
    ? bookings.find((b) => b.id === selectedBooking) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Bookings</h2>
          <p className="mt-1 text-stone-500">Manage confirmed tour bookings</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4A574] hover:bg-[#c49668]">
              <Plus className="mr-2 h-4 w-4" /> New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Booking</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-4 pt-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Name *</label>
                  <Input {...form.register("customerName")} placeholder="Full name" />
                  {form.formState.errors.customerName && (
                    <p className="text-xs text-red-500">{form.formState.errors.customerName.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Email *</label>
                  <Input {...form.register("customerEmail")} placeholder="email@example.com" type="email" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Phone</label>
                  <Input {...form.register("customerPhone")} placeholder="+1 234 567 890" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Country</label>
                  <Input {...form.register("customerCountry")} placeholder="USA" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-medium text-stone-600">Tour Name</label>
                  <Input {...form.register("tourName")} placeholder="Tour name" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Departure Date</label>
                  <Input {...form.register("departureDate")} type="date" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Accommodation</label>
                  <Select
                    defaultValue="shared"
                    onValueChange={(v) => form.setValue("accommodation", v as "shared" | "private" | "luxury")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shared">Shared</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Adults</label>
                  <Input {...form.register("adults")} type="number" min={1} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Children</label>
                  <Input {...form.register("children")} type="number" min={0} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Total Price (USD)</label>
                  <Input {...form.register("totalPrice")} type="number" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Source</label>
                  <Input {...form.register("source")} placeholder="website / phone / email" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-medium text-stone-600">Notes</label>
                  <Input {...form.register("notes")} placeholder="Special requests..." />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#D4A574] hover:bg-[#c49668]"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Booking"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Total Bookings</p>
              <p className="text-xl font-bold text-stone-900">{stats?.total ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Confirmed</p>
              <p className="text-xl font-bold text-stone-900">{stats?.confirmed ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Revenue (Paid)</p>
              <p className="text-xl font-bold text-stone-900">
                {stats ? `$${stats.revenue.toLocaleString()}` : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            className="pl-9"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["", "pending", "confirmed", "paid", "completed", "cancelled"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? "bg-[#D4A574] hover:bg-[#c49668]" : ""}
            >
              {s ? statusConfig[s]?.label : "All"}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-stone-50">
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Ref</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Tour</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Travelers</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Payment</th>
                  <th className="px-4 py-3 text-right font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-stone-400">
                      <BookOpen className="mx-auto h-10 w-10 mb-2 opacity-30" />
                      <p>No bookings found</p>
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const sc = statusConfig[b.status] ?? statusConfig.pending;
                    const pc = paymentConfig[b.paymentStatus ?? "unpaid"] ?? paymentConfig.unpaid;
                    return (
                      <tr
                        key={b.id}
                        className="border-b last:border-0 hover:bg-stone-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedBooking(b.id)}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-stone-500">{b.reference}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-stone-900">{b.customerName}</p>
                          <p className="text-xs text-stone-500">{b.customerEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-stone-700">{b.tourName ?? "—"}</p>
                          {b.departureDate && (
                            <p className="text-xs text-stone-500">{b.departureDate}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-stone-600">
                            <Users className="h-3 w-3" />
                            <span>{b.adults}A{b.children ? ` + ${b.children}C` : ""}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-stone-700">
                          {b.totalPrice ? `$${b.totalPrice.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${sc.color} text-xs`}>{sc.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${pc.color} text-xs`}>{pc.label}</Badge>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSelectedBooking(b.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => {
                                if (confirm("Delete this booking?"))
                                  deleteMutation.mutate({ id: b.id });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailBooking} onOpenChange={() => setSelectedBooking(null)}>
        {detailBooking && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Booking{" "}
                <span className="font-mono text-sm text-stone-500">{detailBooking.reference}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-stone-500">Name:</span> {detailBooking.customerName}</div>
                <div><span className="text-stone-500">Email:</span> {detailBooking.customerEmail}</div>
                {detailBooking.customerPhone && (
                  <div><span className="text-stone-500">Phone:</span> {detailBooking.customerPhone}</div>
                )}
                {detailBooking.customerCountry && (
                  <div><span className="text-stone-500">Country:</span> {detailBooking.customerCountry}</div>
                )}
                <div>
                  <span className="text-stone-500">Status: </span>
                  <Badge className={`${statusConfig[detailBooking.status]?.color} text-xs`}>
                    {statusConfig[detailBooking.status]?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-stone-500">Payment: </span>
                  <Badge className={`${paymentConfig[detailBooking.paymentStatus ?? "unpaid"]?.color} text-xs`}>
                    {paymentConfig[detailBooking.paymentStatus ?? "unpaid"]?.label}
                  </Badge>
                </div>
                {detailBooking.tourName && (
                  <div className="col-span-2"><span className="text-stone-500">Tour:</span> {detailBooking.tourName}</div>
                )}
                {detailBooking.departureDate && (
                  <div><span className="text-stone-500">Departure:</span> {detailBooking.departureDate}</div>
                )}
                <div>
                  <span className="text-stone-500">Travelers:</span>{" "}
                  {detailBooking.adults} adults{detailBooking.children ? `, ${detailBooking.children} children` : ""}
                </div>
                <div>
                  <span className="text-stone-500">Accommodation:</span> {detailBooking.accommodation}
                </div>
                {detailBooking.totalPrice && (
                  <div>
                    <span className="text-stone-500">Total:</span> ${detailBooking.totalPrice.toLocaleString()}
                  </div>
                )}
                {detailBooking.source && (
                  <div><span className="text-stone-500">Source:</span> {detailBooking.source}</div>
                )}
              </div>
              {detailBooking.notes && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Notes</p>
                  <p className="text-sm bg-stone-50 rounded p-3">{detailBooking.notes}</p>
                </div>
              )}
              <div className="border-t pt-3">
                <p className="text-xs text-stone-500 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {(["confirmed", "paid", "completed", "cancelled"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={detailBooking.status === s ? "default" : "outline"}
                      className={detailBooking.status === s ? "bg-[#D4A574]" : ""}
                      onClick={() =>
                        updateMutation.mutate({ id: detailBooking.id, status: s })
                      }
                    >
                      {statusConfig[s].label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-stone-500 mt-3 mb-2">Mark Payment</p>
                <div className="flex flex-wrap gap-2">
                  {(["unpaid", "partial", "paid"] as const).map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={detailBooking.paymentStatus === p ? "default" : "outline"}
                      className={detailBooking.paymentStatus === p ? "bg-[#D4A574]" : ""}
                      onClick={() =>
                        updateMutation.mutate({ id: detailBooking.id, paymentStatus: p })
                      }
                    >
                      <CreditCard className="mr-1 h-3 w-3" />
                      {paymentConfig[p].label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
