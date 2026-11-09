import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/sv/Logo";
import { scrollToTop, scrollToEl } from "@/hooks/useLenis";

const PUBLIC_URL = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

// Seven travel segments arranged in a symmetric 4-3-2-1-2-3-4 hierarchy
// with WILDLIFE (1) highlighted at the center and matching pairs radiating outward
const SLICES = [
  {
    id: "adventure",
    name: "Nature & Adventure",
    title: "NATURE & ADVENTURE",
    subtitle: "High-Altitude Trails & Passes",
    gif: `${PUBLIC_URL}/assets/segments/nature_adventure_home.gif`,
    poster: `${PUBLIC_URL}/assets/segments/nature_adventure_home.jpeg`,
    code: "04",
    rank: 4,
  },
  {
    id: "corporate",
    name: "Corporate MICE",
    title: "CORPORATE MICE",
    subtitle: "Off-sites & Leadership Retreats",
    gif: `${PUBLIC_URL}/assets/segments/corporate_trip.gif`,
    poster: `${PUBLIC_URL}/assets/segments/corporate_home.jpg`,
    code: "03",
    rank: 3,
  },
  {
    id: "leisure",
    name: "Leisure",
    title: "LEISURE",
    subtitle: "Slow Travel & Private Villas",
    gif: `${PUBLIC_URL}/assets/segments/leisure_trip.gif`,
    poster: `${PUBLIC_URL}/assets/segments/leisure_home.jpeg`,
    code: "02",
    rank: 2,
  },
  {
    id: "wildlife",
    name: "Wildlife",
    title: "WILDLIFE",
    subtitle: "Private Safaris & Reserves",
    gif: `${PUBLIC_URL}/assets/segments/hero_vdo.gif`,
    poster: `${PUBLIC_URL}/assets/segments/wildlife_home.jpg`,
    code: "01",
    rank: 1,
    isCenter: true,
  },
  {
    id: "spiritual",
    name: "Spiritual",
    title: "SPIRITUAL",
    subtitle: "Sacred Ghats & Ashrams",
    gif: `${PUBLIC_URL}/assets/segments/spiritual_home.gif`,
    poster: `${PUBLIC_URL}/assets/segments/spiritual_home.jpg`,
    code: "02",
    rank: 2,
  },
  {
    id: "school",
    name: "School Trips",
    title: "SCHOOL TRIPS",
    subtitle: "Educational Field Expeditions",
    gif: `${PUBLIC_URL}/assets/segments/school_trip_home.gif`,
    poster: `${PUBLIC_URL}/assets/segments/schooltrip_home.jpg`,
    code: "03",
    rank: 3,
  },
  {
    id: "culture",
    name: "Culture & Heritage",
    title: "CULTURE & HERITAGE",
    subtitle: "Forts, Folklore & Artisans",
    gif: `${PUBLIC_URL}/assets/segments/heritage.gif`,
    poster: `${PUBLIC_URL}/assets/segments/heritage_home.jpg`,
    code: "04",
    rank: 4,
  },
];

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Category", to: "/#category", selector: '[data-testid="segments-showcase"]' },
  { label: "Destination", to: "/destinations" },
  { label: "Packages", to: "/packages" },
  { label: "Gallery", to: "/gallery" },
  { label: "Blog", to: "/blog" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact Us", to: "/contact" },
  { label: "About Us", to: "/#about", selector: '[data-testid="why-section"]' },
  { label: "Philosophy", to: "/#philosophy", selector: '[data-testid="brand-story"]' },
  { label: "FAQ", to: "/#faq", selector: '[data-testid="faq-section"]' },
  { label: "Plan Your Journey", to: "/contact", cta: true },
];

