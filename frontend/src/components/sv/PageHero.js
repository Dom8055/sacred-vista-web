import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { img } from "@/lib/sv";
import { MaskLines } from "@/components/sv/Motion";

export default function PageHero({ eyebrow, title, text, image, crumbs = [], children, tall = false }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const lines = Array.isArray(title) ? title : [title];

  return (
    <section ref={ref} className={`grain relative flex ${tall ? "min-h-[88vh]" : "min-h-[70vh]"} items-end overflow-hidden bg-forest text-ivory`} data-testid="page-hero">
      {image && (
        <motion.div style={{ y }} className="absolute inset-0 -top-[6%] h-[112%]">
          <img src={img(image, 2000)} alt="" className="h-full w-full animate-kenburns object-cover" />
        </motion.div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/55 to-forest/25" />
      <div className="shell relative z-10 pb-14 pt-36 sm:pb-20">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-ivory/70" data-testid="breadcrumbs">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-2">
                {c.to ? <Link to={c.to} className="link-line hover:text-ivory">{c.label}</Link> : <span className="text-gold">{c.label}</span>}
                {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        <MaskLines as="h1" onMount lines={lines} delay={0.15} testId="page-hero-title" className="max-w-5xl text-5xl leading-[1.02] sm:text-6xl lg:text-8xl" />
        {text && <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }} className="mt-7 max-w-2xl text-base leading-relaxed text-ivory/80 md:text-lg">{text}</motion.p>}
        {children}
      </div>
    </section>
  );
}
