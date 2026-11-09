import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Plane } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { useSeo } from "@/hooks/useSeo";
import { img, MONTHS } from "@/lib/sv";
import PageHero from "@/components/sv/PageHero";
import { PackageCard } from "@/components/sv/Cards";
import { MaskLines, Reveal, SectionHead } from "@/components/sv/Motion";
import { CatalogGate, NotFoundBlock } from "@/components/sv/States";
import Lightbox from "@/components/sv/Lightbox";

const LEVEL = [
  { label: "Off-season / closed", cls: "bg-char/10" },
  { label: "Good", cls: "bg-sage" },
  { label: "Peak", cls: "bg-gold" },
];

function SeasonCalendar({ months, text }) {
  return (
    <div data-testid="season-calendar">
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12" role="list" aria-label={`Best time to visit: ${text}`}>
        {months.map((m, i) => (
          <div key={MONTHS[i]} role="listitem" aria-label={`${MONTHS[i]}: ${LEVEL[m].label}`}>
            <div className={`h-14 ${LEVEL[m].cls} transition-transform hover:-translate-y-1`} style={{ opacity: m === 0 ? 1 : 0.55 + m * 0.22 }} />
            <p className="mt-2 text-center text-xs text-char/70">{MONTHS[i]}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-5 text-xs text-char/70">{LEVEL.map((l) => <span key={l.label} className="flex items-center gap-2"><span className={`h-3 w-3 ${l.cls}`} />{l.label}</span>)}</div>
    </div>
  );
}

function Detail({ dest }) {
  const { packagesForDestination } = useCatalog();
  const pkgs = packagesForDestination(dest.id);
  const [lb, setLb] = useState(null);
  const gallery = dest.gallery.map((g, i) => ({ image: g, title: `${dest.name} — ${i + 1}`, location: dest.region }));
  useSeo(dest.name, dest.description, img(dest.banner, 1200));

  return (
    <div data-testid={`destination-details-${dest.id}`}>
      <PageHero tall image={dest.banner} eyebrow={dest.region} title={dest.name} text={dest.tagline} crumbs={[{ label: "Home", to: "/" }, { label: "Destinations", to: "/destinations" }, { label: dest.name }]} />
      <section className="bg-ivory py-20 sm:py-28">
        <div className="shell grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead eyebrow="Overview" title={`About ${dest.name}`} />
            <Reveal as="p" className="mt-8 text-lg leading-relaxed text-char/80">{dest.description}</Reveal>
          </div>
          <div className="lg:col-span-5">
            <div className="border border-char/10 bg-mist p-6 sm:p-8">
              <p className="eyebrow mb-3">Best time to visit</p>
              <p className="mb-6 font-serif text-xl text-forest">{dest.best_time}</p>
              <SeasonCalendar months={dest.best_months} text={dest.best_time} />
            </div>
          </div>
        </div>
      </section>

      <section className="grain relative bg-forest py-24 text-ivory sm:py-32">
        <div className="shell relative z-10 grid gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-6">Highlights</p>
            <ol className="space-y-0" data-testid="destination-highlights">
              {dest.highlights.map((h, i) => <Reveal as="li" key={h} delay={i * 0.06} className="flex items-baseline gap-6 border-b border-ivory/10 py-5"><span className="font-serif text-sm italic text-gold">0{i + 1}</span><span className="font-serif text-2xl sm:text-3xl">{h}</span></Reveal>)}
            </ol>
          </div>
          <div>
            <p className="eyebrow mb-6">Wildlife & nature</p>
            <div className="flex flex-wrap gap-2" data-testid="destination-wildlife">{dest.wildlife.map((w) => <span key={w} className="rounded-full border border-ivory/25 px-4 py-2 text-sm text-ivory/85">{w}</span>)}</div>
            <div className="mt-14 border-l-2 border-gold pl-6" data-testid="destination-getting-there">
              <p className="eyebrow mb-3 flex items-center gap-2"><Plane className="h-4 w-4" />Getting there</p>
              <p className="leading-relaxed text-ivory/80">{dest.getting_there}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-20">
        <div className="shell grid grid-cols-2 gap-3 md:grid-cols-4">
          {gallery.map((g, i) => (
            <button key={g.image} type="button" onClick={() => setLb(i)} className="group aspect-[3/4] overflow-hidden" data-testid={`destination-gallery-${i}`} aria-label={`Open image ${i + 1}`}>
              <img src={img(g.image, 700)} alt={g.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </button>
          ))}
        </div>
      </section>

      <section className="bg-mist py-24" data-testid="destination-packages">
        <div className="shell">
          <SectionHead eyebrow={`Journeys in ${dest.name}`} title="Expeditions here" />
          {pkgs.length ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{pkgs.map((p, i) => <PackageCard key={p.id} pkg={p} index={i} />)}</div>
          ) : <p className="mt-8 text-char/70">No packages yet — ask us for a custom journey.</p>}
        </div>
      </section>

      <section className="bg-forest py-24 text-ivory">
        <div className="shell flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <MaskLines lines={[`Shape your ${dest.name}`, "journey with us."]} className="text-4xl sm:text-6xl" lineClassName="[&:nth-child(2)]:italic" />
          <Link to={`/contact?destination=${dest.id}`} className="btn-gold" data-testid="destination-inquire-btn">Inquire about {dest.name} <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </section>
      <Lightbox items={gallery} index={lb} onChange={setLb} onClose={() => setLb(null)} />
    </div>
  );
}

export default function DestinationDetails() {
  const { destinationId } = useParams();
  const [params] = useSearchParams();
  const id = destinationId || params.get("destinationId") || params.get("id") || "tadoba";
  const { getDestination, status } = useCatalog();
  const dest = getDestination(id);
  return (
    <CatalogGate>
      {dest ? <Detail key={dest.id} dest={dest} /> : status === "ready" && <NotFoundBlock title="This destination could not be found." text="Explore the places we currently travel to." to="/destinations" cta="View all destinations" />}
    </CatalogGate>
  );
}
