import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { img } from "@/lib/sv";
import { Reveal, SectionHead } from "@/components/sv/Motion";

const SPAN = { 0: "sm:col-span-2 lg:row-span-2", 6: "sm:col-span-2" };

export default function SegmentsShowcase({ segments, onSelect }) {
  return (
    <section className="grain relative bg-char py-28 text-ivory sm:py-36" data-testid="segments-showcase">
      <div className="shell relative z-10">
        <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHead dark eyebrow="Seven ways to travel" title={["Choose the shape", "of your journey."]} />
          <Reveal as="p" className="max-w-sm text-ivory/70">Each travel style reshapes the experience above — imagery, stories and curated expeditions.</Reveal>
        </div>
        <div className="grid grid-flow-dense auto-rows-[300px] grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[280px] lg:grid-cols-4">
          {segments.map((s, i) => (
            <Reveal key={s.id} delay={(i % 4) * 0.08} className={SPAN[i] || ""}>
              <button type="button" onClick={() => onSelect(s.id)} className="group relative h-full w-full overflow-hidden text-left" data-testid={`segment-tile-${s.id}`} aria-label={`Discover ${s.label}`}>
                <img src={img(s.image, i === 0 ? 1400 : 800)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-110 group-hover:-translate-y-2" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
                <span className="absolute left-5 top-5 font-serif text-sm italic text-ivory/70">0{i + 1}</span>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className={`${i === 0 ? "text-4xl lg:text-5xl" : "text-3xl"} text-ivory`}>{s.name}</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/80">{s.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">Discover <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" /></span>
                </div>
              </button>
            </Reveal>
          ))}
          <Reveal className="h-full">
            <Link to="/packages" className="group flex h-full flex-col justify-between border border-gold/40 p-6 transition-colors duration-500 hover:bg-gold hover:text-forest" data-testid="segments-view-all-link">
              <span className="eyebrow group-hover:text-forest">All expeditions</span>
              <span className="font-serif text-3xl leading-tight">Browse every journey <ArrowUpRight className="inline h-6 w-6" /></span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
