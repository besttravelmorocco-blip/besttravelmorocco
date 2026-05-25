import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, CheckCircle, Clock, AlertCircle, Trash2, Eye } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Mail }> = {
  new: { label: "New", color: "bg-red-100 text-red-700", icon: AlertCircle },
  contacted: { label: "Contacted", color: "bg-amber-100 text-amber-700", icon: Clock },
  quoted: { label: "Quote Sent", color: "bg-blue-100 text-blue-700", icon: Mail },
  confirmed: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-stone-100 text-stone-600", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-stone-100 text-stone-500", icon: Trash2 },
};

export default function InquiriesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const inquiriesQuery = trpc.inquiries.list.useQuery();
  const utils = trpc.useContext();
  const updateMutation = trpc.inquiries.updateStatus.useMutation({
    onSuccess: () => {
      utils.inquiries.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
  });
  const deleteMutation = trpc.inquiries.delete.useMutation({
    onSuccess: () => {
      utils.inquiries.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
  });

  const inquiries = inquiriesQuery.data ?? [];
  const filtered = statusFilter ? inquiries.filter((i) => i.status === statusFilter) : inquiries;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Inquiries & Bookings</h2>
          <p className="mt-1 text-stone-500">Manage customer inquiries and booking requests</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {["", "new", "contacted", "quoted", "confirmed", "completed", "cancelled"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className={statusFilter === s ? "bg-[#D4A574] hover:bg-[#c49668]" : ""}
          >
            {s ? statusConfig[s]?.label ?? s : "All"}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-stone-50">
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Tour</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-stone-400">
                      <Mail className="mx-auto h-10 w-10 mb-2 opacity-30" />
                      <p>No inquiries found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inq) => {
                    const config = statusConfig[inq.status] ?? statusConfig.new;
                    return (
                      <tr key={inq.id} className="border-b last:border-0 hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-stone-900">{inq.name}</p>
                          <p className="text-xs text-stone-500">{inq.email}</p>
                          {inq.phone && <p className="text-xs text-stone-500">{inq.phone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-stone-700">{inq.tourName ?? "General inquiry"}</p>
                          {inq.travelers && <p className="text-xs text-stone-500">{inq.travelers} travelers</p>}
                        </td>
                        <td className="px-4 py-3 text-stone-600">
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${config.color} text-xs`}>{config.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="View details">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>Inquiry #{inq.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-stone-500">Name:</span> {inq.name}</div>
                                    <div><span className="text-stone-500">Email:</span> {inq.email}</div>
                                    {inq.phone && <div><span className="text-stone-500">Phone:</span> {inq.phone}</div>}
                                    <div><span className="text-stone-500">Status:</span> <Badge className={config.color}>{config.label}</Badge></div>
                                    <div><span className="text-stone-500">Date:</span> {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "—"}</div>
                                  </div>
                                  {inq.message && (
                                    <div>
                                      <span className="text-stone-500 text-sm">Message:</span>
                                      <p className="mt-1 text-sm text-stone-700 bg-stone-50 rounded p-3">{inq.message}</p>
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    {inq.status !== "contacted" && (
                                      <Button size="sm" onClick={() => updateMutation.mutate({ id: inq.id, status: "contacted" })}>Mark Contacted</Button>
                                    )}
                                    {inq.status !== "confirmed" && (
                                      <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: inq.id, status: "confirmed" })}>Confirm</Button>
                                    )}
                                    {inq.status !== "cancelled" && (
                                      <Button size="sm" variant="outline" className="text-red-500" onClick={() => updateMutation.mutate({ id: inq.id, status: "cancelled" })}>Cancel</Button>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => { if (confirm("Delete this inquiry?")) deleteMutation.mutate({ id: inq.id }); }}
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
    </div>
  );
}
