import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCatalog } from "@/context/CatalogContext";
import { useSeo } from "@/hooks/useSeo";
import PageHero from "@/components/sv/PageHero";
import { DestinationCard } from "@/components/sv/Cards";
import { SectionHead } from "@/components/sv/Motion";
import { CatalogGate } from "@/components/sv/States";
import SeasonFinder from "@/components/sv/SeasonFinder";

const HERO = "https://images.unsplash.com/photo-1645033393602-4f7623917853?auto=format&fit=crop&q=80";
const CONTINENTS = { all: "All Regions", asia: "Asia · India", africa: "Africa · Kenya" };
const TITLES = { all: "Every wild place we know", asia: "The Indian subcontinent", africa: "The East African savannah" };

export default function Destinations() {
  const { destinations, packagesForDestination } = useCatalog();
  const [params, setParams] = useSearchParams();
  const region = CONTINENTS[params.get("region")] ? params.get("region") : "all";
  useSeo("Destinations", "Tadoba, Kaziranga, Masai Mara, Uttarakhand, Rajasthan, Kerala and Spiti — explore Sacred Vista's destinations.");
  const available = ["all", ...new Set(destinations.map((d) => d.continent))];
  const list = region === "all" ? destinations : destinations.filter((d) => d.continent === region);
  const setRegion = (r) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    if (r === "all") next.delete("region");
    else next.set("region", r);
    return next;
  }, { replace: true, preventScrollReset: true });

  return (
    <>
      <PageHero image={HERO} eyebrow="Seven landscapes" title="Destinations" text="From central India's tiger forests to Kenya's golden plains — places chosen for their character, wildlife and quiet." crumbs={[{ label: "Home", to: "/" }, { label: "Destinations" }]} />
      <CatalogGate><SeasonFinder destinations={destinations} /></CatalogGate>
      <section className="bg-ivory py-20 sm:py-28" data-testid="destinations-page">
        <div className="shell">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHead key={region} eyebrow="Explore by region" title={TITLES[region]} />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by region" data-testid="region-filter">
              {available.map((r) => (
                <button key={r} type="button" onClick={() => setRegion(r)} aria-pressed={region === r} data-testid={`region-filter-${r}`}
                  className={`rounded-full border px-5 py-2.5 text-xs font-medium tracking-wide transition-colors ${region === r ? "border-forest bg-forest text-ivory" : "border-char/20 hover:border-gold"}`}>{CONTINENTS[r]}</button>
              ))}
            </div>
          </div>
          <CatalogGate>
            <motion.div layout className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {list.map((d, i) => (
                  <motion.div key={d.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.6, delay: i * 0.05 }} className={i === 0 && region === "all" ? "lg:col-span-2" : ""}>
                    <DestinationCard dest={d} count={packagesForDestination(d.id).length} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {region !== "all" && (
              <div className="mt-12 text-center"><button type="button" onClick={() => setRegion("all")} className="btn-dark" data-testid="show-all-destinations-btn">Show All Destinations</button></div>
            )}
          </CatalogGate>
        </div>
      </section>
    </>
  );
}
