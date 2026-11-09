import { useSearchParams } from "react-router-dom";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCatalog } from "@/context/CatalogContext";
import { useSeo } from "@/hooks/useSeo";
import { FAQS, SITE } from "@/data/site";
import PageHero from "@/components/sv/PageHero";
import InquiryForm from "@/components/sv/InquiryForm";
import { Reveal, SectionHead } from "@/components/sv/Motion";
import { CatalogGate } from "@/components/sv/States";

const HERO = "https://images.unsplash.com/photo-1661174607003-d9d36388c916?auto=format&fit=crop&q=80";

export default function Contact() {
  const { getPackage, getDestination } = useCatalog();
  const [params, setParams] = useSearchParams();
  const pkg = getPackage(params.get("package"));
  const destId = getDestination(params.get("destination")) ? params.get("destination") : null;
  const segment = params.get("segment") || "";
  useSeo("Contact Us", "Plan your journey with Sacred Vista — send an inquiry and our team will reply personally.");

  const details = [
    { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: Phone, label: "Phone", value: SITE.phone, href: `tel:${SITE.phone}` },
    { icon: MessageCircle, label: "WhatsApp", value: SITE.whatsapp, href: `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}` },
    SITE.address ? { icon: MapPin, label: "Studio", value: SITE.address } : { icon: MapPin, label: "Studio", value: "[Address to be added]" },
  ];

  return (
    <>
      <PageHero image={HERO} eyebrow="Plan your journey" title={["Let's begin", "a conversation."]} text="Tell us where your curiosity lives. Every inquiry is read by a person and answered personally." crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]} />
      <section className="bg-ivory py-20 sm:py-28" data-testid="contact-page">
        <div className="shell grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead eyebrow="Inquiry" title="Your journey, in your words." />
            <div className="mt-12">
              <CatalogGate>
                <InquiryForm key={`${pkg?.id}-${destId}-${segment}`} pkg={pkg || null} destinationId={destId} initialSegment={segment} onClearContext={() => setParams({}, { replace: true })} />
              </CatalogGate>
            </div>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="relative overflow-hidden rounded-2xl border border-white/25 bg-forest/70 p-8 text-ivory shadow-[0_24px_70px_rgba(20,39,31,0.32),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-xl sm:p-10">
              <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-gold/15 blur-3xl" />

              <p className="eyebrow relative z-10 mb-8">Reach us directly</p>
              <ul className="relative z-10 space-y-7">
                {details.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex gap-4">
                    <Icon className="mt-1 h-4 w-4 shrink-0 text-gold" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-ivory/75">{label}</p>
                      {href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="link-line mt-1 font-serif text-xl text-ivory" data-testid={`contact-${label.toLowerCase()}-link`}>{value}</a> : <p className="mt-1 font-serif text-xl text-ivory">{value}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="relative z-10 mt-10 border-t border-white/15 pt-6 text-xs leading-relaxed text-ivory/80">Inquiry-based booking: nothing is reserved or charged until you approve a written proposal.</p>
            </div>
          </aside>
        </div>
      </section>
      <section className="bg-mist py-24" data-testid="faq-section">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHead eyebrow="Questions" title="Before you travel" /></div>
          <Reveal className="lg:col-span-7 lg:col-start-6">
            <Accordion type="single" collapsible defaultValue="faq-0">
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`} className="border-char/15">
                  <AccordionTrigger className="py-6 text-left font-serif text-xl text-forest hover:no-underline" data-testid={`faq-trigger-${i}`}>{f.q}</AccordionTrigger>
                  <AccordionContent className="pb-6 text-base leading-relaxed text-char/75">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>
    </>
  );
}
