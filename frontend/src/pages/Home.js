import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCatalog } from "@/context/CatalogContext";
import { useSeo } from "@/hooks/useSeo";
import { scrollToTop, scrollToEl } from "@/hooks/useLenis";
import { Marquee } from "@/components/sv/Motion";
import { CatalogGate } from "@/components/sv/States";
import Hero from "@/components/home/Hero";
import BrandStory from "@/components/home/BrandStory";
import SegmentsShowcase from "@/components/home/SegmentsShowcase";
import MapExplorer from "@/components/home/MapExplorer";
import { GalleryPreview, WildlifeBanner } from "@/components/home/Editorial";
import { ClosingCTA, FaqSection, ReviewsCarousel, WhySection } from "@/components/home/Closing";
import SegmentView from "@/components/home/SegmentView";
import InquiryPanel from "@/components/home/InquiryPanel";

const HASH_TARGETS = {
  "#category": '[data-testid="segments-showcase"]',
  "#about": '[data-testid="why-section"]',
  "#philosophy": '[data-testid="brand-story"]',
  "#faq": '[data-testid="faq-section"]',
};

export default function Home() {
  const catalog = useCatalog();
  const { segments, destinations, packages, gallery, getSegment } = catalog;
  const [activeId, setActiveId] = useState(null);
  const active = activeId ? getSegment(activeId) : null;
  const location = useLocation();
  useSeo(null);

  const select = useCallback((id) => setActiveId(id), []);
  const selectFromTile = (id) => {
    setActiveId(id);
    scrollToTop();
  };

  useEffect(() => {
    const reset = () => setActiveId(null);
    window.addEventListener("sv:reset-home", reset);
    return () => window.removeEventListener("sv:reset-home", reset);
  }, []);

  useEffect(() => {
    const selector = HASH_TARGETS[location.hash];
    if (!selector) return;
    setActiveId(null);
    const timer = setTimeout(() => {
      const el = document.querySelector(selector);
      if (el) scrollToEl(el, -70);
    }, 120);
    return () => clearTimeout(timer);
  }, [location.hash]);

  const stats = [
    { value: destinations.length, label: "Destinations" },
    { value: packages.length, label: "Curated expeditions" },
    { value: new Set(destinations.map((d) => d.country)).size, label: "Countries" },
    { value: segments.length, label: "Travel styles" },
  ];

  return (
    <>
      <Hero segments={segments} active={active} onSelect={select} />
      <CatalogGate>
        {active ? (
          <SegmentView segment={active} onReset={() => setActiveId(null)} />
        ) : (
          <>
            <BrandStory />
            <div className="border-y border-char/10 bg-ivory py-10 text-forest/80">
              <Marquee
                items={destinations.map((d) => ({
                  id: d.id,
                  name: d.name,
                  to: `/destinations/${d.id}`,
                }))}
              />
            </div>
            <SegmentsShowcase segments={segments} onSelect={selectFromTile} />
            <MapExplorer />
            <WildlifeBanner />
            <GalleryPreview gallery={gallery} />
            <WhySection stats={stats} />
            <FaqSection />
            <ClosingCTA />
            <ReviewsCarousel />
          </>
        )}
      </CatalogGate>
    </>
  );
}
