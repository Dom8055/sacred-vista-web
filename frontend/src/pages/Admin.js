import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  ArrowUpRight,
  Calendar,
  Check,
  Compass,
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  MoreHorizontal,
  Package,
  Pencil,
  Phone,
  Plus,
  RotateCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useCatalog } from "@/context/CatalogContext";
import { useSeo } from "@/hooks/useSeo";
import { apiError, http, img, inr, nights } from "@/lib/sv";
import { Logo } from "@/components/sv/Logo";
import { Loading } from "@/components/sv/States";
import PackageEditor from "@/components/admin/PackageEditor";
import AddDestinationModal from "@/components/admin/AddDestinationModal";
import AdminLayout from "@/components/admin/AdminLayout";
import DashboardPanel, { useAdminData } from "@/components/admin/Dashboard";

const STATUSES = ["new", "contacted", "booked", "archived"];
const BADGE = { new: "bg-gold text-forest", contacted: "bg-sage text-forest", booked: "bg-forest text-ivory", archived: "bg-char/15 text-char" };
const BLOG_STATUSES = ["pending", "approved", "rejected"];
const BLOG_BADGE = {
  pending: "bg-gold/90 text-forest",
  approved: "bg-forest text-ivory",
  rejected: "bg-red-700/15 text-red-800 border border-red-700/30",
};

export function AdminLogin() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useSeo("Admin sign in");
  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      nav("/admin", { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grain relative flex min-h-screen items-center justify-center bg-forest px-5 py-32 text-ivory">
      <form onSubmit={submit} className="relative z-10 w-full max-w-md border border-ivory/15 bg-char/60 p-8 sm:p-10" data-testid="admin-login-form">
        <Logo className="h-20 w-auto mb-4" />
        <h1 className="mt-10 text-3xl">Inquiry desk</h1>
        <p className="mt-2 text-sm text-ivory/70">Private access for the Sacred Vista team.</p>
        <label htmlFor="admin-email" className="mt-8 block text-[11px] uppercase tracking-[0.22em] text-ivory/70">Email</label>
        <input id="admin-email" type="email" className="field field-dark" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="admin-email-input" />
        <label htmlFor="admin-password" className="mt-6 block text-[11px] uppercase tracking-[0.22em] text-ivory/70">Password</label>
        <input id="admin-password" type="password" className="field field-dark" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="admin-password-input" />
        {error && <p className="mt-5 text-sm text-red-300" role="alert" data-testid="admin-login-error">{error}</p>}
        <button type="submit" disabled={busy} className="btn-gold mt-8 w-full justify-center" data-testid="admin-login-submit">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}</button>
      </form>
    </section>
  );
}

const STATUS_ORDER = { new: 1, contacted: 2, booked: 3, archived: 4 };