export default function Hero({ segments, active, onSelect }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const activeId = active?.id || null;

  const handleSelect = (id) => {
    if (onSelect) onSelect(id);
  };

  const handleHomeClick = (e) => {
    if (e) e.preventDefault();
    setHoveredIndex(null);
    if (activeId) {
      if (onSelect) onSelect(null);
      window.dispatchEvent(new Event("sv:reset-home"));
      scrollToTop();
    } else {
      const storyEl = document.querySelector('[data-testid="brand-story"]');
      if (window.scrollY < 100 && storyEl) {
        scrollToEl(storyEl, 0);
      } else {
        scrollToTop();
      }
    }
  };

  const handleNavClick = (e, link) => {
    if (link.to === "/") {
      handleHomeClick(e);
      return;
    }
    if (link.selector) {
      e.preventDefault();
      setHoveredIndex(null);
      if (activeId) {
        if (onSelect) onSelect(null);
        window.dispatchEvent(new Event("sv:reset-home"));
        setTimeout(() => {
          const el = document.querySelector(link.selector);
          if (el) scrollToEl(el, -70);
        }, 120);
      } else {
        const el = document.querySelector(link.selector);
        if (el) scrollToEl(el, -70);
      }
    }
  };

  return (
    <section
      className="relative h-[100svh] min-h-[580px] w-full overflow-hidden bg-[#0A1410] select-none"
      data-testid="home-hero"
    >
      {/* ==========================================
          SEVEN VERTICAL ACCORDION SLICES (FULL 100svh)
      ========================================== */}
      <div className="relative flex h-full w-full flex-col sm:flex-row">
        {SLICES.map((slice, index) => {
          const isHovered = hoveredIndex === index;
          const isAnyHovered = hoveredIndex !== null;
          const isSelected = activeId === slice.id;
          const isActiveSlice = isHovered || isSelected;
          const isCenterDefault =
            Boolean(slice.isCenter) && !isAnyHovered && !activeId;

          // Symmetric 4 - 3 - 2 - 1 - 2 - 3 - 4 traits by rank (1 = Center Wildlife)
          const defaultFlexByRank = {
            1: "1.45",
            2: "1.14",
            3: "0.98",
            4: "0.86",
          };
          const defaultFilterByRank = {
            1: "blur(0.6px) brightness(1.02)",
            2: "blur(1.7px) brightness(0.90)",
            3: "blur(2.4px) brightness(0.82)",
            4: "blur(3.1px) brightness(0.74)",
          };
          const defaultScaleByRank = {
            1: 1.06,
            2: 1,
            3: 0.96,
            4: 0.92,
          };

          let flexVal = defaultFlexByRank[slice.rank] || "1";
          if (isHovered) {
            flexVal = "3.4";
          } else if (isAnyHovered) {
            flexVal = "0.68";
          } else if (isSelected) {
            flexVal = "2.4";
          }

          return (
            <div
              key={slice.id}
              onClick={() => handleSelect(slice.id)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative h-full cursor-pointer overflow-hidden border-b sm:border-b-0 border-[#E5B85B]/30 transform-gpu"
              style={{
                flex: flexVal,
                transition:
                  "flex 0.85s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                willChange: "flex",
              }}
              data-testid={`hero-slice-${slice.id}`}
            >
              {/* ── Background Media with Seamless Crossfade ── */}
              <div className="absolute inset-0 h-full w-full overflow-hidden">
                {/* Poster Image */}
                <img
                  src={slice.poster}
                  alt={slice.name}
                  className="absolute inset-0 h-full w-full object-cover transform-gpu"
                  style={{
                    transform: isActiveSlice
                      ? "scale(1.07)"
                      : isCenterDefault
                      ? "scale(1.05)"
                      : "scale(1.03)",
                    filter: isActiveSlice
                      ? "blur(0px) brightness(1)"
                      : isAnyHovered
                      ? "blur(3px) brightness(0.72)"
                      : defaultFilterByRank[slice.rank] ||
                        "blur(2.2px) brightness(0.88)",
                    transition:
                      "transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), filter 0.75s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />

                {/* Animated GIF — kept mounted for zero-flicker smooth crossfade on hover */}
                <img
                  src={slice.gif}
                  alt={slice.name}
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover transform-gpu pointer-events-none"
                  style={{
                    opacity: isActiveSlice ? 1 : 0,
                    transform: isActiveSlice ? "scale(1.04)" : "scale(1.1)",
                    transition:
                      "opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />

                {/* Cinematic Multi-Stop Scrim for Perfect Typography Legibility */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isActiveSlice
                      ? "linear-gradient(to top, rgba(8,18,14,0.82) 0%, rgba(8,18,14,0.18) 42%, rgba(8,18,14,0.08) 100%)"
                      : isAnyHovered
                      ? "linear-gradient(to bottom, rgba(8,18,14,0.45) 0%, rgba(8,18,14,0.52) 50%, rgba(8,18,14,0.62) 100%)"
                      : isCenterDefault
                      ? "radial-gradient(ellipse at center, rgba(243,208,120,0.08) 0%, rgba(10,20,16,0.22) 75%), linear-gradient(to bottom, rgba(10,20,16,0.18) 0%, rgba(10,20,16,0.14) 50%, rgba(10,20,16,0.38) 100%)"
                      : "radial-gradient(ellipse at center, rgba(10,20,16,0.34) 0%, rgba(10,20,16,0.18) 70%), linear-gradient(to bottom, rgba(10,20,16,0.28) 0%, rgba(10,20,16,0.22) 50%, rgba(10,20,16,0.44) 100%)",
                    transition: "background 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />

                {/* Center Slice Subtle Gold Highlight Frame (Left + Right + Top Glow) */}
                {slice.isCenter && (
                  <>
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0 w-[1.5px] transition-opacity duration-700"
                      style={{
                        opacity: isCenterDefault || isActiveSlice ? 1 : 0.35,
                        background:
                          "linear-gradient(to bottom, rgba(243,208,120,0.35), rgba(243,208,120,0.95), rgba(243,208,120,0.35))",
                        boxShadow: "0 0 12px rgba(243,208,120,0.55)",
                      }}
                    />
                    <div
                      className="pointer-events-none absolute top-0 inset-x-0 h-[2px] transition-opacity duration-700"
                      style={{
                        opacity: isCenterDefault || isActiveSlice ? 1 : 0,
                        background:
                          "linear-gradient(to right, transparent, #F3D078, transparent)",
                        boxShadow: "0 0 14px rgba(243,208,120,0.75)",
                      }}
                    />
                  </>
                )}

                {/* Refined Champagne-Gold Vertical Hairline Divider */}
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-[1.5px] transition-opacity duration-700"
                  style={{
                    background:
                      isActiveSlice || isCenterDefault
                        ? "linear-gradient(to bottom, rgba(243,208,120,0.35), rgba(243,208,120,0.95), rgba(243,208,120,0.35))"
                        : "linear-gradient(to bottom, rgba(216,198,165,0.2), rgba(229,184,91,0.65), rgba(216,198,165,0.2))",
                    boxShadow:
                      isActiveSlice || isCenterDefault
                        ? "0 0 12px rgba(243,208,120,0.55)"
                        : "none",
                  }}
                />
              </div>

              {/* ==========================================
                  INITIAL STATE: Uniform Luxury Engraved Vertical Title
                  (4-3-2-1-2-3-4 symmetry with Center Wildlife subtly highlighted)
              ========================================== */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.85,
                  delay: 0.06 * Math.abs(index - 3),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center pb-14"
              >
                <div
                  className="flex flex-col items-center justify-center transform-gpu"
                  style={{
                    opacity: isActiveSlice
                      ? 0
                      : isAnyHovered
                      ? 0.6
                      : isCenterDefault
                      ? 1
                      : 0.92 - (slice.rank - 1) * 0.05,
                    transform: isActiveSlice
                      ? "translateY(-12px) scale(0.95)"
                      : `translateY(0px) scale(${
                          defaultScaleByRank[slice.rank] || 1
                        })`,
                    transition:
                      "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Top Architectural Rank Numeral (04 - 03 - 02 - 01 - 02 - 03 - 04) & Gold Hairline */}
                  <span
                    className={`hidden sm:block font-serif italic tracking-[0.22em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] ${
                      isCenterDefault
                        ? "text-xs font-semibold text-[#F3D078]"
                        : "text-[11px] text-[#F3D078]/85"
                    }`}
                  >
                    {slice.code}
                  </span>
                  <span
                    className={`hidden sm:block my-2.5 w-[1px] bg-gradient-to-b from-[#F3D078] via-[#F3D078]/45 to-transparent ${
                      isCenterDefault ? "h-7 lg:h-8" : "h-5 lg:h-6"
                    }`}
                  />

                  {/* Uniform Engraved Luxury Vertical Title */}
                  <span
                    className="font-['Cinzel',serif] text-base sm:text-lg md:text-xl lg:text-[22px] xl:text-[25px] font-semibold uppercase tracking-[0.26em] lg:tracking-[0.3em] whitespace-nowrap sm:[writing-mode:vertical-rl] select-none"
                    style={{
                      backgroundImage: isCenterDefault
                        ? "linear-gradient(90deg, #FFFFFF 0%, #FFF6DF 35%, #F3D078 70%, #FFFFFF 100%)"
                        : "linear-gradient(90deg, #FFFFFF 0%, #FDF8EE 38%, #F3D9A4 72%, #FFFDF9 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      WebkitTextStroke: isCenterDefault
                        ? "0.55px rgba(243, 208, 120, 0.8)"
                        : "0.45px rgba(255, 250, 240, 0.65)",
                      filter: isCenterDefault
                        ? "drop-shadow(0 2px 5px rgba(0, 0, 0, 0.92)) drop-shadow(0 8px 24px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 18px rgba(243, 208, 120, 0.45))"
                        : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9)) drop-shadow(0 8px 22px rgba(0, 0, 0, 0.65)) drop-shadow(0 0 14px rgba(243, 208, 120, 0.22))",
                    }}
                  >
                    {slice.title}
                  </span>

                  {/* Bottom Gold Diamond & Hairline Ornament (Desktop/Tablet) */}
                  <span className="hidden sm:block mt-2.5 h-5 lg:h-6 w-[1px] bg-gradient-to-t from-[#F3D078]/80 via-[#F3D078]/40 to-transparent" />
                  <span className="hidden sm:block h-1.5 w-1.5 rotate-45 border border-[#F3D078]/80 shadow-[0_0_8px_rgba(243,208,120,0.5)]" />
                </div>
              </motion.div>

              {/* ==========================================
                  HOVER / SELECTED STATE: Subtle Editorial Reveal
                  (No heavy container box — clean luxury typography)
              ========================================== */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-16 sm:bottom-20 z-10 flex flex-col justify-end px-5 sm:px-7 lg:px-9 text-ivory transform-gpu"
                style={{
                  opacity: isActiveSlice ? 1 : 0,
                  transform: isActiveSlice
                    ? "translateY(0px)"
                    : "translateY(14px)",
                  transition:
                    "opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.06s, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.06s",
                }}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="font-serif italic text-xs sm:text-sm tracking-[0.22em] text-[#F3D078]">
                    {slice.code}
                  </span>
                  <span className="h-[1px] w-10 bg-gradient-to-r from-[#F3D078] to-transparent" />
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-[#F3D078]/90 font-medium">
                    Sacred Vista
                  </span>
                </div>

                <h2
                  className="font-['Cinzel',serif] text-lg sm:text-2xl lg:text-[28px] font-semibold tracking-[0.18em] uppercase text-ivory leading-tight whitespace-nowrap"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, #FFFFFF 0%, #FAF3E3 60%, #E8C988 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.85))",
                  }}
                >
                  {slice.title}
                </h2>

                <p className="mt-1.5 text-xs sm:text-sm text-[#FAF6EE]/90 font-light tracking-wider line-clamp-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)]">
                  {slice.subtitle}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.26em] font-semibold text-[#F3D078]">
                  <span>Explore Journey</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              {/* Selected Indicator Bottom Gold Rim */}
              {isSelected && (
                <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#B68B50] via-[#F3D078] to-[#B68B50] shadow-[0_0_16px_rgba(243,208,120,0.85)]" />
              )}
            </div>
          );
        })}
      </div>

      {/* ==========================================
          CENTERED SCULPTED IVORY BRAND & NAV DOCK
      ========================================== */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.85,
            delay: 0.25,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="pointer-events-auto relative flex flex-col items-center rounded-t-[22px] border-t border-x border-[#D8C6A5]/70 bg-[#FAF6EE] px-5 sm:px-8 lg:px-10 pt-2.5 pb-2.5 sm:pb-3 shadow-[0_-12px_40px_rgba(0,0,0,0.5)]"
        >
          {/* Central Raised Arch / Dome for Logo */}
          <svg
            viewBox="0 0 220 58"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute -top-[52px] left-1/2 -translate-x-1/2 w-[170px] sm:w-[200px] h-[54px] block"
            aria-hidden="true"
          >
            <path
              d="M0,58 C36,58 46,4 110,4 C174,4 184,58 220,58 Z"
              fill="#FAF6EE"
            />
            <path
              d="M0,56.5 C36,56.5 46,4 110,4 C174,4 184,56.5 220,56.5"
              fill="none"
              stroke="#D8C6A5"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />
          </svg>

          {/* Central Logo nestled inside the dome */}
          <button
            type="button"
            onClick={handleHomeClick}
            aria-label="Sacred Vista home"
            className="relative z-20 -mt-[44px] sm:-mt-[46px] mb-1 flex items-center justify-center cursor-pointer"
          >
            <Logo
              light={false}
              className="h-10 sm:h-11 lg:h-12 w-auto drop-shadow-none"
            />
          </button>

          {/* Compact Navigation Links Bar */}
          <nav className="relative z-20 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 sm:gap-x-3.5 lg:gap-x-4">
            {NAV_LINKS.map((link, index) => (
              <div
                key={link.label}
                className="flex items-center gap-x-2.5 sm:gap-x-3.5 lg:gap-x-4"
              >
                <Link
                  to={link.to}
                  onClick={(e) => handleNavClick(e, link)}
                  className={
                    link.cta
                      ? "group inline-flex items-center gap-1.5 rounded-full border border-[#B68B50]/75 px-3.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-semibold text-[#A77B42] transition-all duration-300 hover:bg-[#B68B50] hover:text-[#FAF6EE] hover:shadow-[0_4px_14px_rgba(182,139,80,0.25)] whitespace-nowrap"
                      : `group relative inline-flex items-center py-0.5 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] font-medium whitespace-nowrap transition-colors duration-300 hover:text-[#B68B50] ${
                          link.to === "/" && !activeId
                            ? "text-[#B68B50]"
                            : "text-[#344638]/80"
                        }`
                  }
                >
                  {link.label}
                  {!link.cta && (
                    <span
                      className={`absolute bottom-0 left-0 h-[1px] bg-[#B68B50] transition-all duration-300 ${
                        link.to === "/" && !activeId
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    />
                  )}
                  {link.cta && (
                    <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </Link>

                {index !== NAV_LINKS.length - 1 && (
                  <span className="hidden sm:block h-[3px] w-[3px] rounded-full bg-[#B68B50]/45" />
                )}
              </div>
            ))}
          </nav>
        </motion.div>
      </div>
    </section>
  );
}
