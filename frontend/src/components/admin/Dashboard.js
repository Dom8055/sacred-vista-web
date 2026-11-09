import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Images,
  MapPin,
  MessageSquareText,
  NotebookPen,
  Package,
  RotateCw,
  Star,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { apiError, http, inr } from "@/lib/sv";

const STATUS_COLORS = { new: "#B68B50", contacted: "#8A9784", booked: "#14271F", archived: "#C9C4B8" };
const STATUS_LABELS = { new: "New", contacted: "Contacted", booked: "Booked", archived: "Archived" };

/** Loads inquiries, blogs and reviews for the admin dashboard and sidebar badges. */
export function useAdminData(logout) {
  const [data, setData] = useState({ inquiries: null, blogs: null, reviews: null });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const get = (url) =>
      http.get(url).then(
        (r) => (Array.isArray(r.data) ? r.data : []),
        (e) => {
          if (e?.response?.status === 401) logout();
          setError(apiError(e));
          return [];
        }
      );
    const [inquiries, blogs, reviews] = await Promise.all([
      get("/admin/inquiries"),
      get("/admin/blogs"),
      get("/admin/reviews"),
    ]);
    setData({ inquiries, blogs, reviews });
  }, [logout]);

  useEffect(() => {
    load();
  }, [load]);

  const badges = useMemo(
    () => ({
      newInquiries: (data.inquiries || []).filter((r) => r.status === "new").length,
      pendingBlogs: (data.blogs || []).filter((b) => b.status === "pending").length,
      pendingReviews: (data.reviews || []).filter((r) => r.status === "pending").length,
    }),
    [data]
  );

  return { ...data, badges, error, reload: load };
}

