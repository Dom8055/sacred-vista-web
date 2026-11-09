import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Expand } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { useSeo } from "@/hooks/useSeo";
import { img } from "@/lib/sv";
import PageHero from "@/components/sv/PageHero";
import { CatalogGate, Empty } from "@/components/sv/States";
import Lightbox from "@/components/sv/Lightbox";

const CATS = ["All", "Wildlife", "Landscape", "Birds", "Safari"];
const SHAPE = { tall: "aspect-[3/4]", wide: "aspect-[4/3]", square: "aspect-square" };
const HERO = "https://images.unsplash.com/photo-1690792422227-95d9afa03027?auto=format&fit=crop&q=80";

export default function Gallery() {
  const { gallery } = useCatalog();
  const [cat, setCat] = useState("All");
  const [index, setIndex] = useState(null);
  useSeo("Gallery", "Wildlife, landscape, birds and safari photography from Sacred Vista's destinations.");
  const items = cat === "All" ? gallery : gallery.filter((g) => g.category === cat);

  return (
    <>
      <PageHero image={HERO} eyebrow="The archive" title={["Field notes,", "written in light."]} crumbs={[{ label: "Home", to: "/" }, { label: "Gallery" }]} />
      <section className="bg-ivory py-16 sm:py-24" data-testid="gallery-page">
        <div className="shell">
          <div className="no-scrollbar mb-12 flex gap-2 overflow-x-auto border-b border-char/10 pb-4" role="tablist" data-lenis-prevent data-testid="gallery-filter">
            {CATS.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} data-testid={`gallery-filter-${c.toLowerCase()}`}
                className={`relative shrink-0 px-5 py-2 text-sm tracking-wide transition-colors ${cat === c ? "text-forest" : "text-char/60 hover:text-forest"}`}>
                {c}
                {cat === c && <motion.span layoutId="gal-line" className="absolute inset-x-3 -bottom-[17px] h-[2px] bg-gold" />}
              </button>
            ))}
          </div>
          <CatalogGate>
            {items.length === 0 ? <Empty title="No photographs in this category yet." /> : (
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                <AnimatePresence mode="popLayout">
                  {items.map((g, i) => (
                    <motion.button key={g.id} type="button" layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: i * 0.04 }}
                      onClick={() => setIndex(i)} className="group relative mb-4 block w-full break-inside-avoid overflow-hidden bg-forest" data-testid={`gallery-item-${g.id}`} aria-label={`Open ${g.title}`}>
                      <div className={SHAPE[g.shape] || "aspect-square"}><img src={img(g.image, 1000)} alt={g.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" /></div>
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-forest/85 via-transparent to-transparent p-5 text-left text-ivory opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <Expand className="absolute right-4 top-4 h-5 w-5 text-gold" />
                        <span className="font-serif text-xl">{g.title}</span>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-sand">{g.location} · {g.category}</span>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CatalogGate>
        </div>
      </section>
      <Lightbox items={items} index={index} onChange={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}
