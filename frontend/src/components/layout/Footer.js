import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { Logo } from "@/components/sv/Logo";
import { useCatalog } from "@/context/CatalogContext";
import { LEGAL_LINKS, NAV, SITE } from "@/data/site";

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  whatsapp: MessageCircle,
};

const Col = ({ title, children }) => (
  <div>
    <p className="eyebrow mb-6">{title}</p>
    <ul className="space-y-3 text-sm text-ivory/75">{children}</ul>
  </div>
);

export default function Footer() {
  const { segments } = useCatalog();
  const year = new Date().getFullYear();
  const socials = SITE.socials.filter((s) => s.url);

  return (
    <footer className="relative overflow-hidden bg-forest text-ivory" data-testid="site-footer">
      <div className="shell pt-24 pb-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo className="h-20 sm:h-24 w-auto" />
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-ivory/70">{SITE.description}</p>
            <ul className="mt-8 space-y-3 text-sm text-ivory/80">
              <li>
                <a href={`mailto:${SITE.email}`} className="link-line" data-testid="footer-email-link">
                  <Mail className="h-4 w-4 text-gold" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <a href={`tel:${SITE.phone}`} className="link-line" data-testid="footer-phone-link">
                  <Phone className="h-4 w-4 text-gold" />
                  {SITE.phone}
                </a>
              </li>
              {SITE.address && (
                <li className="flex gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  {SITE.address}
                </li>
              )}
            </ul>

            {/* Social Icon Pills */}
            <div className="mt-8 flex flex-wrap items-center gap-2.5" data-testid="footer-social-icons">
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.id] || ArrowUpRight;
                return (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    data-testid={`footer-social-icon-${s.id || s.label.toLowerCase()}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 bg-white/[0.06] text-gold backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-forest"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
            <Col title="Explore">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className="link-line hover:text-ivory"
                    data-testid={`footer-explore-${n.to.replace("/", "") || "home"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </Col>

            <Col title="Travel Styles">
              {segments.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/packages?segment=${s.id}`}
                    className="link-line hover:text-ivory"
                    data-testid={`footer-segment-${s.id}`}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </Col>

            <Col title="Social & Connect">
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.id] || ArrowUpRight;
                return (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2.5 text-ivory/75 transition-colors hover:text-gold"
                      data-testid={`footer-social-link-${s.id || s.label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4 text-gold transition-transform duration-300 group-hover:scale-110" />
                      <span>{s.label}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                    </a>
                  </li>
                );
              })}
            </Col>
          </div>
        </div>

        <p
          className="mt-20 select-none font-serif text-[18vw] leading-[0.8] tracking-tight text-ivory/[0.06] lg:text-[13vw]"
          aria-hidden="true"
        >
          Sacred Vista
        </p>

        <div className="mt-6 flex flex-col gap-6 border-t border-ivory/10 pt-8 text-xs text-ivory/60 md:flex-row md:items-center md:justify-between">
          <p>© {year} Sacred Vista. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="link-line hover:text-ivory"
                data-testid={`footer-legal-${l.to.slice(1)}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-5" data-testid="footer-socials">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="link-line hover:text-gold"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