function StatCard({ icon: Icon, label, value, hint, accent = "bg-gold/15 text-gold", onClick }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex items-start justify-between rounded-2xl border border-char/10 bg-white p-5 text-left shadow-[0_4px_20px_rgba(20,39,31,0.04)] transition-all ${
        onClick ? "hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md" : ""
      }`}
    >
      <div>
        <p className="text-xs font-medium text-char/55">{label}</p>
        <p className="mt-2 font-serif text-3xl text-forest">{value}</p>
        {hint && <p className="mt-1 text-[11px] text-char/50">{hint}</p>}
      </div>
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" />
      </span>
    </Comp>
  );
}

function Card({ title, action, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-char/10 bg-white shadow-[0_4px_20px_rgba(20,39,31,0.04)] ${className}`}>
      <div className="flex items-center justify-between border-b border-char/10 px-5 py-4">
        <h3 className="font-serif text-lg text-forest">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ViewAll({ onClick, label = "View all" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-semibold text-gold transition-colors hover:text-forest"
    >
      {label} <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const EMPTY_LIST = [];

export default function DashboardPanel({ data, onNavigate }) {
  const { packages = [], destinations = [], segments = [], gallery = [], getPackage, getSegment } = useCatalog();
  const { inquiries, blogs, reviews, reload, error } = data;
  const loading = inquiries === null;
  const inq = inquiries || EMPTY_LIST;
  const blg = blogs || EMPTY_LIST;
  const rev = reviews || EMPTY_LIST;

  const stats = useMemo(() => {
    const by = (list, s) => list.filter((x) => x.status === s).length;
    const approvedReviews = rev.filter((r) => r.status === "approved");
    const avgRating = approvedReviews.length
      ? approvedReviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) / approvedReviews.length
      : 0;
    const booked = by(inq, "booked");
    return {
      total: inq.length,
      newLeads: by(inq, "new"),
      contacted: by(inq, "contacted"),
      booked,
      archived: by(inq, "archived"),
      conversion: inq.length ? Math.round((booked / inq.length) * 100) : 0,
      pendingBlogs: by(blg, "pending"),
      approvedBlogs: by(blg, "approved"),
      pendingReviews: by(rev, "pending"),
      approvedReviews: approvedReviews.length,
      avgRating,
    };
  }, [inq, blg, rev]);

  // Last 14 days inquiry trend
  const trend = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({ key: d.toDateString(), label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), count: 0 });
    }
    const idx = Object.fromEntries(days.map((d, i) => [d.key, i]));
    inq.forEach((r) => {
      if (!r.created_at) return;
      const k = new Date(r.created_at).toDateString();
      if (k in idx) days[idx[k]].count += 1;
    });
    return days;
  }, [inq]);

  const statusData = useMemo(
    () =>
      ["new", "contacted", "booked", "archived"]
        .map((s) => ({ key: s, name: STATUS_LABELS[s], value: inq.filter((r) => r.status === s).length }))
        .filter((d) => d.value > 0),
    [inq]
  );

  const segmentData = useMemo(() => {
    const map = {};
    inq.forEach((r) => {
      const pkg = r.package_id ? getPackage(r.package_id) : null;
      const seg = getSegment(r.segment) || (pkg?.segment_id ? getSegment(pkg.segment_id) : null);
      const label = seg?.name || seg?.label || r.segment || "General";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [inq, getPackage, getSegment]);

  const topPackages = useMemo(() => {
    const map = {};
    inq.forEach((r) => {
      const pkg = r.package_id ? getPackage(r.package_id) : null;
      const title = pkg?.title || r.package_name;
      if (!title) return;
      map[title] = map[title] || { title, count: 0, price: pkg?.price_inr };
      map[title].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [inq, getPackage]);

  const recent = inq.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 5);
  const pendingItems = [
    ...blg.filter((b) => b.status === "pending").map((b) => ({ type: "Blog", tab: "blogs", title: b.title, by: b.author, at: b.created_at })),
    ...rev.filter((r) => r.status === "pending").map((r) => ({ type: "Review", tab: "reviews", title: r.title, by: r.name, at: r.created_at, rating: r.rating })),
  ]
    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
    .slice(0, 6);

  const maxSeg = Math.max(1, ...segmentData.map((s) => s.value));

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      {/* Welcome strip */}
      <div className="grain relative overflow-hidden rounded-2xl bg-forest px-6 py-6 text-ivory sm:px-8">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Welcome back</p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl">Sacred Vista desk</h2>
            <p className="mt-1 text-sm text-ivory/65">
              {stats.newLeads > 0
                ? `You have ${stats.newLeads} new lead${stats.newLeads > 1 ? "s" : ""} and ${
                    stats.pendingBlogs + stats.pendingReviews
                  } item${stats.pendingBlogs + stats.pendingReviews === 1 ? "" : "s"} awaiting moderation.`
                : "All caught up — no new leads waiting."}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-full border border-ivory/20 px-4 py-2 text-xs font-semibold text-ivory transition-colors hover:border-gold hover:text-gold"
            >
              <RotateCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button
              type="button"
              onClick={() => onNavigate("inquiries")}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-forest transition-colors hover:bg-gold/90"
            >
              Open inquiries <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={MessageSquareText} label="Total inquiries" value={loading ? "…" : stats.total} hint={`${stats.contacted} contacted · ${stats.archived} archived`} onClick={() => onNavigate("inquiries")} />
        <StatCard icon={UserPlus} label="New leads" value={loading ? "…" : stats.newLeads} hint="Awaiting first response" accent="bg-amber-100 text-amber-700" onClick={() => onNavigate("inquiries")} />
        <StatCard icon={CheckCircle2} label="Booked" value={loading ? "…" : stats.booked} hint={`${stats.conversion}% conversion rate`} accent="bg-emerald-100 text-emerald-700" />
        <StatCard icon={Star} label="Avg. rating" value={stats.avgRating ? stats.avgRating.toFixed(1) : "—"} hint={`${stats.approvedReviews} published reviews`} accent="bg-yellow-100 text-yellow-700" onClick={() => onNavigate("reviews")} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card
          title="Inquiries — last 14 days"
          className="xl:col-span-2"
          action={
            <span className="inline-flex items-center gap-1 text-xs text-char/55">
              <TrendingUp className="h-3.5 w-3.5 text-gold" />
              {trend.reduce((a, d) => a + d.count, 0)} in period
            </span>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inqFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B68B50" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#B68B50" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DA" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#222A2599" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#222A2599" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E8E4DA", fontSize: 12 }} formatter={(v) => [v, "Inquiries"]} />
                <Area type="monotone" dataKey="count" stroke="#B68B50" strokeWidth={2.5} fill="url(#inqFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Lead status">
          {statusData.length === 0 ? (
            <p className="py-16 text-center text-sm text-char/50">No inquiries yet.</p>
          ) : (
            <>
              <div className="relative h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
                      {statusData.map((d) => (
                        <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E8E4DA", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-serif text-2xl text-forest">{stats.total}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-char/50">Total</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {["new", "contacted", "booked", "archived"].map((s) => {
                  const v = inq.filter((r) => r.status === s).length;
                  return (
                    <li key={s} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-char/75">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s] }} />
                        {STATUS_LABELS[s]}
                      </span>
                      <span className="font-medium text-forest">
                        {v}
                        <span className="ml-1.5 text-xs text-char/45">{stats.total ? Math.round((v / stats.total) * 100) : 0}%</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Card>
      </div>

      {/* Recent inquiries + moderation */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Recent inquiries" className="xl:col-span-2" action={<ViewAll onClick={() => onNavigate("inquiries")} />}>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-char/50">{loading ? "Loading…" : "No inquiries yet."}</p>
          ) : (
            <div className="-mx-5 -my-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-char/10 text-[10px] font-bold uppercase tracking-[0.16em] text-char/50">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Package</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => {
                    const pkg = r.package_id ? getPackage(r.package_id) : null;
                    return (
                      <tr key={r.id} className="border-b border-char/[0.06] last:border-0 hover:bg-ivory/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-semibold uppercase text-gold">
                              {(r.name || "?").charAt(0)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-forest">{r.name}</p>
                              <p className="truncate text-xs text-char/55">{r.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[200px] truncate px-5 py-3 text-char/75">{pkg?.title || r.package_name || "Custom journey"}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-char/60">{fmtDate(r.created_at)}</td>
                        <td className="px-5 py-3">
                          <span
                            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: `${STATUS_COLORS[r.status] || STATUS_COLORS.new}26`,
                              color: r.status === "archived" ? "#222A25" : STATUS_COLORS[r.status] || STATUS_COLORS.new,
                            }}
                          >
                            {STATUS_LABELS[r.status] || r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Awaiting moderation" action={<span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold">{stats.pendingBlogs + stats.pendingReviews}</span>}>
          {pendingItems.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600/70" />
              <p className="mt-2 text-sm text-char/55">Nothing pending. Nice work!</p>
            </div>
          ) : (
            <ul className="-my-2 divide-y divide-char/[0.07]">
              {pendingItems.map((p, i) => (
                <li key={`${p.type}-${i}`}>
                  <button type="button" onClick={() => onNavigate(p.tab)} className="flex w-full items-start gap-3 py-3 text-left">
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${p.type === "Blog" ? "bg-sage/20 text-forest" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.type === "Blog" ? <NotebookPen className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-forest">{p.title}</span>
                      <span className="block truncate text-xs text-char/55">
                        {p.type} by {p.by}
                        {p.rating ? ` · ${p.rating}★` : ""} · {fmtDate(p.at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Segments + top packages + catalog */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Inquiries by segment">
          {segmentData.length === 0 ? (
            <p className="py-8 text-center text-sm text-char/50">No data yet.</p>
          ) : (
            <ul className="space-y-3.5">
              {segmentData.map((s) => (
                <li key={s.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-char/75">{s.name}</span>
                    <span className="font-medium text-forest">{s.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-gradient-to-r from-forest to-gold" style={{ width: `${(s.value / maxSeg) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Most requested packages" action={<ViewAll onClick={() => onNavigate("packages")} label="Manage" />}>
          {topPackages.length === 0 ? (
            <p className="py-8 text-center text-sm text-char/50">No package-specific inquiries yet.</p>
          ) : (
            <ol className="space-y-3">
              {topPackages.map((p, i) => (
                <li key={p.title} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mist font-mono text-xs font-semibold text-forest">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-forest">{p.title}</span>
                    {p.price ? <span className="block text-xs text-char/50">{inr(p.price)}</span> : null}
                  </span>
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold">{p.count}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card title="Catalog">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Package, label: "Packages", value: packages.length, tab: "packages" },
              { icon: MapPin, label: "Destinations", value: destinations.length, tab: "destinations" },
              { icon: Compass, label: "Segments", value: segments.length },
              { icon: Images, label: "Gallery images", value: gallery.length },
              { icon: NotebookPen, label: "Published blogs", value: stats.approvedBlogs, tab: "blogs" },
              { icon: Star, label: "Published reviews", value: stats.approvedReviews, tab: "reviews" },
            ].map((c) => {
              const Icon = c.icon;
              const Comp = c.tab ? "button" : "div";
              return (
                <Comp
                  key={c.label}
                  type={c.tab ? "button" : undefined}
                  onClick={c.tab ? () => onNavigate(c.tab) : undefined}
                  className={`rounded-xl border border-char/10 bg-ivory/50 p-3.5 text-left ${c.tab ? "transition-colors hover:border-gold/50" : ""}`}
                >
                  <Icon className="h-4 w-4 text-gold" />
                  <p className="mt-2 font-serif text-2xl text-forest">{c.value}</p>
                  <p className="text-[11px] text-char/55">{c.label}</p>
                </Comp>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
