import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  Layers,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { img, inr, nights } from "@/lib/sv";
import { MaskLines, Reveal } from "@/components/sv/Motion";
import WorldMap from "./WorldMap";

const MAP_BG_IMG =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80";

function MiniPackage({ pkg, dest }) {
  const routeNames = Array.isArray(pkg.route)
    ? pkg.route.map((r) => r.name).filter(Boolean)
    : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/packages/${pkg.id}`}
        className="group relative flex items-center gap-4 rounded-xl border border-white/15 bg-black/35 p-3.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/55 hover:bg-black/50"
        data-testid={`map-package-${pkg.id}`}
      >
        <span className="h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-white/15 sm:h-20 sm:w-24">
          <img
            src={img(pkg.image, 320)}
            alt={pkg.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>{dest?.name || "Reserve"}</span>
            <span className="text-ivory/40">•</span>
            <span className="text-ivory/80">{nights(pkg.duration_days)}</span>
          </span>
          <span className="mt-1 block truncate font-serif text-lg text-ivory transition-colors group-hover:text-gold">
            {pkg.title}
          </span>
          {routeNames.length > 0 && (
            <span className="mt-0.5 block truncate text-[11px] text-ivory/65">
              Route: {routeNames.slice(0, 4).join(" → ")}
            </span>
          )}
          <span className="mt-1 block text-xs font-medium text-ivory/85">
            from <strong className="text-gold">{inr(pkg.price_inr)}</strong>
          </span>
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/15 text-gold transition-all duration-300 group-hover:bg-gold group-hover:text-forest">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>
    </motion.div>
  );
}

export default function MapExplorer({ segment = null, compact = false }) {
  const { destinations = [], packages = [], segments = [], getDestination } =
    useCatalog() || {};

  // Active segment filter (locked to `segment.id` by default when rendered inside SegmentView)
  const [activeSegmentId, setActiveSegmentId] = useState(segment?.id || "all");
  const [selected, setSelected] = useState(null);
  const [showAllOnSegmentPage, setShowAllOnSegmentPage] = useState(false);

  // Sync when segment prop changes
  useEffect(() => {
    if (segment?.id) {
      setActiveSegmentId(segment.id);
      setShowAllOnSegmentPage(false);
    } else {
      setActiveSegmentId("all");
    }
  }, [segment?.id]);

  // Packages matching the current segment scope
  const scopedPackages = useMemo(() => {
    if (segment?.id && !showAllOnSegmentPage) {
      return packages.filter((p) => p.segment_id === segment.id);
    }
    if (!segment && activeSegmentId !== "all") {
      return packages.filter((p) => p.segment_id === activeSegmentId);
    }
    return packages;
  }, [packages, segment, showAllOnSegmentPage, activeSegmentId]);

  // Destination IDs that have expeditions in the current segment scope
  const highlightedIds = useMemo(() => {
    const ids = Array.from(
      new Set(scopedPackages.map((p) => p.destination_id).filter(Boolean))
    );
    return ids.length > 0 ? ids : destinations.map((d) => d.id);
  }, [scopedPackages, destinations]);

  // Count of packages per destination in current scope
  const packageCounts = useMemo(() => {
    const counts = {};
    scopedPackages.forEach((p) => {
      if (p.destination_id) {
        counts[p.destination_id] = (counts[p.destination_id] || 0) + 1;
      }
    });
    return counts;
  }, [scopedPackages]);

  // Visible destination chips for quick selection
  const visibleDestinations = useMemo(() => {
    if (
      (segment?.id && !showAllOnSegmentPage) ||
      (!segment && activeSegmentId !== "all")
    ) {
      const filtered = destinations.filter((d) => highlightedIds.includes(d.id));
      return filtered.length > 0 ? filtered : destinations;
    }
    return destinations;
  }, [destinations, highlightedIds, segment, showAllOnSegmentPage, activeSegmentId]);

  // Auto-select the primary destination when on a segment page with 1 destination, or clear invalid selection
  useEffect(() => {
    if (segment?.id && !showAllOnSegmentPage) {
      if (highlightedIds.length === 1) {
        setSelected(highlightedIds[0]);
      } else if (selected && !highlightedIds.includes(selected)) {
        setSelected(null);
      }
    }
  }, [segment?.id, showAllOnSegmentPage, highlightedIds, selected]);

  const sel = selected ? getDestination(selected) : null;

  // Packages to list in the left dossier
  const list = useMemo(() => {
    if (sel) {
      const inScope = scopedPackages.filter((p) => p.destination_id === sel.id);
      return inScope.length > 0
        ? inScope
        : packages.filter((p) => p.destination_id === sel.id);
    }
    return scopedPackages;
  }, [sel, scopedPackages, packages]);

  const toggle = (id) => setSelected((cur) => (cur === id ? null : id));

  const stepDestination = (dir) => {
    if (visibleDestinations.length === 0) return;
    if (!selected) {
      setSelected(visibleDestinations[0].id);
      return;
    }
    const idx = visibleDestinations.findIndex((d) => d.id === selected);
    const nextIdx =
      (idx + dir + visibleDestinations.length) % visibleDestinations.length;
    setSelected(visibleDestinations[nextIdx].id);
  };

  const backdropImage = segment?.image
    ? img(segment.image, 1600)
    : sel?.banner
    ? img(sel.banner, 1600)
    : MAP_BG_IMG;

  return (
    <section
      className={`relative overflow-hidden bg-[#0b1711] text-ivory ${
        compact ? "py-14 sm:py-18 px-4 sm:px-6 lg:px-8" : "py-24 sm:py-32"
      }`}
      data-testid="map-explorer"
    >
      {/* Atmospheric Wilderness Backdrop Image for True Glassmorphism */}
      <img
        src={backdropImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 transition-all duration-700"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest/85 via-forest/75 to-[#0b1711]/95" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-sage/15 blur-3xl" />

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12">
        {/* Top Section Header + Segment Filter Bar */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-gold/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-gold backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              {segment
                ? `${segment.label} · Expedition Atlas`
                : "Sacred Vista Interactive Atlas"}
            </span>
            <h2 className="mt-3 font-serif text-3xl leading-[1.06] text-ivory sm:text-5xl">
              {segment
                ? `Where ${segment.name} Journeys Unfold`
                : "Explore Our Reserves on the Map"}
            </h2>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-ivory/80">
              {segment
                ? `Select any highlighted pin on the map to inspect the reserves, best seasons, and curated ${segment.name.toLowerCase()} expeditions.`
                : "Filter by travel segment or click any pin across India and East Africa to inspect wildlife reserves, seasons, and private expeditions."}
            </p>
          </div>

          {/* Segment Scope Controls */}
          {segment ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAllOnSegmentPage(false);
                  setSelected(null);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-md transition-all ${
                  !showAllOnSegmentPage
                    ? "border-gold bg-gold text-forest shadow-[0_8px_25px_rgba(182,139,80,0.4)]"
                    : "border-white/20 bg-black/35 text-ivory/80 hover:border-gold/60"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                {segment.name} Places ({
                  new Set(
                    packages
                      .filter((p) => p.segment_id === segment.id)
                      .map((p) => p.destination_id)
                  ).size
                })
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAllOnSegmentPage(true);
                  setSelected(null);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-md transition-all ${
                  showAllOnSegmentPage
                    ? "border-gold bg-gold text-forest shadow-[0_8px_25px_rgba(182,139,80,0.4)]"
                    : "border-white/20 bg-black/35 text-ivory/80 hover:border-gold/60"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                All Reserves ({destinations.length})
              </button>
            </div>
          ) : (
            <div
              className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1"
              data-lenis-prevent
            >
              <button
                type="button"
                onClick={() => {
                  setActiveSegmentId("all");
                  setSelected(null);
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md transition-all ${
                  activeSegmentId === "all"
                    ? "border-gold bg-gold text-forest shadow-[0_6px_20px_rgba(182,139,80,0.4)]"
                    : "border-white/20 bg-black/35 text-ivory/80 hover:border-gold/60"
                }`}
              >
                All Segments
              </button>
              {segments.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveSegmentId(s.id);
                    setSelected(null);
                  }}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md transition-all ${
                    activeSegmentId === s.id
                      ? "border-gold bg-gold text-forest shadow-[0_6px_20px_rgba(182,139,80,0.4)]"
                      : "border-white/20 bg-black/35 text-ivory/80 hover:border-gold/60"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Two-Column Glassmorphic Grid */}
        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* ── LEFT COLUMN: 70% Opacity Glassmorphic Destination & Expedition Dossier ── */}
          <div className="min-w-0 lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-[#0d1d16] p-6 text-ivory shadow-[0_28px_80px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.35)] sm:p-7">
              <img
                src={sel?.banner ? img(sel.banner, 900) : backdropImage}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35 transition-all duration-500"
              />
              {/* 70% Opacity Frosted Glass Layer */}
              <div className="pointer-events-none absolute inset-0 bg-forest/70 backdrop-blur-xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
              <div className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full bg-gold/25 blur-3xl" />

              {/* Dossier Top Navigation Bar */}
              <div className="relative z-10 flex items-center justify-between gap-2 border-b border-gold/25 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
                    {sel ? "Selected Reserve" : "Active Scope"}
                  </p>
                  <p
                    className="mt-0.5 text-xs uppercase tracking-[0.18em] text-ivory/80"
                    data-testid="map-summary"
                  >
                    {sel
                      ? `${list.length} ${
                          list.length === 1 ? "expedition" : "expeditions"
                        } · ${sel.region}`
                      : `${visibleDestinations.length} ${
                          visibleDestinations.length === 1
                            ? "destination"
                            : "destinations"
                        } · ${list.length} ${
                          list.length === 1 ? "expedition" : "expeditions"
                        }`}
                  </p>
                </div>

                {/* Prev / Next Reserve Stepper */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepDestination(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-ivory/85 backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
                    aria-label="Previous destination"
                    title="Previous destination"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepDestination(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-ivory/85 backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
                    aria-label="Next destination"
                    title="Next destination"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Headline */}
              <div className="relative z-10 mt-4">
                <MaskLines
                  key={sel?.id || activeSegmentId || "all"}
                  onMount
                  lines={
                    sel
                      ? [sel.name]
                      : segment
                      ? [`${segment.name}`, "Reserves"]
                      : ["A World of", "Wild Places"]
                  }
                  className="text-3xl leading-[1.06] sm:text-4xl lg:text-5xl text-ivory"
                  lineClassName="[&:nth-child(2)]:italic [&:nth-child(2)]:text-gold"
                  testId="map-headline"
                />
              </div>

              {/* Selected Destination Glass Spotlight Card */}
              <AnimatePresence mode="popLayout">
                {sel && (
                  <motion.div
                    key={sel.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative z-10 mt-5 rounded-xl border border-gold/40 bg-black/35 p-4 backdrop-blur-md"
                    data-testid="map-destination-panel"
                  >
                    <div className="flex items-start gap-3.5">
                      {sel.banner && (
                        <img
                          src={img(sel.banner, 240)}
                          alt={sel.name}
                          className="h-16 w-20 shrink-0 rounded-lg border border-white/20 object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                          <Compass className="h-3 w-3" /> {sel.country} ·{" "}
                          {Number(sel.lat).toFixed(1)}°N,{" "}
                          {Number(sel.lng).toFixed(1)}°E
                        </span>
                        <p className="mt-0.5 font-serif text-lg italic text-ivory">
                          “{sel.tagline}”
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-3 text-xs sm:text-sm leading-relaxed text-ivory/85">
                      {sel.description}
                    </p>

                    {sel.best_time && (
                      <p className="mt-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-gold">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gold" />
                        <span>Best Season: {sel.best_time}</span>
                      </p>
                    )}

                    {Array.isArray(sel.wildlife) && sel.wildlife.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {sel.wildlife.slice(0, 4).map((w) => (
                          <span
                            key={w}
                            className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] text-ivory/90"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-white/15 pt-3.5">
                      <Link
                        to={`/destinations/${sel.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-gold px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-forest transition-transform hover:-translate-y-0.5"
                        data-testid="map-view-destination-btn"
                      >
                        Explore Destination <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      {visibleDestinations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSelected(null)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/85 hover:border-gold hover:text-gold transition-colors"
                          data-testid="map-view-all-btn"
                        >
                          Show All Places
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scrollable Expedition List */}
              <div className="relative z-10 mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                    {sel
                      ? `Curated Expeditions in ${sel.name}`
                      : "Matching Expeditions"}
                  </span>
                  <span className="rounded-full border border-gold/35 bg-gold/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-gold">
                    {list.length}
                  </span>
                </div>

                <div
                  className="max-h-[360px] space-y-2.5 overflow-y-auto overscroll-contain pr-1"
                  data-lenis-prevent
                  data-testid="map-package-list"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {list.map((p) => (
                      <MiniPackage
                        key={p.id}
                        pkg={p}
                        dest={getDestination(p.destination_id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: 70% Opacity Glassmorphic Interactive Map Stage ── */}
          <div className="min-w-0 lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-[#0d1d16] p-5 text-ivory shadow-[0_28px_80px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.35)] sm:p-7">
              <img
                src={backdropImage}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
              />
              {/* 70% Opacity Frosted Glass Layer */}
              <div className="pointer-events-none absolute inset-0 bg-forest/70 backdrop-blur-xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold/80 to-transparent" />

              <div className="relative z-10">
                <Reveal y={16}>
                  <WorldMap
                    destinations={destinations}
                    selectedId={selected}
                    onSelect={toggle}
                    highlightedIds={highlightedIds}
                    packageCounts={packageCounts}
                  />
                </Reveal>

                <p className="mt-3 text-center text-[11px] text-ivory/70">
                  Masai Mara is shown in the Kenya inset (East Africa) — click any glowing pin or destination pill below to zoom in.
                </p>

                {/* Interactive Glassmorphic Destination Chips */}
                <div
                  className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-center"
                  data-lenis-prevent
                >
                  {visibleDestinations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      aria-pressed={!selected}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide backdrop-blur-md transition-all ${
                        !selected
                          ? "border-gold bg-gold text-forest shadow-[0_6px_20px_rgba(182,139,80,0.4)]"
                          : "border-white/25 bg-black/35 text-ivory/85 hover:border-gold/70"
                      }`}
                    >
                      All ({visibleDestinations.length})
                    </button>
                  )}

                  {destinations.map((d) => {
                    const isActive = selected === d.id;
                    const inScope = highlightedIds.includes(d.id);
                    const count = packageCounts[d.id] || 0;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggle(d.id)}
                        aria-pressed={isActive}
                        data-testid={`map-chip-${d.id}`}
                        className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium tracking-wide backdrop-blur-md transition-all ${
                          isActive
                            ? "border-gold bg-gold text-forest font-semibold shadow-[0_6px_20px_rgba(182,139,80,0.45)]"
                            : inScope
                            ? "border-gold/45 bg-black/40 text-ivory hover:border-gold"
                            : "border-white/15 bg-black/20 text-ivory/45 hover:border-white/35 hover:text-ivory/80"
                        }`}
                      >
                        <MapPin
                          className={`h-3.5 w-3.5 ${
                            isActive
                              ? "text-forest"
                              : inScope
                              ? "text-gold"
                              : "text-ivory/40"
                          }`}
                        />
                        <span>{d.name}</span>
                        {count > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                              isActive
                                ? "bg-forest/20 text-forest"
                                : "bg-gold/20 text-gold"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
