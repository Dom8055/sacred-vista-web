import { motion } from "framer-motion";
import { Compass, RotateCcw } from "lucide-react";
import { INDIA_BOX, INDIA_PATH, KENYA_BOX, KENYA_PATH } from "@/data/mapGeo";

export const project = (box, lat, lng) => {
  const numLat = Number(lat);
  const numLng = Number(lng);
  const effectiveLat =
    !isNaN(numLat) && numLat !== 0 ? numLat : (box.lat0 + box.lat1) / 2;
  const effectiveLng =
    !isNaN(numLng) && numLng !== 0 ? numLng : (box.lon0 + box.lon1) / 2;
  const k = Math.cos((((box.lat0 + box.lat1) / 2) * Math.PI) / 180);
  const sx = box.w / ((box.lon1 - box.lon0) * k);
  const rawX = (((effectiveLng - box.lon0) * k * sx) / box.w) * 100;
  const rawY = (((box.lat1 - effectiveLat) * sx) / box.h) * 100;
  return {
    x: Math.max(6, Math.min(94, rawX)),
    y: Math.max(6, Math.min(94, rawY)),
  };
};

const ZOOM = 1.42;

function Pin({
  d,
  pos,
  selected,
  highlighted = true,
  dimmed,
  pkgCount = 0,
  onSelect,
  counter = 1,
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(d.id)}
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 p-3 focus-visible:outline-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      animate={{ scale: counter, opacity: dimmed ? 0.35 : 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`${d.name}, ${d.region}`}
      aria-pressed={selected}
      data-testid={`map-pin-${d.id}`}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        {/* Pulsing halo for selected or segment-highlighted pins */}
        {(selected || highlighted) && (
          <span
            className={`absolute inset-0 rounded-full ${
              selected
                ? "animate-ping2 bg-gold"
                : "animate-pulse bg-gold/45 scale-125"
            }`}
          />
        )}

        {/* Outer ring when selected */}
        {selected && (
          <span className="absolute -inset-2.5 rounded-full border border-gold/90 bg-gold/15 shadow-[0_0_20px_rgba(182,139,80,0.75)]" />
        )}

        {/* Core pin dot */}
        <motion.span
          animate={{ scale: selected ? 1.45 : highlighted ? 1.15 : 0.95 }}
          transition={{ duration: 0.26 }}
          className={`relative h-3.5 w-3.5 rounded-full border-2 shadow-[0_0_12px_rgba(0,0,0,0.6)] transition-colors ${
            selected
              ? "border-ivory bg-gold"
              : highlighted
              ? "border-gold bg-ivory group-hover:bg-gold"
              : "border-ivory/50 bg-forest/90 group-hover:border-gold"
          }`}
        />

        {/* Expedition count micro-badge */}
        {pkgCount > 0 && (
          <span
            className={`pointer-events-none absolute -right-2.5 -top-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border px-1 font-mono text-[9px] font-bold leading-none shadow-md transition-colors ${
              selected
                ? "border-forest bg-gold text-forest"
                : "border-gold/60 bg-forest/90 text-gold"
            }`}
          >
            {pkgCount}
          </span>
        )}
      </span>

      {/* Glassmorphic Floating Pin Tooltip */}
      <span
        className={`pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl border border-gold/50 bg-[#0d1d16]/85 px-3.5 py-2 text-left text-ivory shadow-[0_14px_35px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-xl transition-[opacity,transform] duration-300 ${
          selected
            ? "-translate-y-[110%] opacity-100"
            : "translate-y-[-85%] opacity-0 group-hover:-translate-y-[110%] group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="font-serif text-sm font-medium text-ivory">
            {d.name}
          </span>
          {pkgCount > 0 && (
            <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
              {pkgCount} {pkgCount === 1 ? "tour" : "tours"}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[9px] uppercase tracking-[0.18em] text-gold/85">
          {d.region}
        </span>
      </span>
    </motion.button>
  );
}

export default function WorldMap({
  destinations,
  selectedId,
  onSelect,
  highlightedIds = null,
  packageCounts = {},
}) {
  const india = destinations.filter((d) => d.continent === "asia");
  const africa = destinations.filter((d) => d.continent !== "asia");
  const sel = destinations.find((d) => d.id === selectedId);
  const focus =
    sel && sel.continent === "asia"
      ? project(INDIA_BOX, sel.lat, sel.lng)
      : null;
  const tx = focus ? `${(50 - focus.x) * ZOOM * 0.7}%` : "0%";
  const ty = focus ? `${(50 - focus.y) * ZOOM * 0.7}%` : "0%";

  const isHighlighted = (id) =>
    !highlightedIds || highlightedIds.length === 0 || highlightedIds.includes(id);

  return (
    <div className="relative mx-auto w-full" data-testid="world-map">
      {/* Top Cartographic Glass Telemetry Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-[10px] uppercase tracking-[0.22em] text-ivory/80 backdrop-blur-md">
        <span className="inline-flex items-center gap-2 text-gold">
          <Compass className="h-3.5 w-3.5" />
          <span>Expedition Cartography · India &amp; East Africa</span>
        </span>
        <div className="flex items-center gap-3">
          {sel ? (
            <>
              <span className="font-mono text-[10px] text-ivory/90">
                {Number(sel.lat).toFixed(2)}° {sel.lat >= 0 ? "N" : "S"} ·{" "}
                {Number(sel.lng).toFixed(2)}° E
              </span>
              <button
                type="button"
                onClick={() => onSelect(sel.id)}
                className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-forest"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Reset Zoom
              </button>
            </>
          ) : (
            <span className="text-ivory/60">Click any reserve pin to focus</span>
          )}
        </div>
      </div>

      {/* Main Map Stage */}
      <div className="relative overflow-hidden rounded-xl border border-white/15 bg-black/25 p-3 sm:p-5 backdrop-blur-md">
        {/* Subtle Cartographic Grid Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(182,139,80,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(182,139,80,0.22) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div
          className="relative ml-[18%] w-[82%] overflow-hidden"
          style={{ aspectRatio: `${INDIA_BOX.w} / ${INDIA_BOX.h}` }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ scale: focus ? ZOOM : 1, x: tx, y: ty }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg
              viewBox={`0 0 ${INDIA_BOX.w} ${INDIA_BOX.h}`}
              className="absolute inset-0 h-full w-full drop-shadow-[0_16px_32px_rgba(0,0,0,0.55)]"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="sv-dots"
                  width="7"
                  height="7"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="3.5"
                    cy="3.5"
                    r="1.15"
                    fill="#D8C9AD"
                    opacity="0.55"
                  />
                </pattern>
                <linearGradient id="sv-india-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e382d" />
                  <stop offset="100%" stopColor="#11221b" />
                </linearGradient>
                <clipPath id="sv-india">
                  <path d={INDIA_PATH} />
                </clipPath>
              </defs>
              <path d={INDIA_PATH} fill="url(#sv-india-fill)" />
              <rect
                width="100%"
                height="100%"
                fill="url(#sv-dots)"
                clipPath="url(#sv-india)"
              />
              <path
                d={INDIA_PATH}
                fill="none"
                stroke="#B68B50"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
            </svg>
            {india.map((d) => {
              const highlighted = isHighlighted(d.id);
              const dimmed =
                (!!selectedId && d.id !== selectedId) ||
                (!selectedId && !highlighted);
              return (
                <Pin
                  key={d.id}
                  d={d}
                  pos={project(INDIA_BOX, d.lat, d.lng)}
                  selected={d.id === selectedId}
                  highlighted={highlighted}
                  dimmed={dimmed}
                  pkgCount={packageCounts[d.id] || 0}
                  onSelect={onSelect}
                  counter={focus ? 1 / ZOOM : 1}
                />
              );
            })}
          </motion.div>
          <span className="pointer-events-none absolute right-2 top-2 rounded-full border border-gold/30 bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold backdrop-blur-md">
            India Subcontinent
          </span>
        </div>

        {/* East Africa / Kenya Glassmorphic Inset */}
        {africa.length > 0 && (
          <motion.div
            className={`absolute bottom-3 left-3 w-[30%] rounded-xl border bg-[#0d1d16]/80 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-xl transition-colors duration-500 sm:bottom-5 sm:left-5 ${
              sel?.continent === "africa"
                ? "border-gold"
                : "border-gold/35 hover:border-gold/65"
            }`}
            animate={{ scale: sel?.continent === "africa" ? 1.06 : 1 }}
            style={{ transformOrigin: "bottom left" }}
            data-testid="kenya-inset"
          >
            <div className="mb-1.5 flex items-center justify-between gap-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                Kenya · East Africa
              </p>
              <span className="text-[8px] uppercase tracking-widest text-ivory/50">
                Inset
              </span>
            </div>
            <div
              className="relative"
              style={{ aspectRatio: `${KENYA_BOX.w} / ${KENYA_BOX.h}` }}
            >
              <svg
                viewBox={`0 0 ${KENYA_BOX.w} ${KENYA_BOX.h}`}
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <path
                  d={KENYA_PATH}
                  fill="#1c3329"
                  stroke="#B68B50"
                  strokeWidth="1.5"
                />
              </svg>
              {africa.map((d) => {
                const highlighted = isHighlighted(d.id);
                const dimmed =
                  (!!selectedId && d.id !== selectedId) ||
                  (!selectedId && !highlighted);
                return (
                  <Pin
                    key={d.id}
                    d={d}
                    pos={project(KENYA_BOX, d.lat, d.lng)}
                    selected={d.id === selectedId}
                    highlighted={highlighted}
                    dimmed={dimmed}
                    pkgCount={packageCounts[d.id] || 0}
                    onSelect={onSelect}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
