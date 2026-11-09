import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Copy,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  ListChecks,
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Route,
  Save,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatalog } from "@/context/CatalogContext";
import { apiError, http, img, inr, nights } from "@/lib/sv";
import GalleryManager from "./GalleryManager";
import ImageUpload from "./ImageUpload";

const LISTS = [
  ["highlights", "Key Highlights", "Up to 6 private jeep safaris\nDedicated senior naturalist"],
  ["inclusions", "Included in Expedition", "4 nights forest lodge stay\nAll meals at the lodge"],
  ["exclusions", "Not Included", "Domestic or international flights\nCamera fees at the park"],
  ["info", "Important Travel Information", "Safari permits require passport/ID details at inquiry.\nNeutral-coloured clothing recommended."],
];

const lines = (t) =>
  String(t || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const NEW = "__new";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

const BLANK = {
  id: "",
  destination_id: "",
  segment_id: "",
  title: "",
  price_inr: "",
  duration_days: "",
  featured: false,
  image: "",
  group_size: "",
  best_season: "",
  summary: "",
  overview: "",
  highlights: "",
  inclusions: "",
  exclusions: "",
  info: "",
  gallery: [],
  itinerary: [{ day: 1, title: "", location: "", activities: "", travel: "" }],
};

const toDraft = (p) => ({
  id: p.id || "",
  destination_id: p.destination_id || "",
  segment_id: p.segment_id || "",
  title: p.title || "",
  price_inr: String(p.price_inr ?? ""),
  duration_days: String(p.duration_days ?? ""),
  featured: !!p.featured,
  image: p.image || "",
  group_size: p.group_size || "",
  best_season: p.best_season || "",
  summary: p.summary || "",
  overview: p.overview || "",
  ...Object.fromEntries(LISTS.map(([k]) => [k, (p[k] || []).join("\n")])),
  gallery: [...(p.gallery || [])],
  itinerary: (p.itinerary?.length
    ? p.itinerary
    : [{ day: 1, title: "", location: "", activities: [], travel: "" }]
  ).map((d, i) => ({
    day: d.day || i + 1,
    title: d.title || "",
    location: d.location || "",
    travel: d.travel || "",
    activities: Array.isArray(d.activities)
      ? d.activities.join("\n")
      : String(d.activities || ""),
  })),
});

const toBody = (d) => ({
  title: d.title.trim(),
  destination_id: d.destination_id || "",
  segment_id: d.segment_id || "",
  price_inr: Number(d.price_inr) || 0,
  duration_days: Number(d.duration_days) || 1,
  featured: !!d.featured,
  image: d.image || "",
  group_size: d.group_size.trim(),
  best_season: d.best_season.trim(),
  summary: d.summary.trim(),
  overview: d.overview.trim(),
  ...Object.fromEntries(LISTS.map(([k]) => [k, lines(d[k])])),
  gallery: Array.isArray(d.gallery) ? d.gallery : [],
  itinerary: d.itinerary.map((x, i) => ({
    day: Number(x.day) || i + 1,
    title: (x.title || "").trim() || `Day ${i + 1}`,
    location: (x.location || "").trim() || "Reserve",
    travel: (x.travel || "").trim(),
    activities: lines(x.activities),
  })),
});

const Label = ({ children, htmlFor, hint }) => (
  <div className="mb-1.5 flex items-baseline justify-between gap-2">
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-bold uppercase tracking-[0.2em] text-forest"
    >
      {children}
    </label>
    {hint && <span className="text-[10px] text-char/50">{hint}</span>}
  </div>
);

const inputBox =
  "w-full rounded-xl border border-char/20 bg-ivory/60 px-3.5 py-2.5 text-sm text-char placeholder:text-char/40 transition-colors focus:border-gold focus:bg-white focus:outline-none";

function DayEditor({
  day,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  const set = (k) => (e) => onChange({ ...day, [k]: e.target.value });
  return (
    <div
      className="rounded-xl border border-char/15 bg-ivory/50 p-4 transition-colors hover:border-gold/50"
      data-testid={`editor-day-${index}`}
    >
      <div className="mb-3 flex items-center justify-between border-b border-char/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest font-mono text-xs font-bold text-gold">
            {String(day.day || index + 1).padStart(2, "0")}
          </span>
          <span className="font-serif text-base font-medium text-forest">
            {day.title || `Stage ${index + 1}`}
          </span>
          {day.location && (
            <span className="text-xs text-char/55">· {day.location}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="rounded-full p-1.5 text-char/50 hover:bg-white hover:text-forest disabled:opacity-30"
            title="Move day up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="rounded-full p-1.5 text-char/50 hover:bg-white hover:text-forest disabled:opacity-30"
            title="Move day down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full p-1.5 text-char/50 hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove day ${day.day}`}
            data-testid={`editor-day-${index}-remove`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[80px_1fr_1fr]">
        <div>
          <Label>Day #</Label>
          <input
            type="number"
            min="1"
            className={inputBox}
            value={day.day}
            onChange={set("day")}
            data-testid={`editor-day-${index}-number`}
          />
        </div>
        <div>
          <Label>Stage Title *</Label>
          <input
            className={inputBox}
            value={day.title}
            onChange={set("title")}
            placeholder="e.g. Arrival into tiger country"
            data-testid={`editor-day-${index}-title`}
          />
        </div>
        <div>
          <Label>Location / Zone *</Label>
          <input
            className={inputBox}
            value={day.location}
            onChange={set("location")}
            placeholder="e.g. Nagpur → Tadoba"
            data-testid={`editor-day-${index}-location`}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <Label hint="One activity per line">Planned Activities</Label>
          <textarea
            rows={3}
            className={inputBox}
            value={day.activities}
            onChange={set("activities")}
            placeholder={"Private airport pickup\nLodge welcome and briefing\nSunset walk on the lodge trail"}
            data-testid={`editor-day-${index}-activities`}
          />
        </div>
        <div>
          <Label>Travel / Transfer Note</Label>
          <input
            className={inputBox}
            value={day.travel}
            onChange={set("travel")}
            placeholder="e.g. 2.5 hr road transfer"
            data-testid={`editor-day-${index}-travel`}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Live Preview Component (Card + Full Package Info Page) ── */
function LivePackagePreview({ draft, dest, seg, previewMode, setPreviewMode }) {
  const [openDay, setOpenDay] = useState(0);

  const previewTitle = draft.title?.trim() || "Untitled Expedition";
  const previewPrice = Number(draft.price_inr) || 0;
  const previewDays = Number(draft.duration_days) || 1;
  const previewImage =
    draft.image ||
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80";
  const previewDestName = dest?.name || "Select Destination";
  const previewSegName = seg?.name || "Select Segment";
  const previewHighlights = lines(draft.highlights);
  const previewInclusions = lines(draft.inclusions);
  const previewExclusions = lines(draft.exclusions);
  const previewInfo = lines(draft.info);
  const previewGallery =
    draft.gallery?.length > 0 ? draft.gallery : draft.image ? [draft.image] : [];

  const stats = [
    { k: "Duration", v: nights(previewDays), icon: Clock },
    {
      k: "Destination",
      v: `${previewDestName}${
        dest?.country && dest.country !== "India" ? `, ${dest.country}` : ""
      }`,
      icon: MapPin,
    },
    { k: "Travel Style", v: previewSegName, icon: Compass },
    { k: "Group Size", v: draft.group_size || "Bespoke", icon: Users },
    { k: "Best Season", v: draft.best_season || "Year-round", icon: Calendar },
    { k: "Starting From", v: `${inr(previewPrice)}*`, icon: Sparkles },
  ];

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-gold/40 bg-[#0d1d16] text-ivory shadow-[0_24px_70px_rgba(20,39,31,0.22)]"
      data-testid="package-live-preview"
    >
      {/* Top Preview Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 bg-forest px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
            Live Real-Time Preview
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/30 p-1">
          {[
            ["both", "Split View"],
            ["card", "Card Only"],
            ["page", "Info Page"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPreviewMode(key)}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                previewMode === key
                  ? "bg-gold text-forest"
                  : "text-ivory/70 hover:text-ivory"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Preview Viewport */}
      <div
        className="max-h-[calc(100vh-9rem)] space-y-6 overflow-y-auto overscroll-contain bg-ivory p-4 text-char sm:p-5"
        data-lenis-prevent
      >
        {/* ── 1. LIVE PACKAGE CARD PREVIEW ── */}
        {(previewMode === "both" || previewMode === "card") && (
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-forest">
                <LayoutGrid className="h-3.5 w-3.5 text-gold" />
                01. Package Card Preview (Listing &amp; Home Page)
              </span>
              <span className="text-[10px] text-char/50">Hover card to test</span>
            </div>

            <div className="group relative mx-auto block aspect-[16/11] w-full overflow-hidden rounded-[4px] bg-forest shadow-lg transition-all duration-500 hover:shadow-2xl">
              <img
                src={img(previewImage, 800)}
                alt={previewTitle}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/35 to-black/25" />

              {/* Top Badges */}
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full border border-white/15 bg-black/45 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory backdrop-blur-md">
                    {previewSegName}
                  </span>
                  {draft.featured && (
                    <span className="flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-forest backdrop-blur-md">
                      <Sparkles className="h-2.5 w-2.5" /> Featured
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1 rounded-full border border-white/15 bg-black/45 px-2.5 py-0.5 font-mono text-[9px] text-ivory/85 backdrop-blur-md">
                  <Clock className="h-2.5 w-2.5 text-gold" />
                  {nights(previewDays)}
                </span>
              </div>

              {/* Bottom Content Area (Always visible in preview so admin sees price & title clearly) */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-4 text-ivory">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  <MapPin className="h-3 w-3 text-gold" />
                  {previewDestName}
                  {dest?.country && dest.country !== "India"
                    ? ` · ${dest.country}`
                    : ""}
                </p>
                <h3 className="mt-1 font-serif text-lg leading-snug text-ivory">
                  {previewTitle}
                </h3>
                <div className="mt-2.5 flex items-center justify-between border-t border-white/15 pt-2.5">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-ivory/60">
                      From{" "}
                    </span>
                    <span className="font-sans text-xs font-semibold text-gold">
                      {inr(previewPrice)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory">
                    View Journey <ArrowUpRight className="h-3 w-3 text-gold" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. LIVE PACKAGE INFO PAGE PREVIEW ── */}
        {(previewMode === "both" || previewMode === "page") && (
          <div className="pt-2">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-forest">
                <FileText className="h-3.5 w-3.5 text-gold" />
                02. Package Info Page Preview (/packages/{draft.id || slugify(draft.title) || "id"})
              </span>
              <span className="text-[10px] text-char/50">Live Page Replica</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-char/15 bg-ivory shadow-md">
              {/* Hero Header Replica */}
              <div className="relative overflow-hidden bg-[#0e1712] p-5 text-ivory">
                <img
                  src={img(previewImage, 1000)}
                  alt={previewTitle}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e1712] via-[#0e1712]/70 to-transparent" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-ivory/50">
                    <span className="text-gold">← All Packages</span>
                    <span className="font-mono">
                      DOSSIER // {(draft.id || slugify(draft.title) || "NEW").toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-gold/30 bg-gold/20 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                      {previewSegName}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-ivory/75">
                      <MapPin className="h-3 w-3 text-gold" /> {previewDestName}
                    </span>
                  </div>

                  <h3 className="mt-2.5 font-serif text-2xl leading-tight text-ivory">
                    {previewTitle}
                  </h3>

                  {draft.summary && (
                    <p className="mt-2 text-xs leading-relaxed text-ivory/80">
                      {draft.summary}
                    </p>
                  )}

                  {/* 6-Spec HUD Ribbon */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-ivory/15 pt-3 sm:grid-cols-3">
                    {stats.map(({ k, v, icon: Icon }) => (
                      <div key={k} className="rounded bg-black/25 p-2">
                        <p className="flex items-center gap-1 text-[8px] uppercase tracking-[0.2em] text-ivory/55">
                          <Icon className="h-2.5 w-2.5 text-gold" /> {k}
                        </p>
                        <p className="mt-0.5 truncate font-serif text-xs font-medium text-ivory">
                          {v}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Page Content Body Replica */}
              <div className="space-y-6 p-4 sm:p-5">
                {/* Overview */}
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold">
                    The Expedition
                  </p>
                  <h4 className="mt-0.5 font-serif text-lg text-forest">
                    Overview &amp; Purpose
                  </h4>
                  <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-char/80">
                    {draft.overview ||
                      "Write an overview in the form to preview the full expedition narrative here…"}
                  </p>
                </div>

                {/* Highlights */}
                {previewHighlights.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold">
                      Key Highlights
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {previewHighlights.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded border border-char/10 bg-white p-2.5"
                        >
                          <span className="font-mono text-[10px] font-bold text-gold">
                            0{i + 1}
                          </span>
                          <span className="font-serif text-xs text-forest leading-snug">
                            {h}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Day-by-Day Itinerary */}
                {draft.itinerary?.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between border-b border-char/10 pb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold">
                        Day by Day Route
                      </span>
                      <span className="font-mono text-[10px] text-char/50">
                        {draft.itinerary.length} Stages
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {draft.itinerary.map((d, idx) => {
                        const isOpen = openDay === idx;
                        const acts = lines(d.activities);
                        return (
                          <div
                            key={idx}
                            className="overflow-hidden rounded border border-char/12 bg-white"
                          >
                            <button
                              type="button"
                              onClick={() => setOpenDay(isOpen ? -1 : idx)}
                              className="flex w-full items-center justify-between gap-2 p-2.5 text-left"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest font-mono text-[10px] font-semibold text-gold">
                                  {String(d.day || idx + 1).padStart(2, "0")}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-serif text-xs font-medium text-forest">
                                    {d.title || `Day ${idx + 1}`}
                                  </p>
                                  <p className="truncate text-[10px] text-char/55">
                                    {d.location || "Reserve"}
                                  </p>
                                </div>
                              </div>
                              <ChevronDown
                                className={`h-3.5 w-3.5 shrink-0 text-char/50 transition-transform ${
                                  isOpen ? "rotate-180 text-gold" : ""
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <div className="border-t border-char/10 bg-mist/40 px-3 py-2.5 text-xs">
                                {acts.length > 0 ? (
                                  <ul className="space-y-1">
                                    {acts.map((a, ai) => (
                                      <li
                                        key={ai}
                                        className="flex items-start gap-2 text-[11px] text-char/80"
                                      >
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                                        <span>{a}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[11px] italic text-char/50">
                                    No activities listed for this day yet.
                                  </p>
                                )}
                                {d.travel && (
                                  <p className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-char/60">
                                    <Navigation className="h-2.5 w-2.5 text-gold" />{" "}
                                    {d.travel}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Inclusions & Exclusions */}
                {(previewInclusions.length > 0 ||
                  previewExclusions.length > 0) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded border border-char/10 bg-white p-3">
                      <p className="mb-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-forest">
                        <Check className="h-3 w-3 text-gold" /> Included
                      </p>
                      <ul className="space-y-1">
                        {previewInclusions.map((inc, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-[11px] text-char/80"
                          >
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded border border-char/10 bg-white p-3">
                      <p className="mb-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-char/60">
                        <Minus className="h-3 w-3 text-char/40" /> Not Included
                      </p>
                      <ul className="space-y-1">
                        {previewExclusions.map((exc, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-[11px] text-char/70"
                          >
                            <Minus className="mt-0.5 h-3 w-3 shrink-0 text-char/40" />
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Important Travel Information */}
                {previewInfo.length > 0 && (
                  <div className="rounded border border-gold/40 bg-gold/10 p-3">
                    <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-forest">
                      <Info className="h-3 w-3 text-gold" /> Essential Travel Intelligence
                    </p>
                    <ul className="space-y-1 text-[11px] text-char/80">
                      {previewInfo.map((inf, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold text-gold">•</span>
                          <span>{inf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Gallery Thumbnails */}
                {previewGallery.length > 0 && (
                  <div>
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
                      Expedition Gallery ({previewGallery.length} Photos)
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {previewGallery.slice(0, 8).map((g, i) => (
                        <div
                          key={i}
                          className="aspect-square overflow-hidden rounded bg-forest"
                        >
                          <img
                            src={img(g, 240)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PackageEditor() {
  const { reload, destinations = [], segments = [], getDestination, getSegment } =
    useCatalog() || {};
  const [list, setList] = useState(null);
  const [id, setId] = useState(NEW);
  const isNew = id === NEW;
  const pkg = isNew ? null : list?.find((p) => p.id === id);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [segFilter, setSegFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewMode, setPreviewMode] = useState("both");

  const loadList = useCallback(
    () =>
      http
        .get("/admin/packages")
        .then((r) => {
          const rows = Array.isArray(r.data) ? r.data : [];
          setList(rows);
          setId((cur) => cur || NEW);
        })
        .catch((e) => setError(apiError(e))),
    []
  );

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (isNew) {
      setDraft({
        ...BLANK,
        gallery: [],
        itinerary: [...BLANK.itinerary],
      });
    } else if (pkg) {
      setDraft(toDraft(pkg));
    }
    setError("");
  }, [pkg, isNew]);

  const base = isNew ? BLANK : pkg && toDraft(pkg);
  const dirty = useMemo(
    () => !!draft && !!base && JSON.stringify(base) !== JSON.stringify(draft),
    [base, draft]
  );

  const filteredList = useMemo(() => {
    if (!list) return [];
    const q = searchQuery.trim().toLowerCase();
    return list.filter((p) => {
      if (segFilter !== "all" && p.segment_id !== segFilter) return false;
      if (statusFilter === "live" && p.retired) return false;
      if (statusFilter === "retired" && !p.retired) return false;
      if (statusFilter === "featured" && !p.featured) return false;
      if (q) {
        const destName = getDestination?.(p.destination_id)?.name || "";
        const segName = getSegment?.(p.segment_id)?.name || "";
        const hay = `${p.title} ${p.id} ${destName} ${segName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [list, searchQuery, segFilter, statusFilter, getDestination, getSegment]);

  if (list === null) {
    return (
      <p className="mt-10 text-char/70" data-testid="editor-loading">
        Loading packages…
      </p>
    );
  }
  if ((!pkg && !isNew) || !draft) {
    return <p className="mt-10 text-char/70">No packages found.</p>;
  }

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  const setDay = (i, v) =>
    setDraft((d) => ({
      ...d,
      itinerary: d.itinerary.map((x, j) => (j === i ? v : x)),
    }));
  const addDay = () =>
    setDraft((d) => ({
      ...d,
      itinerary: [
        ...d.itinerary,
        {
          day: d.itinerary.length + 1,
          title: "",
          location: "",
          activities: "",
          travel: "",
        },
      ],
    }));
  const removeDay = (i) =>
    setDraft((d) => ({
      ...d,
      itinerary: d.itinerary
        .filter((_, j) => j !== i)
        .map((item, idx) => ({ ...item, day: idx + 1 })),
    }));
  const moveDay = (i, dir) =>
    setDraft((d) => {
      const next = [...d.itinerary];
      const target = i + dir;
      if (target < 0 || target >= next.length) return d;
      const tmp = next[i];
      next[i] = next[target];
      next[target] = tmp;
      return {
        ...d,
        itinerary: next.map((item, idx) => ({ ...item, day: idx + 1 })),
      };
    });

  const pick = (next) => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setId(next);
  };

  const duplicatePackage = () => {
    const copyTitle = `${draft.title || "Expedition"} (Copy)`;
    setId(NEW);
    setTimeout(() => {
      setDraft({
        ...draft,
        id: slugify(copyTitle),
        title: copyTitle,
      });
      toast.info("Duplicated package into a new draft — review and click Create Package.");
    }, 0);
  };

  const save = async () => {
    if (!draft.title?.trim()) {
      setError("Please enter a package title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        const { data } = await http.post("/admin/packages", {
          ...toBody(draft),
          id: draft.id || slugify(draft.title) || `pkg-${Date.now()}`,
          destination_id: draft.destination_id || destinations[0]?.id || "",
          segment_id: draft.segment_id || segments[0]?.id || "",
        });
        await loadList();
        setId(data.id);
        toast.success(`${data.title} created — live on the website now.`);
      } else {
        await http.put(`/admin/packages/${pkg.id}`, toBody(draft));
        await loadList();
        toast.success(
          `${draft.title} saved${
            pkg.retired ? " (currently retired)" : " — live on the website now"
          }.`
        );
      }
      reload();
    } catch (e) {
      setError(e?.response ? apiError(e) : e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleRetire = async () => {
    const retire = !pkg.retired;
    if (
      retire &&
      !window.confirm(
        `Retire "${pkg.title}"? It will be hidden from visitors on the website, but you can restore it anytime.`
      )
    )
      return;
    try {
      await http.patch(`/admin/packages/${pkg.id}/retire`, { retired: retire });
      await loadList();
      reload();
      toast.success(
        retire
          ? `${pkg.title} retired — hidden from the website.`
          : `${pkg.title} restored — live on the website again.`
      );
    } catch (e) {
      setError(apiError(e));
    }
  };

  const deletePkg = async () => {
    if (
      !pkg ||
      !window.confirm(
        `Permanently delete "${pkg.title}"? This action cannot be undone.`
      )
    )
      return;
    try {
      await http.delete(`/admin/packages/${pkg.id}`);
      const remaining = list.filter((p) => p.id !== pkg.id);
      setList(remaining);
      setId(NEW);
      reload();
      toast.success(`"${pkg.title}" permanently deleted.`);
    } catch (e) {
      setError(apiError(e));
    }
  };

  const activeDest = getDestination?.(draft.destination_id);
  const activeSeg = getSegment?.(draft.segment_id);

  return (
    <div className="mt-10 space-y-6" data-testid="package-editor">
      {/* ── Top Package Management Header & Filter Bar ── */}
      <div className="rounded-2xl border border-char/15 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="eyebrow mb-1">Expedition Studio</p>
            <h2 className="text-2xl sm:text-3xl text-forest">
              Package Manager &amp; Live Designer
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-char/65">
              Select a package on the left, edit its details in the center, and preview both the{" "}
              <strong className="text-forest">Package Card</strong> and{" "}
              <strong className="text-forest">Package Info Page</strong> live on the right.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => pick(NEW)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
                isNew
                  ? "bg-gold text-forest shadow-md"
                  : "bg-forest text-gold hover:bg-forest/90"
              }`}
              data-testid="editor-new-package-btn"
            >
              <Plus className="h-4 w-4" /> New Package
            </button>

            {!isNew && (
              <button
                type="button"
                onClick={duplicatePackage}
                className="inline-flex items-center gap-2 rounded-full border border-char/20 bg-ivory px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-forest hover:border-gold transition-colors"
                title="Duplicate this package as a new draft"
              >
                <Copy className="h-3.5 w-3.5 text-gold" /> Duplicate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3-Column Studio Workspace: [Sidebar List] | [Form Editor] | [Live Preview] ── */}
      <div className="grid items-start gap-6 xl:grid-cols-[260px_1fr_430px]">
        {/* ── COLUMN 1: Package Catalog Navigator ── */}
        <aside className="rounded-2xl border border-char/15 bg-white p-3.5 shadow-sm xl:sticky xl:top-24">
          {/* Search & Filters inside Sidebar */}
          <div className="space-y-2.5 border-b border-char/10 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-char/45" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search packages…"
                className="h-9 w-full rounded-full border border-char/20 bg-ivory/60 pl-8 pr-7 text-xs text-char placeholder:text-char/45 focus:border-gold focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-char/45 hover:text-char"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={segFilter}
                onChange={(e) => setSegFilter(e.target.value)}
                className="h-8 rounded-lg border border-char/15 bg-ivory/60 px-2 text-[11px] font-medium text-char focus:border-gold focus:outline-none"
              >
                <option value="all">All Segments</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-lg border border-char/15 bg-ivory/60 px-2 text-[11px] font-medium text-char focus:border-gold focus:outline-none"
              >
                <option value="all">All ({list.length})</option>
                <option value="live">Live Only</option>
                <option value="featured">Featured</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          <ul
            className="mt-3 max-h-[65vh] space-y-1.5 overflow-y-auto overscroll-contain pr-1"
            data-lenis-prevent
            data-testid="editor-package-list"
          >
            {filteredList.map((p) => {
              const active = p.id === id;
              const pSeg = getSegment?.(p.segment_id);
              const pDest = getDestination?.(p.destination_id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pick(p.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all ${
                      active
                        ? "bg-forest text-ivory shadow-sm"
                        : "hover:bg-mist/80 text-char"
                    } ${p.retired ? "opacity-60" : ""}`}
                    data-testid={`editor-select-${p.id}`}
                  >
                    <img
                      src={img(p.image, 120)}
                      alt=""
                      className={`h-11 w-12 shrink-0 rounded-lg object-cover bg-forest ${
                        p.retired ? "grayscale" : ""
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1">
                        <span
                          className={`truncate text-[9px] font-bold uppercase tracking-[0.16em] ${
                            active ? "text-gold" : "text-char/55"
                          }`}
                        >
                          {pSeg?.name || "Tour"} · {pDest?.name || "India"}
                        </span>
                      </span>
                      <span className="block truncate font-serif text-sm font-medium">
                        {p.title}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 text-[11px] ${
                          active ? "text-ivory/75" : "text-char/65"
                        }`}
                      >
                        <span>{p.retired ? "Retired" : inr(p.price_inr)}</span>
                        <span>·</span>
                        <span>{p.duration_days}d</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── COLUMN 2: Structured Package Form Editor ── */}
        <div className="min-w-0 space-y-6">
          {/* Active Package Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-char/15 bg-white p-5 shadow-sm">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-forest px-3 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  {isNew ? "NEW BLANK PACKAGE FORM" : `EDITING PACKAGE · ID: ${pkg.id}`}
                </span>
                {pkg?.retired && (
                  <span
                    className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-800"
                    data-testid="editor-retired-badge"
                  >
                    Retired (Hidden)
                  </span>
                )}
                {draft.featured && (
                  <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-forest">
                    ★ Featured
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-serif text-2xl sm:text-3xl text-forest">
                {draft.title || (isNew ? "Create a New Expedition Package" : "Untitled Expedition")}
              </h3>
              {isNew && (
                <p className="mt-1 text-xs text-char/60">
                  Fill out the blank form below to create a new package, or click any package on the left sidebar to edit it.
                </p>
              )}
            </div>

            {!isNew && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => pick(NEW)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-char/20 bg-ivory px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-char hover:border-gold transition-colors"
                  title="Close edit mode and return to blank form"
                >
                  <X className="h-3.5 w-3.5" /> Close Edit
                </button>
                {!pkg.retired && (
                  <a
                    href={`/packages/${pkg.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-forest hover:bg-gold transition-colors"
                    data-testid="editor-preview-link"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Live Page ↗
                  </a>
                )}
                <button
                  type="button"
                  onClick={toggleRetire}
                  className="inline-flex items-center gap-1.5 rounded-full border border-char/20 bg-ivory px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-char hover:border-gold transition-colors"
                  data-testid="editor-retire-btn"
                >
                  {pkg.retired ? (
                    <>
                      <ArchiveRestore className="h-3.5 w-3.5 text-gold" /> Restore
                    </>
                  ) : (
                    <>
                      <Archive className="h-3.5 w-3.5 text-char/60" /> Retire
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={deletePkg}
                  className="inline-flex items-center justify-center rounded-full border border-red-200 p-2 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  title="Delete package permanently"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── CARD 1: Identity, Segment, Destination & Pricing ── */}
          <div
            className="rounded-2xl border border-char/15 bg-white p-5 sm:p-6 shadow-sm space-y-5"
            data-testid="editor-new-fields"
          >
            <div className="flex items-center gap-2 border-b border-char/10 pb-3">
              <Compass className="h-4 w-4 text-gold" />
              <h4 className="font-serif text-xl text-forest">
                01. Package Identity, Segment &amp; Pricing
              </h4>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="ed-title">Package / Expedition Title *</Label>
                <input
                  id="ed-title"
                  className={inputBox}
                  value={draft.title}
                  onChange={set("title")}
                  placeholder="e.g. Tiger Country Expedition"
                  data-testid="editor-title"
                />
              </div>

              {/* Segment Selector (Always editable!) */}
              <div>
                <Label>Travel Segment (Category) *</Label>
                <Select
                  key={`seg-${id}`}
                  value={draft.segment_id || undefined}
                  onValueChange={(v) =>
                    setDraft((d) => ({ ...d, segment_id: v }))
                  }
                >
                  <SelectTrigger
                    className="h-10 rounded-xl border-char/20 bg-ivory/60"
                    data-testid="editor-segment"
                  >
                    <SelectValue placeholder="Choose Segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((x) => (
                      <SelectItem key={x.id} value={x.id}>
                        {x.name} ({x.label})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination Selector (Always editable!) */}
              <div>
                <Label>Destination / Reserve *</Label>
                <Select
                  key={`dest-${id}`}
                  value={draft.destination_id || undefined}
                  onValueChange={(v) =>
                    setDraft((d) => ({ ...d, destination_id: v }))
                  }
                >
                  <SelectTrigger
                    className="h-10 rounded-xl border-char/20 bg-ivory/60"
                    data-testid="editor-destination"
                  >
                    <SelectValue placeholder="Choose Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((x) => (
                      <SelectItem key={x.id} value={x.id}>
                        {x.name} ({x.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isNew && (
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="ed-id"
                    hint="Auto-generated from title if left blank"
                  >
                    Web Address ID (/packages/your-id)
                  </Label>
                  <input
                    id="ed-id"
                    className={inputBox}
                    value={draft.id}
                    placeholder={
                      slugify(draft.title) || "e.g. pkg-leopard-trail"
                    }
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, id: slugify(e.target.value) }))
                    }
                    data-testid="editor-id"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="ed-price">Price per Person (₹ INR) *</Label>
                <input
                  id="ed-price"
                  type="number"
                  min="0"
                  className={inputBox}
                  value={draft.price_inr}
                  onChange={set("price_inr")}
                  placeholder="145000"
                  data-testid="editor-price"
                />
              </div>

              <div>
                <Label
                  htmlFor="ed-days"
                  hint={nights(Number(draft.duration_days) || 1)}
                >
                  Duration (Days) *
                </Label>
                <input
                  id="ed-days"
                  type="number"
                  min="1"
                  className={inputBox}
                  value={draft.duration_days}
                  onChange={set("duration_days")}
                  data-testid="editor-duration"
                />
              </div>

              <div>
                <Label htmlFor="ed-group">Group Size</Label>
                <input
                  id="ed-group"
                  className={inputBox}
                  value={draft.group_size}
                  onChange={set("group_size")}
                  placeholder="e.g. 2–6 guests"
                  data-testid="editor-group"
                />
              </div>

              <div>
                <Label htmlFor="ed-season">Best Season</Label>
                <input
                  id="ed-season"
                  className={inputBox}
                  value={draft.best_season}
                  onChange={set("best_season")}
                  placeholder="e.g. November – April"
                  data-testid="editor-season"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm">
                  <div>
                    <span className="block font-semibold text-forest">
                      Featured Expedition
                    </span>
                    <span className="text-xs text-char/65">
                      Prioritizes this package at the top of featured listings and home page showcases.
                    </span>
                  </div>
                  <Switch
                    checked={draft.featured}
                    onCheckedChange={(v) =>
                      setDraft((d) => ({ ...d, featured: v }))
                    }
                    data-testid="editor-featured"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ── CARD 2: Cover Image & Visual Gallery ── */}
          <div className="rounded-2xl border border-char/15 bg-white p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-char/10 pb-3">
              <ImageIcon className="h-4 w-4 text-gold" />
              <h4 className="font-serif text-xl text-forest">
                02. Cover Image &amp; Expedition Gallery
              </h4>
            </div>

            <ImageUpload
              label="Primary Cover Photograph (Used on Card & Hero Banner)"
              value={draft.image}
              onChange={(url) => setDraft((d) => ({ ...d, image: url }))}
              aspect="aspect-[16/9]"
              testId="editor-cover-upload"
            />

            <div className="rounded-xl border border-char/10 bg-mist/50 p-4">
              <GalleryManager
                gallery={draft.gallery}
                cover={draft.image}
                onChange={(g) => setDraft((d) => ({ ...d, gallery: g }))}
                onCover={(u) => setDraft((d) => ({ ...d, image: u }))}
              />
            </div>
          </div>

          {/* ── CARD 3: Editorial Narrative (Summary & Overview) ── */}
          <div className="rounded-2xl border border-char/15 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-char/10 pb-3">
              <FileText className="h-4 w-4 text-gold" />
              <h4 className="font-serif text-xl text-forest">
                03. Editorial Summary &amp; Overview
              </h4>
            </div>

            <div>
              <Label
                htmlFor="ed-summary"
                hint="Shown under the title on the package hero"
              >
                Short Hero Summary *
              </Label>
              <textarea
                id="ed-summary"
                rows={2}
                className={inputBox}
                value={draft.summary}
                onChange={set("summary")}
                placeholder="A concise 1–2 sentence hook describing the heart of this journey…"
                data-testid="editor-summary"
              />
            </div>

            <div>
              <Label
                htmlFor="ed-overview"
                hint="Main narrative on the Package Info Page"
              >
                Detailed Expedition Overview *
              </Label>
              <textarea
                id="ed-overview"
                rows={5}
                className={inputBox}
                value={draft.overview}
                onChange={set("overview")}
                placeholder="Describe the pace, wildlife rhythms, lodges, and naturalist experience in detail…"
                data-testid="editor-overview"
              />
            </div>
          </div>

          {/* ── CARD 4: Highlights, Inclusions, Exclusions & Essential Info ── */}
          <div className="rounded-2xl border border-char/15 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-char/10 pb-3">
              <ListChecks className="h-4 w-4 text-gold" />
              <h4 className="font-serif text-xl text-forest">
                04. Highlights, Inclusions &amp; Travel Intelligence
              </h4>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {LISTS.map(([k, label, placeholder]) => (
                <div key={k}>
                  <Label
                    htmlFor={`ed-${k}`}
                    hint={`${lines(draft[k]).length} items`}
                  >
                    {label}
                  </Label>
                  <textarea
                    id={`ed-${k}`}
                    rows={4}
                    className={inputBox}
                    value={draft[k]}
                    onChange={set(k)}
                    placeholder={placeholder}
                    data-testid={`editor-${k}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── CARD 5: Day-by-Day Itinerary Builder ── */}
          <div className="rounded-2xl border border-char/15 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-char/10 pb-3">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-xl text-forest">
                  05. Day-by-Day Itinerary ({draft.itinerary.length} Stages)
                </h4>
              </div>
              <button
                type="button"
                onClick={addDay}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gold hover:bg-forest/90 transition-colors"
                data-testid="editor-add-day"
              >
                <Plus className="h-3.5 w-3.5" /> Add Day
              </button>
            </div>

            <div className="space-y-3">
              {draft.itinerary.map((d, i) => (
                <DayEditor
                  key={i}
                  index={i}
                  total={draft.itinerary.length}
                  day={d}
                  onChange={(v) => setDay(i, v)}
                  onRemove={() => removeDay(i)}
                  onMoveUp={() => moveDay(i, -1)}
                  onMoveDown={() => moveDay(i, 1)}
                />
              ))}
            </div>
          </div>

          {error && (
            <p
              className="rounded-xl border border-red-700/40 bg-red-700/10 px-4 py-3 text-sm text-red-800"
              role="alert"
              data-testid="editor-error"
            >
              {error}
            </p>
          )}

          {/* ── Sticky Save Bar ── */}
          <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-forest/95 px-5 py-4 text-ivory shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  dirty ? "bg-gold animate-pulse" : "bg-emerald-400"
                }`}
              />
              <span
                className="text-xs font-medium text-ivory/90"
                data-testid="editor-status"
              >
                {dirty
                  ? "Unsaved changes — preview updated live on the right"
                  : isNew
                  ? "Fill in package details to publish"
                  : "All changes saved & live"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setDraft(
                    isNew ? { ...BLANK, gallery: [] } : toDraft(pkg)
                  )
                }
                disabled={!dirty}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/80 hover:border-gold hover:text-gold disabled:opacity-35"
                data-testid="editor-discard-btn"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving || (!dirty && !isNew)}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-forest shadow-md transition-all hover:bg-sand disabled:opacity-45"
                data-testid="editor-save-btn"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isNew ? "Create & Publish Package" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: Right-Side Sticky Live Preview (Card + Info Page) ── */}
        <aside className="xl:sticky xl:top-24">
          <LivePackagePreview
            draft={draft}
            dest={activeDest}
            seg={activeSeg}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
          />
        </aside>
      </div>
    </div>
  );
}
