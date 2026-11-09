import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS, SITE, WHY } from "@/data/site";
import { http, img } from "@/lib/sv";
import { INITIAL_REVIEWS, SEGMENT_NAMES } from "@/pages/Reviews";
import { MaskLines, Reveal, SectionHead } from "@/components/sv/Motion";

export function WhySection({ stats }) {
  const [active, setActive] = useState(0);
  const current = WHY[active] || WHY[0];

  return (
    <section className="bg-mist py-28 sm:py-36" data-testid="why-section">
      <div className="shell">
        <SectionHead eyebrow="Why Sacred Vista" title={["Six quiet promises,", "kept on every journey."]} />
        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <div className="relative hidden lg:col-span-5 lg:block">
            <div className="group sticky top-28 aspect-[4/5] overflow-hidden bg-forest shadow-xl">
              <AnimatePresence initial={false}>
                <motion.img
                  key={active}
                  src={img(current.image, 1100)}
                  alt={current.title}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>

              {/* 70% Opacity Dark Blur Layer over the image */}
              <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-500" />

              {/* Related Section Text Content on the Image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 flex h-full flex-col justify-between p-7 sm:p-9 text-ivory"
                >
                  {/* Top Row: Index + Eyebrow Badge */}
                  <div className="flex items-center justify-between gap-4 border-b border-ivory/20 pb-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gold">
                      {current.eyebrow || "Sacred Vista Promise"}
                    </span>
                    <span className="font-serif text-4xl italic text-ivory/90">
                      0{active + 1}
                    </span>
                  </div>

                  {/* Bottom Content: Title, Description, Detail & Highlights */}
                  <div>
                    <div className="mb-3 h-[2px] w-12 bg-gold" />
                    <h3 className="font-serif text-3xl sm:text-4xl leading-tight text-ivory drop-shadow-sm">
                      {current.title}
                    </h3>
                    <p className="mt-3 text-sm sm:text-base font-medium leading-relaxed text-ivory/95">
                      {current.text}
                    </p>
                    {current.detail && (
                      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-ivory/80">
                        {current.detail}
                      </p>
                    )}

                    {current.highlights?.length > 0 && (
                      <ul className="mt-5 flex flex-wrap gap-2 border-t border-ivory/20 pt-4">
                        {current.highlights.map((item) => (
                          <li
                            key={item}
                            className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-sand"
                          >
                            <span className="h-1 w-1 rounded-full bg-gold" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <ol className="lg:col-span-7">
            {WHY.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 0.05}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="group grid w-full grid-cols-[3.5rem_1fr] gap-4 border-t border-char/15 py-7 text-left sm:grid-cols-[5rem_1fr]"
                  data-testid={`why-item-${i}`}
                >
                  <span className={`font-serif text-3xl italic transition-colors ${active === i ? "text-gold" : "text-char/40"}`}>0{i + 1}</span>
                  <span>
                    <span className={`block font-serif text-2xl transition-colors sm:text-3xl ${active === i ? "text-forest" : "text-char/80"}`}>{w.title}</span>
                    <span className="mt-2 block max-w-lg text-sm leading-relaxed text-char/75 md:text-base">{w.text}</span>
                  </span>
                </button>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const CLOSE = "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&q=80";

export function FaqSection() {
  return (
    <section id="faq" className="bg-ivory py-24 sm:py-28 border-t border-char/10" data-testid="faq-section">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead eyebrow="FAQ" title={["Questions before", "you travel."]} />
        </div>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <Accordion type="single" collapsible defaultValue="faq-0">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`} className="border-char/15">
                <AccordionTrigger className="py-6 text-left font-serif text-xl text-forest hover:no-underline" data-testid={`faq-trigger-${i}`}>
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-base leading-relaxed text-char/75">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

export function ClosingCTA() {
  return (
    <section className="grain relative overflow-hidden bg-forest text-ivory" data-testid="closing-cta">
      <img src={img(CLOSE, 2200)} alt="Elephants on the savannah at sunset" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-forest/65" />
      <div className="shell relative z-10 flex min-h-[85vh] flex-col items-start justify-center py-28">
        <p className="eyebrow mb-6">Begin here</p>
        <MaskLines lines={["Every expedition", "begins with a", "conversation."]} className="max-w-4xl text-5xl leading-[1.02] sm:text-7xl lg:text-8xl" lineClassName="[&:nth-child(3)]:italic" />
        <Reveal delay={0.2} as="p" className="mt-8 max-w-lg text-base text-ivory/80 md:text-lg">Tell us where your curiosity lives. We'll reply personally with ideas, seasons and a journey shaped around you.</Reveal>
        <Reveal delay={0.3} className="mt-10 flex flex-wrap gap-3">
          <Link to="/contact" className="btn-gold" data-testid="closing-plan-btn">Plan Your Journey <ArrowUpRight className="h-4 w-4" /></Link>
          <a href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="btn-ghost" data-testid="closing-whatsapp-btn"><MessageCircle className="h-4 w-4" /> Talk on WhatsApp</a>
        </Reveal>
      </div>
    </section>
  );
}

export function ReviewsCarousel() {
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [segmentFilter, setSegmentFilter] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    http
      .get("/reviews")
      .then((r) => {
        if (Array.isArray(r.data)) setApprovedReviews(r.data);
      })
      .catch(() => {});
  }, []);

  const allReviews = useMemo(() => {
    return [...approvedReviews, ...INITIAL_REVIEWS];
  }, [approvedReviews]);

  const filtered = useMemo(() => {
    if (segmentFilter === "All") return allReviews;
    return allReviews.filter((r) => r.segment === segmentFilter);
  }, [allReviews, segmentFilter]);

  const total = filtered.length;

  useEffect(() => {
    setCurrentIndex(0);
  }, [segmentFilter]);

  useEffect(() => {
    if (paused || total <= 1) return undefined;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused, total]);

  const step = (dir) => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + dir + total) % total);
  };

  // Build up to 3 visible cards starting from currentIndex
  const visibleCards = useMemo(() => {
    if (total === 0) return [];
    const count = Math.min(3, total);
    const items = [];
    for (let i = 0; i < count; i += 1) {
      items.push(filtered[(currentIndex + i) % total]);
    }
    return items;
  }, [filtered, currentIndex, total]);

  return (
    <section
      className="relative overflow-hidden border-y border-gold/25 bg-ivory py-24 sm:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-testid="home-reviews-carousel"
    >
      {/* Subtle ambient background accents */}
      <div className="pointer-events-none absolute -top-28 left-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-1/4 h-72 w-72 rounded-full bg-forest/5 blur-3xl" />

      <div className="shell relative z-10">
        {/* Top Header Row */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-forest px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">
              <Sparkles className="h-3 w-3" /> Guest Voices · Verified Reviews
            </div>
            <h2 className="mt-4 font-serif text-4xl leading-[1.06] text-forest sm:text-5xl">
              Stories from the wild,{" "}
              <span className="italic text-gold">in their words.</span>
            </h2>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-char/75">
              Read first-hand experiences from travellers across our seven signature segments — from tiger reserves and the Masai Mara to Himalayan valleys.
            </p>
          </div>

          {/* Right Controls: Rating Pill + Arrows + View All CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-2 flex items-center gap-2 rounded-full border border-char/15 bg-mist px-4 py-2 text-xs font-medium text-forest">
              <span className="inline-flex items-center gap-0.5 text-gold">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </span>
              <span className="font-serif text-base font-semibold text-forest">4.9</span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-char/60">
                ({allReviews.length} Reviews)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous review"
                data-testid="reviews-carousel-prev"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-char/20 bg-ivory text-forest transition-all hover:border-forest hover:bg-forest hover:text-gold"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next review"
                data-testid="reviews-carousel-next"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-char/20 bg-ivory text-forest transition-all hover:border-forest hover:bg-forest hover:text-gold"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <Link
              to="/reviews"
              className="btn-dark !px-5 !py-2.5 !text-xs"
              data-testid="reviews-carousel-all-btn"
            >
              All Reviews <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Segment Filter Pills */}
        <div
          className="no-scrollbar mt-8 flex items-center gap-2 overflow-x-auto pb-2"
          data-lenis-prevent
        >
          {["All", ...SEGMENT_NAMES].map((seg) => {
            const active = segmentFilter === seg;
            return (
              <button
                key={seg}
                type="button"
                onClick={() => setSegmentFilter(seg)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all ${
                  active
                    ? "border-forest bg-forest text-gold shadow-sm"
                    : "border-char/15 bg-mist/70 text-char/75 hover:border-gold hover:text-forest"
                }`}
              >
                {seg}
              </button>
            );
          })}
        </div>

        {/* Carousel Track */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleCards.map((r, idx) => (
              <motion.article
                key={`${r.id}-${idx}`}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-char/12 bg-white shadow-[0_18px_50px_rgba(20,39,31,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/55 hover:shadow-[0_24px_65px_rgba(20,39,31,0.14)] ${
                  idx === 2 ? "hidden lg:flex" : idx === 1 ? "hidden md:flex" : "flex"
                }`}
                data-testid={`carousel-review-card-${r.id}`}
              >
                <div>
                  {/* Card Top Image + Glassmorphic Segment & Location Badges */}
                  <div className="relative h-44 w-full overflow-hidden bg-forest">
                    {r.image && (
                      <img
                        src={img(r.image, 700)}
                        alt={r.location}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/25 to-transparent" />

                    <div className="absolute left-4 right-4 top-3.5 flex items-center justify-between gap-2">
                      <span className="rounded-full border border-white/25 bg-forest/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold backdrop-blur-md">
                        {r.segment}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-ivory backdrop-blur-md">
                        <MapPin className="h-3 w-3 text-gold" /> {r.location}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <div className="inline-flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-3.5 w-3.5 ${
                              n <= (r.rating || 5)
                                ? "fill-gold text-gold"
                                : "text-gold/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-ivory/80">
                        {r.travelDate || r.date}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-serif text-xl leading-snug text-forest">
                        “{r.title}”
                      </h3>
                      <Quote className="h-6 w-6 shrink-0 text-gold/35" />
                    </div>
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-char/75">
                      {r.review}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Traveller Info */}
                <div className="flex items-center justify-between gap-3 border-t border-char/10 bg-mist/50 px-6 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest font-serif text-sm font-semibold text-gold">
                      {(r.name || "T")
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-serif text-base font-medium text-forest">
                        {r.name}
                      </p>
                      <p className="truncate text-[11px] text-char/60">
                        {r.role || "Verified Traveller"}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/reviews?segment=${encodeURIComponent(
                      r.segment
                    )}&location=${encodeURIComponent(r.location)}`}
                    className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-gold hover:text-forest transition-colors"
                  >
                    Read More →
                  </Link>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Pagination Dots & Share Review Link */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-char/10 pt-6 sm:flex-row">
          <div className="flex items-center gap-2">
            {filtered.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to review ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-8 bg-gold"
                    : "w-2 bg-char/20 hover:bg-char/40"
                }`}
              />
            ))}
          </div>

          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-forest hover:text-gold transition-colors"
          >
            <span>Have you travelled with Sacred Vista? Share your review</span>
            <ArrowUpRight className="h-4 w-4 text-gold" />
          </Link>
        </div>
      </div>
    </section>
  );
}
