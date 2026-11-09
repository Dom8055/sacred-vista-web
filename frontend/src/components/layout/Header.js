import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/sv/Logo";
import { NAV, SITE } from "@/data/site";
import { scrollToTop, scrollToEl } from "@/hooks/useLenis";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onHome = (e) => {
    if (pathname === "/") {
      e.preventDefault();
      window.dispatchEvent(new Event("sv:reset-home"));
      scrollToTop();
    }
  };

  const onNavClick = (e, n) => {
    if (n.to === "/") {
      onHome(e);
      setOpen(false);
      return;
    }
    if (n.selector && pathname === "/") {
      e.preventDefault();
      setOpen(false);
      window.dispatchEvent(new Event("sv:reset-home"));
      setTimeout(() => {
        const el = document.querySelector(n.selector);
        if (el) scrollToEl(el, -70);
      }, 100);
    } else {
      setOpen(false);
    }
  };

  const solid = scrolled || pathname.startsWith("/admin");
  // Hide header entirely on home hero (only while at top of page)
  const hideOnHero = pathname === "/" && !scrolled;

  return (
    <>
      <header
        data-testid="site-header"
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,padding,border-color,opacity,transform] duration-500 ${
          hideOnHero
            ? "pointer-events-none opacity-0 -translate-y-full"
            : solid
            ? "border-b border-gold/15 bg-forest/95 py-3 backdrop-blur-md"
            : "border-b border-transparent bg-transparent py-5 lg:py-7"
        }`}
      >
        <div className="shell flex items-center justify-between gap-6">
          <Link to="/" onClick={onHome} data-testid="header-logo-link" aria-label="Sacred Vista home" className="flex items-center">
            <Logo className="h-16 lg:h-20 w-auto" />
          </Link>
          <nav className="hidden items-center gap-5 xl:gap-7 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={(e) => onNavClick(e, n)}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={({ isActive }) => `relative py-2 text-[12px] xl:text-[13px] font-medium tracking-wide whitespace-nowrap transition-colors ${isActive && !n.selector ? "text-ivory" : "text-ivory/75 hover:text-ivory"}`}
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive && !n.selector && <motion.span layoutId="nav-active" className="absolute -bottom-0.5 left-0 h-px w-full bg-gold" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/contact" data-testid="header-plan-journey-btn" className="btn-gold hidden !px-6 !py-3 sm:inline-flex">
              Plan Your Journey <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30 text-ivory lg:hidden"
              aria-label="Open menu"
              data-testid="mobile-menu-open-btn"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-forest text-ivory overflow-y-auto"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            data-testid="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="shell flex items-center justify-between py-5">
              <Logo className="h-14 w-auto" />
              <button type="button" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30" aria-label="Close menu" data-testid="mobile-menu-close-btn">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="shell mt-4 flex flex-1 flex-col gap-1" aria-label="Mobile">
              {NAV.map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}>
                  <NavLink
                    to={n.to}
                    end={n.to === "/"}
                    onClick={(e) => onNavClick(e, n)}
                    data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={({ isActive }) => `flex items-baseline gap-4 border-b border-ivory/10 py-3 font-serif text-3xl ${isActive && !n.selector ? "text-gold" : "text-ivory"}`}
                  >
                    <span className="font-sans text-xs text-ivory/50">0{i + 1}</span>
                    {n.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <div className="shell pb-10">
              <Link to="/contact" className="btn-gold w-full justify-center" data-testid="mobile-plan-journey-btn">Plan Your Journey</Link>
              <p className="mt-6 text-center text-sm text-ivory/60">{SITE.email}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