function escapeHtml(val) {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function InquiriesPanel({ logout }) {
  const {
    packages = [],
    segments = [],
    getPackage,
    getSegment,
    getDestination,
  } = useCatalog();
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [viewingInquiry, setViewingInquiry] = useState(null);

  const load = useCallback(() => {
    setError("");
    http
      .get("/admin/inquiries")
      .then((r) => setRows(Array.isArray(r.data) ? r.data : []))
      .catch((e) => {
        if (e?.response?.status === 401) logout();
        setError(apiError(e));
        setRows([]);
      });
  }, [logout]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      await http.patch(`/admin/inquiries/${id}`, { status });
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
      setViewingInquiry((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusyId(null);
    }
  };

  // Resolve full inquiry metadata (package, segment, destination)
  const resolveInquiryMeta = useCallback(
    (r) => {
      let pkg = r.package_id ? getPackage(r.package_id) : null;
      if (!pkg && r.package_name) {
        pkg = packages.find(
          (p) => p.title?.toLowerCase() === r.package_name?.toLowerCase()
        );
      }
      // Also check if customer mentioned a package title inside their message
      if (!pkg && r.message) {
        const msgLower = r.message.toLowerCase();
        pkg = packages.find(
          (p) => p.title && msgLower.includes(p.title.toLowerCase())
        );
      }

      const segObj =
        getSegment(r.segment) ||
        (pkg?.segment_id ? getSegment(pkg.segment_id) : null);
      const segmentLabel = segObj?.name || segObj?.label || r.segment || "General";

      const destObj =
        (r.destination_id ? getDestination(r.destination_id) : null) ||
        (pkg?.destination_id ? getDestination(pkg.destination_id) : null);
      const destinationName = destObj?.name || "Flexible / To be curated";

      const packageTitle =
        pkg?.title ||
        r.package_name ||
        (destObj ? `${destObj.name} Custom Expedition` : `Custom ${segmentLabel} Journey`);

      // Matching packages for that segment if no exact package was chosen
      const segmentPackages = !pkg && (r.segment || segObj?.id)
        ? packages.filter((p) => p.segment_id === (segObj?.id || r.segment))
        : [];

      return {
        pkg,
        segObj,
        segmentLabel,
        destObj,
        destinationName,
        packageTitle,
        segmentPackages,
        isSpecificPackage: Boolean(pkg || r.package_name),
      };
    },
    [getPackage, getSegment, getDestination, packages]
  );

  // Status counts for KPI cards
  const counts = useMemo(() => {
    const list = rows || [];
    return {
      all: list.length,
      new: list.filter((r) => r.status === "new").length,
      contacted: list.filter((r) => r.status === "contacted").length,
      booked: list.filter((r) => r.status === "booked").length,
      archived: list.filter((r) => r.status === "archived").length,
    };
  }, [rows]);

  // Filtered + Sorted rows
  const processedRows = useMemo(() => {
    if (!rows) return null;
    const q = searchQuery.trim().toLowerCase();

    const filtered = rows.filter((r) => {
      const meta = resolveInquiryMeta(r);
      if (filter !== "all" && r.status !== filter) return false;
      if (segmentFilter !== "all") {
        const segId = meta.segObj?.id || r.segment || "";
        if (segId !== segmentFilter) return false;
      }
      if (packageFilter !== "all") {
        if (packageFilter === "general") {
          if (meta.isSpecificPackage) return false;
        } else if ((meta.pkg?.id || r.package_id) !== packageFilter) {
          return false;
        }
      }
      if (q) {
        const hay = [
          r.name,
          r.email,
          r.phone,
          r.message,
          r.status,
          meta.packageTitle,
          meta.segmentLabel,
          meta.destinationName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === "status") {
        const diff = (STATUS_ORDER[a.status] || 99) - (STATUS_ORDER[b.status] || 99);
        return diff !== 0
          ? diff
          : new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "package") {
        const pa = resolveInquiryMeta(a).packageTitle;
        const pb = resolveInquiryMeta(b).packageTitle;
        return pa.localeCompare(pb);
      }
      return 0;
    });
  }, [rows, filter, segmentFilter, packageFilter, sortBy, searchQuery, resolveInquiryMeta]);

  // Export to formatted Excel (.xls) workbook
  const exportToExcel = () => {
    const list = processedRows || [];
    if (list.length === 0) return;

    const statusColors = {
      new: "#D4AF37",
      contacted: "#8CA892",
      booked: "#14271F",
      archived: "#CCCCCC",
    };
    const statusTextColors = {
      new: "#14271F",
      contacted: "#14271F",
      booked: "#FAF6EE",
      archived: "#333333",
    };

    const tableRows = list
      .map((r, index) => {
        const meta = resolveInquiryMeta(r);
        const dt = r.created_at
          ? new Date(r.created_at).toLocaleString("en-IN")
          : "";
        const durationStr = meta.pkg?.duration_days
          ? nights(meta.pkg.duration_days)
          : "Custom Duration";
        const priceStr = meta.pkg?.price_inr
          ? inr(meta.pkg.price_inr)
          : "Custom Proposal";
        const bg = statusColors[r.status] || "#EEEEEE";
        const fg = statusTextColors[r.status] || "#14271F";

        return `
          <tr>
            <td style="padding:8px;border:1px solid #d1d5db;text-align:center;">${index + 1}</td>
            <td style="padding:8px;border:1px solid #d1d5db;font-weight:bold;text-transform:uppercase;background:${bg};color:${fg};text-align:center;">${escapeHtml(r.status)}</td>
            <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(dt)}</td>
            <td style="padding:8px;border:1px solid #d1d5db;font-weight:bold;">${escapeHtml(r.name)}</td>
            <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(r.email)}</td>
            <td style="padding:8px;border:1px solid #d1d5db;mso-number-format:'\\@';">${escapeHtml(r.phone)}</td>
            <td style="padding:8px;border:1px solid #d1d5db;font-weight:bold;color:#14271F;">${escapeHtml(meta.segmentLabel)}</td>
            <td style="padding:8px;border:1px solid #d1d5db;font-weight:bold;color:#8a6421;">${escapeHtml(meta.packageTitle)}</td>
            <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(meta.destinationName)}</td>
            <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(durationStr)}</td>
            <td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(priceStr)}</td>
            <td style="padding:8px;border:1px solid #d1d5db;white-space:pre-wrap;">${escapeHtml(r.message)}</td>
          </tr>
        `;
      })
      .join("");

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sacred Vista Inquiries</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head>
      <body>
        <table border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;">
          <thead>
            <tr style="background:#14271F;color:#FAF6EE;font-weight:bold;text-transform:uppercase;">
              <th style="padding:10px;border:1px solid #14271F;">Sr. No.</th>
              <th style="padding:10px;border:1px solid #14271F;">Status</th>
              <th style="padding:10px;border:1px solid #14271F;">Inquiry Date &amp; Time</th>
              <th style="padding:10px;border:1px solid #14271F;">Customer Name</th>
              <th style="padding:10px;border:1px solid #14271F;">Email Address</th>
              <th style="padding:10px;border:1px solid #14271F;">Phone / WhatsApp</th>
              <th style="padding:10px;border:1px solid #14271F;">Segment / Category</th>
              <th style="padding:10px;border:1px solid #14271F;">Package / Expedition Inquired For</th>
              <th style="padding:10px;border:1px solid #14271F;">Destination / Reserve</th>
              <th style="padding:10px;border:1px solid #14271F;">Duration</th>
              <th style="padding:10px;border:1px solid #14271F;">Indicative Price</th>
              <th style="padding:10px;border:1px solid #14271F;">Customer Journey Expectation / Message</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", excelHtml], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Sacred-Vista-Inquiries-${filter.toUpperCase()}-${dateStamp}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export to CSV (.csv)
  const exportToCsv = () => {
    const list = processedRows || [];
    if (list.length === 0) return;

    const headers = [
      "Sr. No.",
      "Status",
      "Inquiry Date & Time",
      "Customer Name",
      "Email Address",
      "Phone / WhatsApp",
      "Segment / Category",
      "Package / Expedition Inquired For",
      "Destination / Reserve",
      "Duration",
      "Indicative Price",
      "Customer Journey Expectation / Message",
    ];

    const csvEscape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const csvLines = [
      headers.map(csvEscape).join(","),
      ...list.map((r, idx) => {
        const meta = resolveInquiryMeta(r);
        const dt = r.created_at
          ? new Date(r.created_at).toLocaleString("en-IN")
          : "";
        const durationStr = meta.pkg?.duration_days
          ? nights(meta.pkg.duration_days)
          : "Custom Duration";
        const priceStr = meta.pkg?.price_inr
          ? inr(meta.pkg.price_inr)
          : "Custom Proposal";
        return [
          idx + 1,
          (r.status || "new").toUpperCase(),
          dt,
          r.name,
          r.email,
          r.phone,
          meta.segmentLabel,
          meta.packageTitle,
          meta.destinationName,
          durationStr,
          priceStr,
          r.message,
        ]
          .map(csvEscape)
          .join(",");
      }),
    ].join("\r\n");

    const blob = new Blob(["\ufeff", csvLines], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Sacred-Vista-Inquiries-${filter.toUpperCase()}-${dateStamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div data-testid="admin-inquiries-panel" className="mt-2">
      {/* ── Top Header & Export Actions ── */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow mb-2">Customer Concierge Desk</p>
          <h2 className="text-3xl sm:text-4xl text-forest">
            Expedition &amp; Package Inquiries
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-char/65">
            Track which package, travel segment, and destination each guest is inquiring for, review their journey expectations, sort leads, and export to Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportToExcel}
            disabled={!processedRows || processedRows.length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold shadow-sm transition-all hover:bg-forest/90 disabled:opacity-45"
            data-testid="admin-export-excel-btn"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel (.xls)
          </button>

          <button
            type="button"
            onClick={exportToCsv}
            disabled={!processedRows || processedRows.length === 0}
            className="inline-flex items-center gap-2 rounded-full border border-char/25 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest transition-all hover:border-gold"
            data-testid="admin-export-csv-btn"
          >
            <Download className="h-3.5 w-3.5 text-gold" />
            CSV
          </button>

          <button
            type="button"
            onClick={load}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-char/20 bg-white hover:border-gold transition-colors"
            aria-label="Refresh inquiries"
            title="Refresh inquiries"
            data-testid="admin-refresh-btn"
          >
            <RotateCw className="h-4 w-4 text-forest" />
          </button>
        </div>
      </div>

      {/* ── Status Summary KPI Cards (Clickable Filters) ── */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { key: "all", label: "Total Inquiries", count: counts.all, dot: "bg-forest" },
          { key: "new", label: "New Leads", count: counts.new, dot: "bg-gold" },
          { key: "contacted", label: "Contacted", count: counts.contacted, dot: "bg-sage" },
          { key: "booked", label: "Booked / Confirmed", count: counts.booked, dot: "bg-emerald-700" },
          { key: "archived", label: "Archived", count: counts.archived, dot: "bg-char/40" },
        ].map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-forest bg-forest text-ivory shadow-md"
                  : "border-char/15 bg-white text-char hover:border-gold"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                    active ? "text-gold" : "text-char/60"
                  }`}
                >
                  {item.label}
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
              </div>
              <p
                className={`mt-2 font-serif text-3xl font-medium ${
                  active ? "text-ivory" : "text-forest"
                }`}
              >
                {item.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Search, Filter & Sort Toolbar ── */}
      <div className="mt-6 rounded-2xl border border-char/15 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12">
          {/* Search Input */}
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-char/45" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, package, phone, email, message…"
              className="h-11 w-full rounded-full border border-char/20 bg-ivory/60 pl-10 pr-9 text-sm text-char placeholder:text-char/45 focus:border-gold focus:bg-white focus:outline-none"
              data-testid="admin-inquiry-search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-char/45 hover:text-char"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter by Status */}
          <div className="lg:col-span-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger
                className="h-11 w-full rounded-full bg-ivory/60 text-xs font-medium"
                data-testid="admin-status-filter"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    Status: {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Segment */}
          <div className="lg:col-span-2">
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger
                className="h-11 w-full rounded-full bg-ivory/60 text-xs font-medium"
                data-testid="admin-segment-filter"
              >
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All 7 Segments</SelectItem>
                {segments.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Package */}
          <div className="lg:col-span-2">
            <Select value={packageFilter} onValueChange={setPackageFilter}>
              <SelectTrigger
                className="h-11 w-full rounded-full bg-ivory/60 text-xs font-medium"
                data-testid="admin-package-filter"
              >
                <SelectValue placeholder="Package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="general">Custom / Segment Inquiry</SelectItem>
                {packages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger
                className="h-11 w-full rounded-full bg-ivory/60 text-xs font-medium"
                data-testid="admin-sort-select"
              >
                <span className="inline-flex items-center gap-1.5 truncate">
                  <ArrowUpDown className="h-3.5 w-3.5 text-gold shrink-0" />
                  <SelectValue placeholder="Sort by" />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort: Newest First</SelectItem>
                <SelectItem value="oldest">Sort: Oldest First</SelectItem>
                <SelectItem value="status">Sort: Status (New → Booked)</SelectItem>
                <SelectItem value="package">Sort: Package Name (A–Z)</SelectItem>
                <SelectItem value="name">Sort: Customer Name (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filter summary bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-char/10 pt-3 text-xs text-char/65">
          <span>
            Showing{" "}
            <strong className="text-forest">
              {processedRows ? processedRows.length : 0}
            </strong>{" "}
            of <strong className="text-forest">{counts.all}</strong> inquiries
          </span>
          {(filter !== "all" ||
            segmentFilter !== "all" ||
            packageFilter !== "all" ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSegmentFilter("all");
                setPackageFilter("all");
                setSearchQuery("");
              }}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-gold hover:text-forest"
            >
              Reset all filters ×
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {/* ── Inquiry Dossier List ── */}
      {processedRows === null ? (
        <Loading label="Loading inquiries…" />
      ) : processedRows.length === 0 ? (
        <div
          className="mt-12 rounded-2xl border border-char/15 bg-white p-12 text-center"
          data-testid="admin-empty"
        >
          <p className="font-serif text-2xl text-forest">
            No matching inquiries found.
          </p>
          <p className="mt-1 text-sm text-char/60">
            Try clearing your search or switching the status/package filters above.
          </p>
        </div>
      ) : (
        <div
          className="mt-6 overflow-x-auto rounded-2xl border border-char/15 bg-white shadow-[0_8px_30px_rgba(20,39,31,0.05)]"
          data-testid="admin-inquiry-list"
        >
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-char/10 bg-mist/60 text-[10px] font-bold uppercase tracking-[0.18em] text-char/55">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Package / Destination</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">View</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {processedRows.map((r, index) => {
                const meta = resolveInquiryMeta(r);
                const isBusy = busyId === r.id;
                const { waHref, mailHref } = inquiryLinks(r, meta);

                return (
                  <tr
                    key={r.id}
                    className="border-b border-char/10 align-middle transition-colors last:border-b-0 hover:bg-ivory/60"
                    data-testid={`admin-inquiry-${r.id}`}
                  >
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-forest px-2.5 py-0.5 font-mono text-[10px] font-semibold text-gold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-char/75">
                      {formatInquiryDate(r.created_at)}
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="truncate font-medium text-forest">{r.name}</p>
                      <p className="truncate text-xs text-char/60">{r.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-char/80">{r.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="whitespace-nowrap rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-forest">
                        {meta.segmentLabel}
                      </span>
                    </td>
                    <td className="max-w-[240px] px-4 py-3">
                      <p className="truncate text-forest">{meta.packageTitle}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-char/60">
                        <MapPin className="h-3 w-3 shrink-0 text-gold" />
                        {meta.destinationName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={r.status} onValueChange={(v) => setStatus(r.id, v)}>
                        <SelectTrigger
                          className={`h-8 w-32 rounded-full border-0 text-[11px] font-bold uppercase tracking-wider ${
                            BADGE[r.status] || BADGE.new
                          }`}
                          data-testid={`admin-status-${r.id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setViewingInquiry(r)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-char/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest transition-colors hover:border-gold hover:bg-gold/10"
                        data-testid={`admin-inquiry-view-${r.id}`}
                      >
                        <Eye className="h-3.5 w-3.5 text-gold" /> View
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            disabled={isBusy}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-char/60 transition-colors hover:bg-mist hover:text-forest"
                            title="Actions"
                            data-testid={`admin-inquiry-actions-${r.id}`}
                          >
                            {isBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onSelect={() => setViewingInquiry(r)}>
                            <Eye className="mr-2 h-4 w-4 text-gold" /> View details
                          </DropdownMenuItem>
                          {waHref && (
                            <DropdownMenuItem asChild>
                              <a href={waHref} target="_blank" rel="noreferrer">
                                <MessageCircle className="mr-2 h-4 w-4 text-gold" /> WhatsApp
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <a href={mailHref}>
                              <Mail className="mr-2 h-4 w-4 text-gold" /> Email
                            </a>
                          </DropdownMenuItem>
                          {r.phone && (
                            <DropdownMenuItem asChild>
                              <a href={`tel:${r.phone}`}>
                                <Phone className="mr-2 h-4 w-4 text-gold" /> Call
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Inquiry Detail Dialog ── */}
      <Dialog open={Boolean(viewingInquiry)} onOpenChange={(open) => !open && setViewingInquiry(null)}>
        <DialogContent
          className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-2xl border-char/15 bg-white p-0"
          data-lenis-prevent
        >
          {viewingInquiry && (
            <InquiryDetails
              r={viewingInquiry}
              meta={resolveInquiryMeta(viewingInquiry)}
              busy={busyId === viewingInquiry.id}
              onStatus={(v) => setStatus(viewingInquiry.id, v)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatInquiryDate(value) {
  return value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";
}

function inquiryLinks(r, meta) {
  const cleanPhone = (r.phone || "").replace(/\D/g, "");
  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const waText = encodeURIComponent(
    `Hello ${r.name}, greetings from Sacred Vista! We received your inquiry regarding ${meta.packageTitle} (${meta.segmentLabel}). Our travel curator would love to assist you.`
  );
  return {
    waHref: waNumber ? `https://wa.me/${waNumber}?text=${waText}` : "",
    mailHref: `mailto:${r.email}?subject=${encodeURIComponent(`Sacred Vista — Your ${meta.packageTitle} Inquiry`)}`,
  };
}

function InquiryDetails({ r, meta, busy, onStatus }) {
  const { waHref, mailHref } = inquiryLinks(r, meta);
  return (
    <div>
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-char/10 bg-mist/60 px-6 py-4 pr-12">
        <div>
          <DialogTitle className="font-serif text-2xl font-normal text-forest">{r.name}</DialogTitle>
          <DialogDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs text-char/70">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gold" />
              {formatInquiryDate(r.created_at)}
            </span>
            <span className="text-char/30">•</span>
            <span className="rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-forest">
              Segment: {meta.segmentLabel}
            </span>
          </DialogDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={r.status} onValueChange={onStatus}>
            <SelectTrigger
              className={`h-8 w-36 rounded-full border-0 text-xs font-bold uppercase tracking-wider ${BADGE[r.status] || BADGE.new}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {busy && <Loader2 className="h-4 w-4 animate-spin text-char/50" />}
        </div>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2">
        {/* Customer details */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-char/50">Customer Details</p>
          <div className="mt-3 space-y-2 text-sm text-char/80">
            <a href={`mailto:${r.email}`} className="flex items-center gap-2 transition-colors hover:text-gold">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <span className="truncate">{r.email}</span>
            </a>
            {r.phone && (
              <a href={`tel:${r.phone}`} className="flex items-center gap-2 transition-colors hover:text-gold">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <span>{r.phone}</span>
              </a>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-forest/90"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Guest
              </a>
            )}
            <a
              href={mailHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-char/20 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest transition-colors hover:border-gold"
            >
              <Mail className="h-3.5 w-3.5 text-gold" /> Email
            </a>
          </div>
        </div>

        {/* Package / destination */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-char/50">Inquired Package &amp; Destination</p>
          {meta.pkg ? (
            <div className="mt-2.5 flex items-start gap-3.5 rounded-xl border border-gold/35 bg-ivory/75 p-3.5">
              <img
                src={img(meta.pkg.image, 240)}
                alt={meta.pkg.title}
                className="h-16 w-20 shrink-0 rounded-lg bg-forest object-cover"
              />
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                  <Package className="h-3 w-3" /> Selected Package
                </span>
                <Link
                  to={`/packages/${meta.pkg.id}`}
                  className="mt-0.5 flex items-center gap-1 font-serif text-lg leading-snug text-forest transition-colors hover:text-gold"
                >
                  <span className="truncate">{meta.pkg.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-char/70">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gold" />
                    {meta.destinationName}
                  </span>
                  <span>•</span>
                  <span>{nights(meta.pkg.duration_days)}</span>
                  <span>•</span>
                  <strong className="text-forest">{inr(meta.pkg.price_inr)}</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 rounded-xl border border-char/15 bg-ivory/60 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-forest">
                <Compass className="h-4 w-4 shrink-0 text-gold" />
                <span>{meta.packageTitle}</span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-char/70">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />
                <span>Destination: {meta.destinationName}</span>
              </p>
              {meta.segmentPackages.length > 0 && (
                <div className="mt-2.5 border-t border-char/10 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-char/55">
                    Matching {meta.segmentLabel} Packages:
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {meta.segmentPackages.slice(0, 3).map((sp) => (
                      <Link
                        key={sp.id}
                        to={`/packages/${sp.id}`}
                        className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-white px-2.5 py-0.5 text-[11px] font-medium text-forest transition-colors hover:bg-gold hover:text-forest"
                      >
                        <span>{sp.title}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="md:col-span-2">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-char/50">
            <MessageSquareText className="h-3.5 w-3.5 text-gold" />
            Customer Journey Expectation
          </p>
          <div
            className="mt-2.5 whitespace-pre-line break-words rounded-xl border-l-2 border-gold bg-mist/65 p-4 text-sm leading-relaxed text-char/85"
            data-testid={`admin-message-${r.id}`}
          >
            {r.message || "No additional details provided."}
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogsPanel({ logout }) {
  const [blogs, setBlogs] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setError("");
    http
      .get("/admin/blogs", { params: filter === "all" ? {} : { status: filter } })
      .then((r) => setBlogs(Array.isArray(r.data) ? r.data : []))
      .catch((e) => {
        if (e?.response?.status === 401) logout();
        setError(apiError(e));
        setBlogs([]);
      });
  }, [filter, logout]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      await http.patch(`/admin/blogs/${id}`, { status });
      setBlogs((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusyId(null);
    }
  };

  const removeBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog submission?")) return;
    setBusyId(id);
    setError("");
    try {
      await http.delete(`/admin/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div data-testid="admin-blogs-panel">
      <div className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl text-forest">Blog Submissions</h2>
          <p className="mt-1 text-sm text-char/60">
            Review stories submitted from the website. Accepted blogs are published live on the Field Journal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-11 w-44 rounded-full" data-testid="admin-blog-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All submissions</SelectItem>
              {BLOG_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={load}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-char/20 hover:border-gold transition-colors"
            aria-label="Refresh blogs"
            data-testid="admin-blog-refresh-btn"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {blogs === null ? (
        <Loading label="Loading blog submissions…" />
      ) : blogs.length === 0 ? (
        <p className="mt-16 text-char/70" data-testid="admin-blogs-empty">
          No blog submissions found.
        </p>
      ) : (
        <div className="mt-10 divide-y divide-char/10 border-y border-char/10" data-testid="admin-blog-list">
          {blogs.map((b) => {
            const isOpen = openId === b.id;
            const isBusy = busyId === b.id;
            return (
              <div key={b.id} className="py-6" data-testid={`admin-blog-${b.id}`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left: Thumbnail + Meta */}
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-28 shrink-0 overflow-hidden border border-char/15 bg-forest">
                      <img
                        src={img(b.image, 300)}
                        alt={b.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-char/60">
                        <span
                          className={`rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                            BLOG_BADGE[b.status] || BLOG_BADGE.pending
                          }`}
                        >
                          {b.status === "approved"
                            ? "Accepted / Live"
                            : b.status === "rejected"
                            ? "Rejected"
                            : "Pending Review"}
                        </span>
                        <span>•</span>
                        <span>{b.category}</span>
                        <span>•</span>
                        <span>{b.location}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : b.id)}
                        className="mt-1.5 text-left font-serif text-xl sm:text-2xl text-forest hover:text-gold transition-colors"
                      >
                        {b.title}
                      </button>

                      <p className="mt-1 text-xs text-char/65">
                        By <strong className="text-char">{b.author}</strong> ({b.authorRole})
                        {b.email ? ` · ${b.email}` : ""} · Submitted{" "}
                        {b.created_at
                          ? new Date(b.created_at).toLocaleString("en-IN")
                          : b.date}
                      </p>
                    </div>
                  </div>

                  {/* Right: Accept / Reject / Preview / Delete Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : b.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-char/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-char/75 hover:border-forest hover:text-forest transition-colors"
                      data-testid={`admin-blog-preview-${b.id}`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {isOpen ? "Hide" : "Preview"}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy || b.status === "approved"}
                      onClick={() => updateStatus(b.id, "approved")}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                        b.status === "approved"
                          ? "bg-forest/20 text-forest/50 cursor-default"
                          : "bg-forest text-gold hover:bg-forest/90"
                      }`}
                      data-testid={`admin-blog-accept-${b.id}`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </button>

                    <button
                      type="button"
                      disabled={isBusy || b.status === "rejected"}
                      onClick={() => updateStatus(b.id, "rejected")}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                        b.status === "rejected"
                          ? "border-red-300 bg-red-50 text-red-400 cursor-default"
                          : "border-red-700/35 text-red-700 hover:bg-red-700 hover:text-ivory"
                      }`}
                      data-testid={`admin-blog-reject-${b.id}`}
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => removeBlog(b.id)}
                      className="rounded-full p-2 text-char/40 hover:text-red-600 transition-colors"
                      title="Delete blog"
                      data-testid={`admin-blog-delete-${b.id}`}
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Preview */}
                {isOpen && (
                  <div className="mt-5 border border-char/15 bg-mist p-6 space-y-4">
                    {b.subtitle && (
                      <p className="font-serif text-lg italic text-forest">
                        {b.subtitle}
                      </p>
                    )}
                    {b.quote && (
                      <blockquote className="border-l-2 border-gold bg-ivory p-4 font-serif italic text-forest">
                        “{b.quote}”
                      </blockquote>
                    )}
                    <div className="whitespace-pre-line text-sm leading-relaxed text-char/85">
                      {b.content ||
                        b.sections?.map((s) => s.body?.join("\n\n")).join("\n\n")}
                    </div>
                    {b.fieldNotes?.length > 0 && (
                      <div className="border-t border-char/10 pt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest">
                          Field Notes
                        </p>
                        <ul className="mt-2 list-disc pl-5 text-xs text-char/75 space-y-1">
                          {b.fieldNotes.map((n, i) => (
                            <li key={i}>{n}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReviewsPanel({ logout }) {
  const [reviews, setReviews] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setError("");
    http
      .get("/admin/reviews", { params: filter === "all" ? {} : { status: filter } })
      .then((r) => setReviews(Array.isArray(r.data) ? r.data : []))
      .catch((e) => {
        if (e?.response?.status === 401) logout();
        setError(apiError(e));
        setReviews([]);
      });
  }, [filter, logout]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      await http.patch(`/admin/reviews/${id}`, { status });
      setReviews((prev) =>
        prev.map((rv) => (rv.id === id ? { ...rv, status } : rv))
      );
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusyId(null);
    }
  };

  const removeReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setBusyId(id);
    setError("");
    try {
      await http.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((rv) => rv.id !== id));
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div data-testid="admin-reviews-panel">
      <div className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl text-forest">Guest Reviews</h2>
          <p className="mt-1 text-sm text-char/60">
            Moderate guest reviews submitted from the website. Approved reviews appear live on the Reviews page under their Segment &amp; Location.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-11 w-44 rounded-full" data-testid="admin-review-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All submissions</SelectItem>
              {BLOG_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={load}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-char/20 hover:border-gold transition-colors"
            aria-label="Refresh reviews"
            data-testid="admin-review-refresh-btn"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {reviews === null ? (
        <Loading label="Loading guest reviews…" />
      ) : reviews.length === 0 ? (
        <p className="mt-16 text-char/70" data-testid="admin-reviews-empty">
          No review submissions found.
        </p>
      ) : (
        <div className="mt-10 divide-y divide-char/10 border-y border-char/10" data-testid="admin-review-list">
          {reviews.map((rv) => {
            const isBusy = busyId === rv.id;
            return (
              <div key={rv.id} className="py-6" data-testid={`admin-review-${rv.id}`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left: Meta + Content */}
                  <div className="flex items-start gap-4 max-w-3xl">
                    {rv.image && (
                      <div className="h-20 w-28 shrink-0 overflow-hidden border border-char/15 bg-forest">
                        <img
                          src={img(rv.image, 300)}
                          alt={rv.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-char/60">
                        <span
                          className={`rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                            BLOG_BADGE[rv.status] || BLOG_BADGE.pending
                          }`}
                        >
                          {rv.status === "approved"
                            ? "Accepted / Live"
                            : rv.status === "rejected"
                            ? "Rejected"
                            : "Pending Review"}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-forest">{rv.segment}</span>
                        <span>•</span>
                        <span>{rv.location}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 text-gold">
                          {Array.from({ length: Number(rv.rating) || 5 }).map((_, idx) => (
                            <Star key={idx} className="h-3.5 w-3.5 fill-gold text-gold" />
                          ))}
                        </span>
                      </div>

                      <h3 className="mt-2 font-serif text-xl sm:text-2xl text-forest">
                        “{rv.title}”
                      </h3>

                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-char/80">
                        {rv.review}
                      </p>

                      <p className="mt-2.5 text-xs text-char/65">
                        By <strong className="text-char">{rv.name}</strong> ({rv.role || "Sacred Vista Traveller"})
                        {rv.email ? ` · ${rv.email}` : ""} · Travelled {rv.travelDate || rv.date} · Submitted{" "}
                        {rv.created_at ? new Date(rv.created_at).toLocaleString("en-IN") : rv.date}
                      </p>
                    </div>
                  </div>

                  {/* Right: Approve / Reject / Delete Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      disabled={isBusy || rv.status === "approved"}
                      onClick={() => updateStatus(rv.id, "approved")}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                        rv.status === "approved"
                          ? "bg-forest/20 text-forest/50 cursor-default"
                          : "bg-forest text-gold hover:bg-forest/90"
                      }`}
                      data-testid={`admin-review-accept-${rv.id}`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>

                    <button
                      type="button"
                      disabled={isBusy || rv.status === "rejected"}
                      onClick={() => updateStatus(rv.id, "rejected")}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                        rv.status === "rejected"
                          ? "border-red-300 bg-red-50 text-red-400 cursor-default"
                          : "border-red-700/35 text-red-700 hover:bg-red-700 hover:text-ivory"
                      }`}
                      data-testid={`admin-review-reject-${rv.id}`}
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => removeReview(rv.id)}
                      className="rounded-full p-2 text-char/40 hover:text-red-600 transition-colors"
                      title="Delete review"
                      data-testid={`admin-review-delete-${rv.id}`}
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DestinationsPanel({ destinations, onAdd, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this destination?")) return;
    setDeleting(id);
    setError("");
    try {
      await http.delete(`/admin/destinations/${id}`);
      onDeleted();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl text-forest">Destinations</h2>
          <p className="mt-1 text-sm text-char/60">Destinations appear on the homepage interactive map and in package forms.</p>
        </div>
        <button type="button" onClick={onAdd}
          className="btn-gold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Destination
        </button>
      </div>
      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      {destinations.length === 0 ? (
        <p className="text-char/60">No destinations yet. Click "Add Destination" to create one.</p>
      ) : (
        <div className="divide-y divide-char/10 border-y border-char/10">
          {destinations.map((d) => (
            <div key={d.id} className="flex items-center justify-between py-4 gap-4">
              <div>
                <p className="font-serif text-lg text-forest">{d.name}</p>
                <p className="text-xs text-char/60">
                  {[d.region, d.country].filter(Boolean).join(" · ")}
                  {d.lat && d.lng ? (
                    <span className="ml-2 font-mono text-[11px] text-forest/70">📍 {d.lat}, {d.lng}</span>
                  ) : null}
                  {d.id && <span className="ml-2 font-mono text-char/40">({d.id})</span>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(d)}
                  className="p-2 text-char/40 hover:text-forest transition-colors"
                  title="Edit destination"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(d.id)}
                  disabled={deleting === d.id}
                  className="p-2 text-char/40 hover:text-red-600 transition-colors"
                  title="Delete destination"
                >
                  {deleting === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, logout } = useAuth();
  const { reload, destinations } = useCatalog();
  const [tab, setTab] = useState("dashboard");
  const [destModalOpen, setDestModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  useSeo("Admin desk");
  if (user === null) return <div className="pt-16"><Loading /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  const handleAddDest = () => {
    setEditingDest(null);
    setDestModalOpen(true);
  };

  const handleEditDest = (d) => {
    setEditingDest(d);
    setDestModalOpen(true);
  };

  return (
    <AdminShell
      user={user}
      logout={logout}
      tab={tab}
      setTab={setTab}
      destinations={destinations}
      reload={reload}
      onAddDest={handleAddDest}
      onEditDest={handleEditDest}
    >
      <AddDestinationModal
        open={destModalOpen}
        destination={editingDest}
        onClose={() => setDestModalOpen(false)}
        onSaved={() => { reload(); setDestModalOpen(false); }}
      />
    </AdminShell>
  );
}

function AdminShell({ user, logout, tab, setTab, destinations, reload, onAddDest, onEditDest, children }) {
  const adminData = useAdminData(logout);
  const { reload: reloadAdminData } = adminData;

  // Refresh sidebar badge counts whenever the admin switches section.
  useEffect(() => {
    reloadAdminData();
  }, [tab, reloadAdminData]);

  return (
    <AdminLayout tab={tab} onSelect={setTab} badges={adminData.badges} user={user} onLogout={logout}>
      {tab === "dashboard" && <DashboardPanel data={adminData} onNavigate={setTab} />}
      {tab === "inquiries" && <InquiriesPanel logout={logout} />}
      {tab === "blogs" && <BlogsPanel logout={logout} />}
      {tab === "reviews" && <ReviewsPanel logout={logout} />}
      {tab === "packages" && <PackageEditor />}
      {tab === "destinations" && (
        <DestinationsPanel
          destinations={destinations}
          onAdd={onAddDest}
          onEdit={onEditDest}
          onDeleted={reload}
        />
      )}
      {children}
    </AdminLayout>
  );
}
