import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BookOpen,
  Mail,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  Map,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  paid: "#10B981",
  completed: "#6B7280",
  cancelled: "#EF4444",
  refunded: "#8B5CF6",
  new: "#EF4444",
  contacted: "#F59E0B",
  quoted: "#3B82F6",
};

const PIE_COLORS = ["#C8962C", "#3B82F6", "#10B981", "#F59E0B", "#6B7280", "#8B5CF6"];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "stone",
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const bgMap: Record<string, string> = {
    amber: "bg-amber-50",
    blue: "bg-blue-50",
    emerald: "bg-emerald-50",
    red: "bg-red-50",
    stone: "bg-stone-50",
  };
  const iconMap: Record<string, string> = {
    amber: "text-amber-600",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
    stone: "text-stone-500",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bgMap[color] ?? bgMap.stone}`}>
          <Icon className={`h-6 w-6 ${iconMap[color] ?? iconMap.stone}`} />
        </div>
        <div>
          <p className="text-xs text-stone-500">{label}</p>
          <p className="text-2xl font-bold text-stone-900">{value}</p>
          {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const overviewQuery = trpc.analytics.overview.useQuery({ days });
  const data = overviewQuery.data;

  const bookingStatusData = data?.bookings.breakdown.map((b) => ({
    name: b.status,
    value: b.count,
  })) ?? [];

  const inquiryStatusData = data?.inquiries.breakdown.map((i) => ({
    name: i.status,
    value: i.count,
  })) ?? [];

  const topToursData = data?.topTours.map((t) => ({
    name: (t.tourName ?? "Unknown").replace(/^(\w{12}).*/, "$1…"),
    bookings: t.count,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Analytics</h2>
          <p className="mt-1 text-stone-500">Performance overview and booking trends</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              className={days === d ? "bg-[#D4A574] hover:bg-[#c49668]" : ""}
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Total Bookings"
          value={data?.bookings.total ?? "—"}
          sub={`${data?.bookings.confirmed ?? 0} confirmed`}
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          label="Paid Revenue"
          value={data ? `$${data.revenue.total.toLocaleString()}` : "—"}
          color="emerald"
        />
        <StatCard
          icon={Mail}
          label="Total Inquiries"
          value={data?.inquiries.total ?? "—"}
          sub={`${data?.inquiries.new ?? 0} new`}
          color="amber"
        />
        <StatCard
          icon={CheckCircle}
          label="Conversion"
          value={
            data && data.inquiries.total > 0
              ? `${Math.round((data.bookings.confirmed / data.inquiries.total) * 100)}%`
              : "—"
          }
          sub="inquiries → confirmed"
          color="stone"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Tours Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="h-4 w-4" /> Top Booked Tours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topToursData.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">No booking data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topToursData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="bookings" fill="#C8962C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Inquiry Breakdown Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" /> Inquiry Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inquiryStatusData.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">No inquiry data yet</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie
                      data={inquiryStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={35}
                    >
                      {inquiryStatusData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name] ?? PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e5e7eb" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {inquiryStatusData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{
                            background:
                              STATUS_COLORS[entry.name] ?? PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="capitalize text-stone-600">{entry.name}</span>
                      </div>
                      <span className="font-medium text-stone-900">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(data?.recentBookings.length ?? 0) === 0 ? (
            <div className="py-8 text-center text-stone-400 text-sm">No recent bookings</div>
          ) : (
            <div className="divide-y">
              {data?.recentBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100">
                    <Users className="h-4 w-4 text-stone-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {b.customerName}
                    </p>
                    <p className="text-xs text-stone-500 truncate">{b.tourName ?? "—"}</p>
                  </div>
                  <div className="text-right">
                    {b.totalPrice && (
                      <p className="text-sm font-semibold text-stone-900">
                        ${b.totalPrice.toLocaleString()}
                      </p>
                    )}
                    <Badge
                      className={`text-xs mt-0.5 ${
                        b.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {b.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-400 w-20 text-right">
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
