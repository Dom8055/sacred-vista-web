import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { img } from "@/lib/sv";

export default function Lightbox({ items, index, onChange, onClose }) {
  const open = index !== null && index >= 0 && items[index];
  const touch = useRef(null);
  const prev = useCallback(() => onChange((index - 1 + items.length) % items.length), [index, items.length, onChange]);
  const next = useCallback(() => onChange((index + 1) % items.length), [index, items.length, onChange]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [open, prev, next, onClose]);

  const item = open ? items[index] : null;
  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col bg-[#0c1712]/95 text-ivory"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          role="dialog" aria-modal="true" aria-label={item.title} data-testid="lightbox"
          onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - (touch.current ?? 0);
            if (Math.abs(dx) > 50) (dx > 0 ? prev() : next());
          }}
        >
          <div className="shell flex items-center justify-between py-5">
            <p className="text-xs uppercase tracking-[0.25em] text-ivory/70" data-testid="lightbox-counter">{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
            <button type="button" onClick={onClose} autoFocus className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30 hover:bg-ivory hover:text-forest" aria-label="Close" data-testid="lightbox-close-btn"><X className="h-5 w-5" /></button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 sm:px-20">
            <motion.img key={item.image} src={img(item.image, 2000)} alt={item.title} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="max-h-[72vh] w-auto max-w-full object-contain" data-testid="lightbox-image" />
            <button type="button" onClick={prev} className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/30 bg-forest/60 hover:bg-gold hover:text-forest sm:left-6" aria-label="Previous image" data-testid="lightbox-prev-btn"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={next} className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/30 bg-forest/60 hover:bg-gold hover:text-forest sm:right-6" aria-label="Next image" data-testid="lightbox-next-btn"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="shell py-6 text-center">
            <p className="font-serif text-2xl">{item.title}</p>
            {item.location && <p className="mt-1 text-xs uppercase tracking-[0.25em] text-gold">{item.location}{item.category ? ` · ${item.category}` : ""}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
