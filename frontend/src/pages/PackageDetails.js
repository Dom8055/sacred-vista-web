import { useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Info,
  MapPin,
  Minus,
  Navigation,
  Sparkles,
  Users,
} from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { useSeo } from "@/hooks/useSeo";
import { scrollToEl } from "@/hooks/useLenis";
import { img, inr, nights, pad } from "@/lib/sv";
import { PackageCard } from "@/components/sv/Cards";
import { CatalogGate, NotFoundBlock } from "@/components/sv/States";
import InquiryForm from "@/components/sv/InquiryForm";
import Lightbox from "@/components/sv/Lightbox";

/* ── Refined Itinerary Day Accordion Item ── */
function DayCard({ d, index, defaultOpen = false, image }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`relative rounded-sm border transition-all duration-300 ${
        open ? "border-gold/40 bg-white shadow-xs" : "border-char/10 bg-ivory/60 hover:border-char/25"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left"
        data-testid={`itinerary-day-${d.day}-toggle`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold transition-colors ${
              open ? "bg-forest text-gold shadow-xs" : "bg-char/10 text-char/70"
            }`}
          >
            {pad(d.day)}
          </span>
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              Day {pad(d.day)} · {d.location}
            </span>
            <span className="mt-0.5 block font-serif text-base sm:text-lg text-forest leading-snug truncate">
              {d.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {d.travel && (
            <span className="hidden md:inline-flex items-center gap-1 rounded bg-forest/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-char/60">
              <Navigation className="h-2.5 w-2.5 text-gold" /> {d.travel}
            </span>
          )}
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border border-char/15 transition-transform duration-300 ${
              open ? "rotate-180 border-gold/50 bg-gold/10 text-gold" : "text-char/50"
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
            data-testid={`itinerary-day-${d.day}-content`}
          >
            <div className="border-t border-char/10 p-4 sm:p-5 sm:pl-16">
              <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-char/50 mb-2.5">
                    Planned Activities
                  </p>
                  <ul className="space-y-2">
                    {d.activities.map((a) => (
                      <li key={a} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-char/80">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>

                  {d.travel && (
                    <p className="mt-4 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-char/60 md:hidden">
                      <Navigation className="h-3 w-3 text-gold" /> {d.travel}
                    </p>
                  )}
                </div>

                {image && (
                  <div className="hidden sm:block overflow-hidden rounded-sm aspect-[4/3] bg-forest">
                    <img
                      src={img(image, 500)}
                      alt={d.location}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Details Component (Single Continuous Scroll) ── */
function Details({ pkg }) {
  const { getDestination, getSegment, packages } = useCatalog();
  const dest = getDestination(pkg.destination_id);
  const seg = getSegment(pkg.segment_id);
  const [lb, setLb] = useState(null);
  const formRef = useRef(null);

  const related = packages
    .filter((p) => p.id !== pkg.id && (p.destination_id === pkg.destination_id || p.segment_id === pkg.segment_id))
    .slice(0, 3);

  const gallery = (pkg.gallery?.length ? pkg.gallery : [pkg.image]).map((g, i) => ({
    image: g,
    title: `${pkg.title} — ${i + 1}`,
    location: dest?.name,
  }));

  useSeo(pkg.title, pkg.summary, img(pkg.image, 1200));

  const stats = [
    { k: "Duration", v: nights(pkg.duration_days), icon: Clock },
    { k: "Destination", v: `${dest?.name}${dest?.country !== "India" ? `, ${dest?.country}` : ""}`, icon: MapPin },
    { k: "Travel Style", v: seg?.name || "Expedition", icon: Compass },
    { k: "Group Size", v: pkg.group_size || "Bespoke", icon: Users },
    { k: "Best Season", v: pkg.best_season || "Year-round", icon: Calendar },
    { k: "Starting From", v: `${inr(pkg.price_inr)}*`, icon: Sparkles },
  ];

  return (
    <div data-testid={`package-details-${pkg.id}`} className="min-h-screen bg-ivory">
      {/* ── Cinematic Hero Header ── */}
      <section className="relative overflow-hidden bg-[#0e1712] text-ivory">
        <div className="absolute inset-0 z-0">
          <img
            src={img(pkg.image, 2000)}
            alt={pkg.title}
            className="h-full w-full object-cover object-center opacity-40 transition-transform duration-1000 ease-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1712] via-[#0e1712]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1712] via-[#0e1712]/60 to-transparent" />
        </div>

        <div className="shell relative z-10 pb-8 pt-28 sm:pb-12 sm:pt-36">
          {/* Back breadcrumb link */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <Link
              to="/packages"
              className="inline-flex items-center gap-1.5 text-gold/80 hover:text-gold uppercase tracking-[0.2em] font-semibold text-[10px] transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to All Packages
            </Link>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-ivory/40">
              EXPEDITION DOSSIER // {pkg.id.toUpperCase()}
            </span>
          </div>

          {/* Badges */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-gold/20 backdrop-blur-md px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold border border-gold/30">
              {seg?.name || "Curated Expedition"}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-ivory/70">
              <MapPin className="h-3 w-3 text-gold" /> {dest?.name}
              {dest?.region ? ` · ${dest.region}` : ""}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl text-ivory max-w-4xl leading-tight">
            {pkg.title}
          </h1>

          {/* Summary */}
          <p className="mt-3 text-sm sm:text-base text-ivory/80 max-w-3xl leading-relaxed">
            {pkg.summary}
          </p>

          {/* Quick HUD Specs Ribbon */}
          <div
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 border-t border-ivory/15 pt-5"
            data-testid="package-stats"
          >
            {stats.map(({ k, v, icon: Icon }) => (
              <div key={k} className="p-1">
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-ivory/50">
                  <Icon className="h-3 w-3 text-gold" /> {k}
                </p>
                <p className="mt-1 font-serif text-sm sm:text-base text-ivory font-medium truncate">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Continuous Single-Scroll Workspace ── */}
      <section className="shell py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_390px] items-start">
          {/* ── Left Column: Smooth Flowing Content ── */}
          <div className="min-w-0 space-y-14">
            {/* 1. Overview Narrative */}
            <div className="space-y-4">
              <p className="eyebrow text-gold">The Expedition</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-forest leading-tight">
                Overview &amp; Purpose
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-char/80 whitespace-pre-line pt-2">
                {pkg.overview}
              </p>
            </div>

            {/* 2. Key Highlights Grid */}
            <div className="space-y-4">
              <p className="eyebrow text-gold">Key Highlights</p>
              <h3 className="font-serif text-xl sm:text-2xl text-forest">Curated Encounters</h3>
              <div className="grid gap-3.5 sm:grid-cols-2" data-testid="package-highlights">
                {pkg.highlights.map((h, i) => (
                  <div
                    key={h}
                    className="flex items-start gap-3 rounded-sm border border-char/10 bg-white p-4.5 shadow-2xs hover:border-gold/50 transition-colors"
                  >
                    <span className="font-mono text-xs font-semibold text-gold">0{i + 1}</span>
                    <p className="font-serif text-sm sm:text-base text-forest leading-snug">{h}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Day-by-Day Itinerary */}
            <div className="space-y-5">
              <div className="flex items-end justify-between border-b border-char/10 pb-3">
                <div>
                  <p className="eyebrow text-gold">Day by Day</p>
                  <h3 className="font-serif text-xl sm:text-2xl text-forest">The Detailed Route</h3>
                </div>
                <span className="font-mono text-xs text-char/50 uppercase tracking-widest">
                  {pkg.itinerary.length} Stages
                </span>
              </div>

              <div className="space-y-2.5" data-testid="itinerary-timeline">
                {pkg.itinerary.map((d, i) => (
                  <DayCard
                    key={d.day}
                    d={d}
                    index={i}
                    defaultOpen={i === 0}
                    image={pkg.gallery?.length ? pkg.gallery[i % pkg.gallery.length] : pkg.image}
                  />
                ))}
              </div>
            </div>

            {/* 4. Inclusions & Exclusions */}
            <div className="space-y-5">
              <p className="eyebrow text-gold">Trip Arrangements</p>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Included */}
                <div className="rounded-sm border border-char/10 bg-white p-5 sm:p-6" data-testid="package-inclusions">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-forest mb-4 flex items-center gap-1.5 font-sans">
                    <Check className="h-4 w-4 text-gold" /> Included in Expedition
                  </p>
                  <ul className="space-y-2.5">
                    {pkg.inclusions.map((x) => (
                      <li key={x} className="flex items-start gap-2.5 text-xs sm:text-sm text-char/80 leading-relaxed">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Excluded */}
                <div className="rounded-sm border border-char/10 bg-white p-5 sm:p-6" data-testid="package-exclusions">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-char/60 mb-4 flex items-center gap-1.5 font-sans">
                    <Minus className="h-4 w-4 text-char/40" /> Not Included
                  </p>
                  <ul className="space-y-2.5">
                    {pkg.exclusions.map((x) => (
                      <li key={x} className="flex items-start gap-2.5 text-xs sm:text-sm text-char/70 leading-relaxed">
                        <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-char/40" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 5. Essential Briefing / Info */}
            {pkg.info?.length > 0 && (
              <div className="rounded-sm border border-gold/40 bg-gold/5 p-5 sm:p-6" data-testid="package-info">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-gold" /> Essential Travel Intelligence
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-char/80 leading-relaxed">
                  {pkg.info.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <span className="text-gold font-bold">•</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 6. Visual Gallery */}
            <div className="space-y-4">
              <div className="flex items-end justify-between border-b border-char/10 pb-3">
                <div>
                  <p className="eyebrow text-gold">Visuals</p>
                  <h3 className="font-serif text-xl sm:text-2xl text-forest">Expedition Moments</h3>
                </div>
                <span className="text-xs uppercase tracking-wider text-char/50">
                  {gallery.length} Photos
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {gallery.map((g, i) => (
                  <button
                    key={g.image}
                    type="button"
                    onClick={() => setLb(i)}
                    className="group relative aspect-square overflow-hidden rounded-sm bg-forest shadow-2xs"
                    data-testid={`package-gallery-${i}`}
                    aria-label={`Open photo ${i + 1}`}
                  >
                    <img
                      src={img(g.image, 600)}
                      alt={g.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="rounded-full bg-forest/80 backdrop-blur-md p-2 text-gold">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column: 70% Opacity Glassmorphic Inquiry Sidebar ── */}
          <aside className="min-w-0">
            <div
              ref={formRef}
              className="sticky top-24 relative overflow-hidden rounded-2xl border border-white/25 bg-forest/70 p-6 text-ivory shadow-[0_24px_70px_rgba(20,39,31,0.32),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-xl sm:p-7"
              data-testid="package-inquiry-panel"
            >
              {/* Ambient decorative glass highlights */}
              <div className="pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full bg-gold/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-sage/15 blur-3xl" />

              {/* Header */}
              <div className="relative z-10 border-b border-white/15 pb-4">
                <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-gold">
                  <Sparkles className="h-3 w-3" /> Private Concierge
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="font-serif text-2xl text-ivory">from {inr(pkg.price_inr)}</span>
                  <span className="text-[10px] text-ivory/75">/ person*</span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-gold">
                  <MapPin className="h-3 w-3" /> {dest?.name} · {nights(pkg.duration_days)}
                </p>
              </div>

              {/* Form */}
              <div className="relative z-10 mt-5">
                <InquiryForm pkg={pkg} compact embedded />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Related Expeditions ── */}
      {related.length > 0 && (
        <section className="border-t border-char/10 bg-ivory py-16" data-testid="related-packages">
          <div className="shell">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="eyebrow text-gold mb-1">Similar Explorations</p>
                <h3 className="font-serif text-2xl sm:text-3xl text-forest">Related Expeditions</h3>
              </div>
              <Link
                to="/packages"
                className="text-xs uppercase tracking-widest text-gold hover:text-forest font-semibold transition-colors flex items-center gap-1"
              >
                All Packages <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <PackageCard key={p.id} pkg={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Mobile Floating Booking Bar ── */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-gold/30 bg-[#0e1712] px-5 py-3 text-ivory lg:hidden"
        data-testid="mobile-inquiry-bar"
      >
        <div>
          <span className="block text-[9px] uppercase tracking-[0.2em] text-ivory/60">from</span>
          <span className="font-serif text-lg text-gold font-medium">{inr(pkg.price_inr)}</span>
          <span className="text-[10px] text-ivory/50"> / pers*</span>
        </div>
        <button
          type="button"
          onClick={() => scrollToEl(formRef.current)}
          className="btn-gold !px-6 !py-2.5 !text-xs font-semibold"
          data-testid="mobile-inquire-btn"
        >
          Inquire Now
        </button>
      </div>

      <Lightbox items={gallery} index={lb} onChange={setLb} onClose={() => setLb(null)} />
    </div>
  );
}

export default function PackageDetails() {
  const { packageId } = useParams();
  const [params] = useSearchParams();
  const id = packageId || params.get("packageId") || params.get("id") || "pkg-tiger";
  const { getPackage, status } = useCatalog();
  const pkg = getPackage(id);

  return (
    <CatalogGate>
      {pkg ? (
        <Details key={pkg.id} pkg={pkg} />
      ) : (
        status === "ready" && (
          <NotFoundBlock
            title="This expedition could not be found."
            text="The package may have been renamed or retired. Explore our current collection instead."
            to="/packages"
            cta="View all packages"
          />
        )
      )}
    </CatalogGate>
  );
}
