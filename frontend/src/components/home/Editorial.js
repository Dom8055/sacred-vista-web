import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { img } from "@/lib/sv";
import { MaskLines, Reveal, SectionHead } from "@/components/sv/Motion";
import Lightbox from "@/components/sv/Lightbox";

const BANNER = "https://images.unsplash.com/photo-1586618749351-8b86b75c5320?auto=format&fit=crop&q=80";

export function WildlifeBanner() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const tx = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  return (
    <section ref={ref} className="grain relative flex min-h-[90vh] items-center overflow-hidden bg-forest text-ivory" data-testid="wildlife-banner">
      <motion.img style={{ y }} src={img(BANNER, 2200)} alt="A Bengal tiger moving through dense green forest" loading="lazy" className="absolute inset-0 h-[124%] w-full -top-[12%] object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/60 to-forest/10" />
      <motion.p style={{ x: tx }} className="pointer-events-none absolute bottom-6 right-0 select-none font-serif text-[22vw] italic leading-none text-ivory/[0.07]" aria-hidden="true">Panthera</motion.p>
      <div className="shell relative z-10 py-28">
        <p className="eyebrow mb-6">Chapter II — The Forest</p>
        <MaskLines lines={["Where silence", "has stripes."]} className="text-6xl leading-[0.98] sm:text-7xl lg:text-9xl" lineClassName="[&:nth-child(2)]:italic [&:nth-child(2)]:text-sand" />
        <Reveal delay={0.2} as="p" className="mt-8 max-w-md text-base leading-relaxed text-ivory/80 md:text-lg">Hours of stillness, then a heartbeat. Our naturalists teach you to read alarm calls, fresh pugmarks and the language of the forest.</Reveal>
        <Reveal delay={0.3}><Link to="/gallery" className="btn-gold mt-10" data-testid="banner-gallery-btn">Enter the Gallery <ArrowUpRight className="h-4 w-4" /></Link></Reveal>
      </div>
    </section>
  );
}

const SPANS = ["col-span-2 row-span-2", "col-span-2", "col-span-1", "col-span-1"];

export function GalleryPreview({ gallery }) {
  const items = gallery.slice(0, 4);
  const [index, setIndex] = useState(null);
  return (
    <section className="bg-ivory py-28 sm:py-36" data-testid="gallery-preview">
      <div className="shell">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHead eyebrow="Field notes in light" title={["Moments from", "the field."]} />
          <Reveal><Link to="/gallery" className="link-line text-sm font-semibold uppercase tracking-[0.2em] text-forest" data-testid="gallery-preview-view-all">View full gallery <ArrowUpRight className="h-4 w-4" /></Link></Reveal>
        </div>
        <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4 lg:auto-rows-[260px]">
          {items.map((g, i) => (
            <Reveal key={g.id} delay={i * 0.08} className={SPANS[i]}>
              <button type="button" onClick={() => setIndex(i)} className="group relative h-full w-full overflow-hidden bg-forest" data-testid={`gallery-preview-item-${g.id}`} aria-label={`Open ${g.title}`}>
                <img src={img(g.image, i === 0 ? 1400 : 800)} alt={g.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110" />
                <span className="absolute inset-0 bg-forest/0 transition-colors duration-500 group-hover:bg-forest/40" />
                <span className="absolute bottom-0 left-0 translate-y-3 p-4 text-left text-ivory opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="block font-serif text-lg">{g.title}</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-sand">{g.location}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      <Lightbox items={items} index={index} onChange={setIndex} onClose={() => setIndex(null)} />
    </section>
  );
}
