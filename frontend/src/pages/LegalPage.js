import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { LEGAL_LINKS, POLICIES, SITE } from "@/data/site";
import { useSeo } from "@/hooks/useSeo";
import { scrollToEl } from "@/hooks/useLenis";
import PageHero from "@/components/sv/PageHero";
import { Reveal } from "@/components/sv/Motion";

const HERO = "https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?auto=format&fit=crop&q=80";
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function LegalPage({ policy }) {
  const p = POLICIES[policy];
  useSeo(p.title, p.intro);
  return (
    <>
      <PageHero image={HERO} eyebrow="Legal" title={p.title} text={p.intro} crumbs={[{ label: "Home", to: "/" }, { label: p.title }]} />
      <section className="bg-ivory py-20 sm:py-28" data-testid={`legal-page-${policy}`}>
        <div className="shell grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow mb-5">On this page</p>
              <ol className="space-y-3 text-sm">
                {p.sections.map((s, i) => (
                  <li key={s.h}><button type="button" onClick={() => scrollToEl(document.getElementById(slug(s.h)))} className="link-line text-left text-char/75 hover:text-forest" data-testid={`legal-toc-${i}`}>{String(i + 1).padStart(2, "0")} — {s.h}</button></li>
                ))}
              </ol>
              <p className="eyebrow mb-4 mt-12">Other policies</p>
              <ul className="space-y-2 text-sm">{LEGAL_LINKS.map((l) => <li key={l.to}><Link to={l.to} className="link-line text-char/75 hover:text-forest">{l.label}</Link></li>)}</ul>
            </div>
          </aside>
          <article className="max-w-[68ch] lg:col-span-8 lg:col-start-5">
            <p className="text-xs uppercase tracking-[0.22em] text-char/60">Last updated · {SITE.policyUpdated}</p>
            <div className="mt-6 flex gap-3 border border-gold/40 bg-gold/10 p-5 text-sm text-char/80" data-testid="legal-notice"><AlertTriangle className="h-5 w-5 shrink-0 text-gold" />{p.notice}</div>
            {p.sections.map((s, i) => (
              <Reveal key={s.h} id={slug(s.h)} className="scroll-mt-28 border-b border-char/10 py-10">
                <h2 className="flex items-baseline gap-4 text-3xl text-forest"><span className="font-serif text-base italic text-gold">{String(i + 1).padStart(2, "0")}</span>{s.h}</h2>
                {s.p.map((t) => <p key={t} className="mt-4 text-base leading-[1.85] text-char/80">{t}</p>)}
              </Reveal>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
