import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCatalog } from "@/context/CatalogContext";
import { useSeo } from "@/hooks/useSeo";
import PageHero from "@/components/sv/PageHero";
import { PackageCard } from "@/components/sv/Cards";
import { CatalogGate, Empty } from "@/components/sv/States";

const HERO = "https://images.unsplash.com/photo-1505148230895-d9a785a555fa?auto=format&fit=crop&q=80";
export const BUDGETS = [
  { id: "under-1l", label: "Under ₹1 Lakh", min: 0, max: 100000 },
  { id: "1l-2l", label: "₹1 – 2 Lakh", min: 100000, max: 200000 },
  { id: "2l-plus", label: "Above ₹2 Lakh", min: 200000, max: Infinity },
];
const ALL = "all";

function LevelDropdown({ step, label, value, onChange, placeholder, options, testId }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
        {step}. {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="h-12 rounded-full border-char/20 bg-ivory/90 px-5 text-sm text-forest shadow-2xs transition-colors hover:border-gold focus:border-gold"
          data-testid={testId}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id} data-testid={`${testId}-${o.id}`}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function Packages() {
  const { packages, segments, destinations, getDestination } = useCatalog();
  const [params, setParams] = useSearchParams();
  const segment = params.get("segment") || ALL;
  const destination = params.get("destination") || ALL;
  const tour = params.get("tour") || ALL;
  const [q, setQ] = useState(params.get("q") || "");

  useSeo(
    "All Packages",
    "Browse Sacred Vista's curated wildlife safaris and journeys — filter by segment, location and type of tour."
  );

  const setFilterParams = (updates) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, val]) => {
          if (!val || val === ALL) next.delete(key);
          else next.set(key, val);
        });
        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    const t = setTimeout(() => setFilterParams({ q: q.trim() }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Level 1 Options: All Segments
  const segmentOptions = useMemo(
    () => [
      { id: ALL, label: "All Segments" },
      ...segments.map((s) => ({ id: s.id, label: s.label || s.name })),
    ],
    [segments]
  );

  // Level 2 Options: Locations filtered according to selected Segment
  const locationOptions = useMemo(() => {
    if (segment === ALL) {
      return [
        { id: ALL, label: "All Locations" },
        ...destinations.map((d) => ({ id: d.id, label: d.name })),
      ];
    }
    const matchingDestIds = new Set(
      packages.filter((p) => p.segment_id === segment).map((p) => p.destination_id)
    );
    const filteredDests = destinations.filter((d) => matchingDestIds.has(d.id));
    const list = filteredDests.length > 0 ? filteredDests : destinations;
    return [
      { id: ALL, label: "All Locations" },
      ...list.map((d) => ({ id: d.id, label: d.name })),
    ];
  }, [segment, destinations, packages]);

  // Level 3 Options: Types of Tour filtered according to selected Segment + Location
  const tourTypeOptions = useMemo(() => {
    const matchingPackages = packages.filter((p) => {
      if (segment !== ALL && p.segment_id !== segment) return false;
      if (destination !== ALL && p.destination_id !== destination) return false;
      return true;
    });
    return [
      { id: ALL, label: "All Tour Types" },
      ...matchingPackages.map((p) => ({ id: p.id, label: p.title })),
    ];
  }, [packages, segment, destination]);

  // Handlers for cascading level-wise changes
  const handleSegmentChange = (newSeg) => {
    setFilterParams({
      segment: newSeg,
      destination: ALL,
      tour: ALL,
    });
  };

  const handleLocationChange = (newDest) => {
    setFilterParams({
      destination: newDest,
      tour: ALL,
    });
  };

  const handleTourChange = (newTour) => {
    setFilterParams({
      tour: newTour,
    });
  };

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return packages.filter((p) => {
      const dest = getDestination(p.destination_id);
      if (segment !== ALL && p.segment_id !== segment) return false;
      if (destination !== ALL && p.destination_id !== destination) return false;
      if (tour !== ALL && p.id !== tour) return false;
      if (
        term &&
        !`${p.title} ${dest?.name || ""} ${p.summary}`.toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [packages, segment, destination, tour, q, getDestination]);

  const chips = [
    segment !== ALL && {
      key: "segment",
      label: segments.find((s) => s.id === segment)?.label || segment,
    },
    destination !== ALL && {
      key: "destination",
      label: getDestination(destination)?.name || destination,
    },
    tour !== ALL && {
      key: "tour",
      label: packages.find((p) => p.id === tour)?.title || tour,
    },
    q.trim() && { key: "q", label: `“${q.trim()}”` },
  ].filter(Boolean);

  const clearAll = () => {
    setQ("");
    setParams(new URLSearchParams(), { replace: true });
  };

  return (
    <>
      <PageHero
        image={HERO}
        eyebrow="The collection"
        title={["Discover Our", "Curated Packages"]}
        text="Wildlife safaris, cultural journeys and retreats — each composed by hand and confirmed personally by our team."
        crumbs={[{ label: "Home", to: "/" }, { label: "Packages" }]}
      />
      <section className="bg-ivory pb-32 pt-12" data-testid="packages-page">
        <div className="shell">
          <div className="sticky top-[68px] z-30 -mx-5 border-b border-char/10 bg-ivory/95 px-5 py-5 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-14 lg:px-14">
            <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
              {/* Search Text Input */}
              <div className="lg:col-span-4">
                <span className="mb-1 block px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-char/55">
                  Search
                </span>
                <label className="relative block">
                  <span className="sr-only">Search packages</span>
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-char/50" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by package or destination"
                    className="h-12 w-full rounded-full border border-char/20 bg-ivory/90 pl-12 pr-5 text-sm focus:border-gold focus:outline-none"
                    data-testid="packages-search-input"
                  />
                </label>
              </div>

              {/* 3-Level Cascading Dropdowns: Segment -> Location -> Type of Tour */}
              <div className="grid gap-3 sm:grid-cols-3 lg:col-span-8">
                <LevelDropdown
                  step="01"
                  label="Segment"
                  value={segment}
                  onChange={handleSegmentChange}
                  placeholder="Select Segment"
                  options={segmentOptions}
                  testId="filter-segment"
                />
                <LevelDropdown
                  step="02"
                  label="Location"
                  value={destination}
                  onChange={handleLocationChange}
                  placeholder="Select Location"
                  options={locationOptions}
                  testId="filter-destination"
                />
                <LevelDropdown
                  step="03"
                  label="Type of Tour"
                  value={tour}
                  onChange={handleTourChange}
                  placeholder="Select Tour Type"
                  options={tourTypeOptions}
                  testId="filter-tour-type"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-char/70" data-testid="packages-count">
              <span className="font-serif text-2xl text-forest">{results.length}</span>{" "}
              {results.length === 1 ? "journey" : "journeys"} found
            </p>
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" data-testid="active-filters">
                {chips.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      if (c.key === "q") setQ("");
                      else if (c.key === "segment") handleSegmentChange(ALL);
                      else if (c.key === "destination") handleLocationChange(ALL);
                      else handleTourChange(ALL);
                    }}
                    className="flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-xs text-forest"
                    data-testid={`active-filter-${c.key}`}
                  >
                    {c.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="link-line text-xs font-semibold uppercase tracking-[0.18em] text-gold"
                  data-testid="clear-filters-btn"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <CatalogGate>
            {results.length === 0 ? (
              <div className="mt-12">
                <Empty
                  title="No journeys match those filters."
                  text="Try selecting another segment, location or tour type — or let us design something just for you."
                  action={
                    <button
                      type="button"
                      onClick={clearAll}
                      className="btn-dark"
                      data-testid="empty-clear-filters-btn"
                    >
                      Reset filters
                    </button>
                  }
                />
              </div>
            ) : (
              <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {results.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.6, delay: Math.min(i, 6) * 0.05 }}
                    >
                      <PackageCard pkg={p} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </CatalogGate>
          <p className="mt-16 text-xs text-char/60">
            *Sample indicative prices per person in INR. Final pricing is confirmed in writing by our team.
          </p>
        </div>
      </section>
    </>
  );
}
