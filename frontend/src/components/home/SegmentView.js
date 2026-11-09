import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { img } from "@/lib/sv";
import { PackageCard } from "@/components/sv/Cards";
import { MaskLines, Reveal } from "@/components/sv/Motion";
import { CatalogGate } from "@/components/sv/States";
import InquiryForm from "@/components/sv/InquiryForm";
import Lightbox from "@/components/sv/Lightbox";
import MapExplorer from "@/components/home/MapExplorer";
import InquiryPanel from "@/components/home/InquiryPanel";

/* ─── stagger preset ─── */
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
});

export default function SegmentView({ segment, onReset }) {
  const { packagesForSegment, gallery } = useCatalog();
  const pkgs = packagesForSegment(segment?.id);
  const moments = gallery.slice(0, 4);
  const [index, setIndex] = useState(null);

  if (!segment) return null;

  return (
    <motion.div
      key={segment.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      data-testid={`segment-view-${segment.id}`}
    >
      {/* ── Top two-column area: Left (Hero + Packages), Right (Glassmorphic Inquiry Panel) ── */}
      <div className="relative grid grid-cols-1 xl:grid-cols-[1fr_410px] items-start bg-ivory">
        <div className="min-w-0">
          {/* ── Segment hero card ── */}
          <section className="bg-ivory px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <motion.div {...fade(0)} className="grain relative overflow-hidden rounded-sm bg-forest p-5 text-ivory sm:p-8 lg:p-10">
              {/* Back link */}
              <button
                type="button"
                onClick={onReset}
                className="link-line relative z-10 mb-4 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-gold/70 hover:text-gold transition-colors"
                data-testid="segment-view-reset-btn"
              >
                ← All experiences
              </button>

              <p className="eyebrow relative z-10 mb-2 text-gold/80">{segment.label}</p>
              <MaskLines
                lines={[segment.headline]}
                className="relative z-10 max-w-2xl text-2xl leading-[1.08] sm:text-3xl lg:text-4xl"
              />
              <p className="relative z-10 mt-3 max-w-xl text-xs leading-relaxed text-ivory/65 sm:text-sm">
                {segment.description}
              </p>
            </motion.div>
          </section>

          {/* ── Packages ── */}
          <section className="bg-ivory px-4 pb-10 sm:px-6 lg:px-8">
            <motion.div {...fade(0.1)} className="mb-6 flex items-end justify-between gap-3 border-t border-char/10 pt-6">
              <div>
                <p className="eyebrow mb-1">Curated expeditions</p>
                <h2 className="text-2xl text-forest sm:text-3xl">{segment.name} journeys</h2>
              </div>
              <Link
                to={`/packages?segment=${segment.id}`}
                className="btn-dark shrink-0 !py-2 !px-4 !text-xs"
                data-testid="segment-view-all-btn"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pkgs.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.07}>
                  <PackageCard pkg={p} index={i} compact />
                </Reveal>
              ))}
            </div>
          </section>
        </div>

        {/* Right — sticky glassmorphic inquiry panel */}
        <aside className="hidden xl:block pr-6 py-8">
          <div className="sticky top-24">
            <InquiryPanel segment={segment} />
          </div>
        </aside>
      </div>

      {/* ── Full-Width Interactive Segment Map Explorer (Glassmorphic) ── */}
      <MapExplorer segment={segment} />

      {/* ── Cinematic banner ── */}
      <motion.section
        {...fade(0.15)}
        className="grain relative flex min-h-[35vh] items-end overflow-hidden bg-forest text-ivory"
      >
        <img
          src={img(segment.image, 1800)}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/30 to-transparent" />
        <div className="relative z-10 w-full px-4 py-6 sm:px-6 lg:px-8">
          <MaskLines
            lines={[`${segment.name},`, "made personal."]}
            className="text-3xl sm:text-4xl"
            lineClassName="[&:nth-child(2)]:italic"
          />
        </div>
      </motion.section>

      {/* ── Mobile inquiry form (hidden on xl where side panel shows) ── */}
      <section className="bg-ivory py-10 xl:hidden">
        <div className="px-4 sm:px-6">
          <CatalogGate>
            <InquiryForm key={`mobile-${segment.id}`} initialSegment={segment.id} />
          </CatalogGate>
        </div>
      </section>

      {/* ── Gallery moments ── */}
      <section className="bg-ivory py-8 sm:py-12">
        <div className="px-4 sm:px-6 lg:px-8">
          <motion.p {...fade(0)} className="eyebrow mb-4">Moments</motion.p>
          <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
            {moments.map((g, i) => (
              <Reveal key={g.id} delay={i * 0.06}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className="group aspect-square overflow-hidden"
                  data-testid={`segment-moment-${g.id}`}
                  aria-label={`Open ${g.title}`}
                >
                  <img
                    src={img(g.image, 600)}
                    alt={g.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </button>
              </Reveal>
            ))}
          </div>
        </div>
        <Lightbox items={moments} index={index} onChange={setIndex} onClose={() => setIndex(null)} />
      </section>
    </motion.div>
  );
}
