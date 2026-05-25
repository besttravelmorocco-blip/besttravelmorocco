import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  FileText,
  Mail,
  Star,
  Image,
  TrendingUp,
  ArrowRight,
  Eye,
  Globe,
  Users,
  BarChart3,
  Database,
  CheckCircle,
  Loader2,
} from "lucide-react";

const statsConfig = [
  { label: "Total Tours", key: "tours", icon: Map, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Published", key: "publishedTours", icon: Eye, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Blog Posts", key: "blogPosts", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Total Inquiries", key: "totalInquiries", icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "New Inquiries", key: "newInquiries", icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" },
  { label: "Testimonials", key: "testimonials", icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  { label: "Media Files", key: "mediaFiles", icon: Image, color: "text-cyan-600", bg: "bg-cyan-50" },
  { label: "SEO Score", key: "seoScore", icon: BarChart3, color: "text-green-600", bg: "bg-green-50" },
];

export default function Dashboard() {
  const statsQuery = trpc.dashboard.stats.useQuery();
  const recentInquiriesQuery = trpc.dashboard.recentInquiries.useQuery();
  const topToursQuery = trpc.dashboard.topTours.useQuery();
  const seedStatusQuery = trpc.seed.status.useQuery();
  const utils = trpc.useContext();
  const seedMutation = trpc.seed.run.useMutation({
    onSuccess: () => {
      utils.seed.status.invalidate();
      utils.dashboard.stats.invalidate();
      utils.tours.list.invalidate();
    },
  });

  const stats = statsQuery.data ?? {};
  const inquiries = recentInquiriesQuery.data ?? [];
  const tours = topToursQuery.data ?? [];
  const seedStatus = seedStatusQuery.data;

  // Compute SEO score mock
  const seoScore = 94;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Dashboard Overview</h2>
          <p className="mt-1 text-stone-500">Welcome to your Best Travel Morocco admin panel</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin/tours/new">
              <Map className="h-4 w-4" /> Add Tour
            </Link>
          </Button>
          <Button asChild className="gap-2 bg-[#D4A574] hover:bg-[#c49668]">
            <Link to="/admin/blog/new">
              <FileText className="h-4 w-4" /> Add Blog Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.slice(0, 4).map((stat) => (
          <Card key={stat.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-2xl font-bold text-stone-900">
                  {(stats as any)[stat.key] ?? 0}
                </span>
              </div>
              <p className="mt-3 text-sm text-stone-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.slice(4, 8).map((stat) => (
          <Card key={stat.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-2xl font-bold text-stone-900">
                  {stat.key === "seoScore" ? seoScore : (stats as any)[stat.key] ?? 0}
                  {stat.key === "seoScore" && <span className="text-sm text-stone-400">/100</span>}
                </span>
              </div>
              <p className="mt-3 text-sm text-stone-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seed Database Card - Always show if no tours detected */}
      {(!seedStatus || seedStatus.needsSeeding) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg p-2.5 bg-amber-100 shrink-0">
                  <Database className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Database Setup Required</p>
                  <p className="text-sm text-stone-600">
                    {seedStatus ? `${seedStatus.toursCount} tours in database.` : "No database connection detected."} Click below to add all 27 tours from your website.
                  </p>
                </div>
              </div>
              <Button
                className="gap-2 bg-[#D4A574] hover:bg-[#c49668] shrink-0"
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
              >
                {seedMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Seeding...</>
                ) : seedMutation.isSuccess ? (
                  <><CheckCircle className="h-4 w-4" /> Done!</>
                ) : (
                  <><Database className="h-4 w-4" /> Seed Database</>
                )}
              </Button>
            </div>
            {seedMutation.isSuccess && (
              <p className="mt-3 text-sm text-emerald-600">
                Successfully seeded {seedMutation.data?.seeded} tours, updated {seedMutation.data?.updated} tours!
              </p>
            )}
            {seedMutation.isError && (
              <p className="mt-3 text-sm text-red-600">
                Error: {seedMutation.error?.message || "Unknown error"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {seedStatus && !seedStatus.needsSeeding && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-lg p-2.5 bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-stone-900">Database Ready</p>
                <p className="text-sm text-stone-600">
                  All {seedStatus.toursCount} tours are loaded in the database.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column: Recent Inquiries + Top Tours */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-stone-500" />
              Recent Inquiries
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-[#D4A574]">
              <Link to="/admin/inquiries">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {inquiries.length === 0 ? (
              <div className="py-8 text-center text-stone-400">
                <Mail className="mx-auto h-10 w-10 mb-2 opacity-30" />
                <p>No inquiries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="flex items-center justify-between rounded-lg border border-stone-100 p-3 hover:bg-stone-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{inq.name}</p>
                      <p className="text-xs text-stone-500 truncate">{inq.email} — {inq.tourName ?? "General inquiry"}</p>
                    </div>
                    <Badge
                      variant={inq.status === "new" ? "destructive" : "secondary"}
                      className="shrink-0 text-xs"
                    >
                      {inq.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Tours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Map className="h-5 w-5 text-stone-500" />
              Top Tours
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-[#D4A574]">
              <Link to="/admin/tours">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {tours.length === 0 ? (
              <div className="py-8 text-center text-stone-400">
                <Map className="mx-auto h-10 w-10 mb-2 opacity-30" />
                <p>No tours added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tours.slice(0, 5).map((tour, i) => (
                  <div
                    key={tour.id}
                    className="flex items-center gap-3 rounded-lg border border-stone-100 p-3 hover:bg-stone-50 transition-colors"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D4A574]/10 text-xs font-bold text-[#D4A574]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-stone-900 truncate">{tour.title}</p>
                      <p className="text-xs text-stone-500">{tour.days} days — {tour.fromCity} to {tour.toCity}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">{tour.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-stone-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/tours/new">
                <Map className="h-4 w-4" /> Add New Tour
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/blog/new">
                <FileText className="h-4 w-4" /> Add Blog Post
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/media">
                <Image className="h-4 w-4" /> Upload Media
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/inquiries">
                <Mail className="h-4 w-4" /> View Inquiries
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/settings">
                <Users className="h-4 w-4" /> Site Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
