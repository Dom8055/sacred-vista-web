import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { img } from "@/lib/sv";
import { MaskLines, Reveal } from "@/components/sv/Motion";

const A = "https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&q=80";
const B = "https://images.unsplash.com/photo-1534759846116-5799c33ce22a?auto=format&fit=crop&q=80";

export default function BrandStory() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["30%", "-25%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ivory py-28 sm:py-40" data-testid="brand-story">
      <div className="shell grid items-center gap-16 lg:grid-cols-12">
        <div className="relative lg:col-span-6">
          <motion.div style={{ y: y1 }} className="relative aspect-[4/5] w-[82%] overflow-hidden">
            <img src={img(A, 1200)} alt="Mist rolling over a forest canopy at dawn" loading="lazy" className="h-full w-full object-cover" />
          </motion.div>
          <motion.div style={{ y: y2 }} className="absolute -bottom-6 right-0 aspect-[3/4] w-[46%] overflow-hidden border-[10px] border-ivory shadow-[0_30px_60px_rgba(20,39,31,0.25)]">
            <img src={img(B, 800)} alt="A leopard surveying its territory from a rock" loading="lazy" className="h-full w-full object-cover" />
          </motion.div>
          <p className="absolute -left-2 top-6 origin-left -rotate-90 translate-y-[16rem] text-[11px] uppercase tracking-[0.4em] text-char/60">Field Journal — No. 01</p>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal as="p" className="eyebrow mb-4">Our philosophy</Reveal>
          <MaskLines
            lines={["We don't sell trips.", "We open doors", "to the wild."]}
            className="text-2xl leading-[1.12] text-forest sm:text-3xl lg:text-4xl"
            lineClassName="[&:nth-child(3)]:italic"
          />
          <Reveal delay={0.2} className="mt-7 space-y-4 text-sm leading-relaxed text-char/80 md:text-base">
            <p>Sacred Vista began with a simple belief: the most extraordinary journeys are quiet ones. A tigress crossing a forest road at first light. Rhino grazing in mist. A monastery bell carrying across a frozen valley.</p>
            <p>We compose each expedition by hand — choosing the season, the naturalist, the lodge and the pace — so that you spend less time arranging and more time simply being there.</p>
            <p>Whether tracking big cats across Central India, walking high-altitude passes in the Himalayas, or sharing unhurried evenings in timeless heritage estates, every detail is shaped with deep respect for the land and the communities who call it home.</p>
          </Reveal>
          <Reveal delay={0.3} className="mt-9 flex items-center gap-4 border-t border-char/15 pt-6">
            <span className="font-serif text-4xl italic text-gold">“</span>
            <p className="font-serif text-lg italic text-forest">The wild rewards those who arrive slowly.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
