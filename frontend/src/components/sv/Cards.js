import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, MapPin, Sparkles } from "lucide-react";
import { img, inr, nights } from "@/lib/sv";
import { useCatalog } from "@/context/CatalogContext";

export function PackageCard({ pkg, index = 0 }) {
  const { getDestination, getSegment } = useCatalog();
  const dest = getDestination(pkg?.destination_id);
  const seg = getSegment(pkg?.segment_id);
  const peak = dest?.best_months?.[new Date().getMonth()] === 2;

  if (!pkg) return null;

  return (
    <Link
      to={`/packages/${pkg.id}`}
      className="group relative block aspect-[16/11] overflow-hidden rounded-[2px] bg-forest shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
      data-testid={`package-card-${pkg.id}`}
    >
      {/* Background Image with Zoom */}
      <img
        src={img(pkg.image, 800)}
        alt={pkg.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
      />

      {/* Dynamic Vignette / Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/35 to-black/25 transition-all duration-500 group-hover:from-forest/98 group-hover:via-forest/65" />

      {/* Corner Accents */}
      <span className="pointer-events-none absolute left-2.5 top-2.5 text-[8px] text-gold/30 font-mono leading-none">┌</span>
      <span className="pointer-events-none absolute right-2.5 top-2.5 text-[8px] text-gold/30 font-mono leading-none">┐</span>

      {/* Top Badges */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 z-10">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-black/45 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/90 border border-white/10">
            {seg?.name || "Expedition"}
          </span>
          {peak && (
            <span
              className="rounded-full bg-gold/90 backdrop-blur-md px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-forest flex items-center gap-1"
              data-testid={`peak-badge-${pkg.id}`}
            >
              <Sparkles className="h-2.5 w-2.5" /> Peak
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 rounded-full bg-black/45 backdrop-blur-md px-2 py-0.5 text-[9px] text-ivory/80 font-mono border border-white/10">
          <Clock className="h-2.5 w-2.5 text-gold" />
          {nights(pkg.duration_days)}
        </span>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 text-ivory z-10 flex flex-col justify-end">
        {/* Destination */}
        <p className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
          <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gold" />
          {dest?.name}{dest?.country !== "India" && dest ? ` · ${dest.country}` : ""}
        </p>

        {/* Title */}
        <h3 className="mt-1 font-serif text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-gold transition-colors duration-300">
          {pkg.title}
        </h3>

        {/* Hover Reveal: Price & CTA */}
        <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-hover:mt-2 transition-all duration-400 ease-out">
          <div className="overflow-hidden">
            <div className="flex items-center justify-between pt-2 border-t border-white/15">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-ivory/60">From </span>
                <span className="text-xs font-semibold text-gold font-sans">{inr(pkg.price_inr)}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory group-hover:text-gold transition-colors">
                View Journey <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DestinationCard({ dest, count = 0 }) {
  return (
    <Link to={`/destinations/${dest.id}`} className="group relative block overflow-hidden bg-forest" data-testid={`destination-card-${dest.id}`}>
      <div className="aspect-[3/4] overflow-hidden sm:aspect-[4/5]">
        <img src={img(dest.banner, 1000)} alt={dest.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-ivory sm:p-8">
        <p className="eyebrow">{dest.region}</p>
        <h3 className="mt-3 text-4xl">{dest.name}</h3>
        <p className="mt-3 line-clamp-2 text-sm text-ivory/80">{dest.tagline} — {dest.best_time}</p>
        <div className="mt-6 flex items-center justify-between border-t border-ivory/20 pt-4 text-xs uppercase tracking-[0.2em]">
          <span className="text-ivory/75">{count} {count === 1 ? "expedition" : "expeditions"}</span>
          <span className="flex items-center gap-2 text-gold">Discover <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
        </div>
      </div>
    </Link>
  );
}
