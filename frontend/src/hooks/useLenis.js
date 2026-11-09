import { useEffect } from "react";
import Lenis from "lenis";

export function useLenis() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      prevent: (node) => {
        if (!node || typeof node.closest !== "function") return false;
        if (
          node.closest(
            '[data-lenis-prevent], [data-lenis-prevent-wheel], [role="dialog"], [aria-modal="true"], [role="listbox"], [data-radix-popper-content-wrapper]'
          )
        ) {
          return true;
        }
        let el = node;
        while (el && el !== document.body && el !== document.documentElement) {
          const style = window.getComputedStyle(el);
          const overflowY = style.overflowY;
          if (
            (overflowY === "auto" || overflowY === "scroll") &&
            el.scrollHeight > el.clientHeight
          ) {
            return true;
          }
          el = el.parentElement;
        }
        return false;
      },
    });
    window.__lenis = lenis;
    let id;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
}

export const scrollToTop = (immediate = false) => {
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate, duration: 1.5 });
  else window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
};

export const scrollToEl = (el, offset = -90) => {
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset, duration: 1.4 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
};
