import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import { SITE } from "@/data/site";
import { useCatalog } from "@/context/CatalogContext";
import { scrollToTop } from "@/hooks/useLenis";
import { apiError, http } from "@/lib/sv";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  segment: "",
  package_id: "",
  message: "",
  website: "",
};

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [openInquiry, setOpenInquiry] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const { segments = [], packages = [], getPackage } = useCatalog() || {};

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-hide the success popup after 3.5 seconds
  useEffect(() => {
    if (!showSuccessPopup) return undefined;
    const timer = setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [showSuccessPopup]);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!EMAIL_RE.test(form.email.trim()))
      e.email = "Please enter a valid email.";
    if (
      !PHONE_RE.test(form.phone.trim()) ||
      form.phone.replace(/\D/g, "").length < 7
    ) {
      e.phone = "Please enter a valid phone number.";
    }
    if (form.message.trim().length < 10)
      e.message = "Please share a few details (at least 10 characters).";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    setServerError("");
    try {
      const selectedPkg = form.package_id && getPackage ? getPackage(form.package_id) : null;
      await http.post("/inquiries", {
        ...form,
        segment: form.segment || selectedPkg?.segment_id || "",
        package_id: selectedPkg?.id || null,
        package_name: selectedPkg?.title || null,
        destination_id: selectedPkg?.destination_id || null,
      });
      const firstName = form.name.trim().split(" ")[0] || "Traveller";
      setSubmittedName(firstName);
      setForm(INITIAL_FORM);
      setErrors({});
      // Disappear the form and show the glassmorphic success popup
      setOpenInquiry(false);
      setShowSuccessPopup(true);
    } catch (err) {
      setServerError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const wa = `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hello Sacred Vista, I'd like to plan a journey."
  )}`;

  const glassInputCls = "glass-input";

  return (
    <>
      {/* ── LEFT SIDE: Floating Inquiry Button & Glassmorphic Form ── */}
      <div className="fixed bottom-24 left-5 z-40 flex flex-col items-start gap-3 sm:left-8 lg:bottom-28">
        <AnimatePresence>
          {openInquiry && (
            <>
              {/* Subtle click-outside backdrop */}
              <motion.div
                key="inquiry-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setOpenInquiry(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
              />

              {/* Glassmorphic Inquiry Form Card (70% Opacity) */}
              <motion.div
                key="inquiry-glass-card"
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.94 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                data-lenis-prevent
                className="relative z-50 mb-1 w-[calc(100vw-2.5rem)] max-w-[420px] max-h-[calc(100vh-8.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/25 bg-forest/70 p-6 text-ivory shadow-[0_24px_70px_rgba(20,39,31,0.45),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-xl sm:p-7"
                data-testid="floating-inquiry-modal"
              >
                {/* Ambient decorative glass highlights */}
                <div className="pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full bg-gold/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-sage/15 blur-3xl" />

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between gap-3 border-b border-white/15 pb-4">
                  <div>
                    <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-gold">
                      <Sparkles className="h-3 w-3" /> Private Concierge
                    </p>
                    <h3 className="mt-1.5 font-serif text-2xl leading-tight text-ivory">
                      Plan Your Journey
                    </h3>
                    <p className="mt-0.5 text-xs text-ivory/75">
                      Share your preferences and our travel curator will connect with you personally.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenInquiry(false)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-ivory/85 backdrop-blur-md transition-colors hover:border-gold hover:bg-gold hover:text-forest"
                    aria-label="Close inquiry form"
                    data-testid="floating-inquiry-close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="relative z-10 mt-4 space-y-3.5"
                  data-testid="floating-inquiry-form"
                >
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={setField("name")}
                      placeholder="Enter your full name"
                      className={glassInputCls}
                      data-testid="floating-inquiry-name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-[11px] font-medium text-amber-300">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={setField("email")}
                        placeholder="you@email.com"
                        className={glassInputCls}
                        data-testid="floating-inquiry-email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-[11px] font-medium text-amber-300">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={setField("phone")}
                        placeholder="+91 98765 43210"
                        className={glassInputCls}
                        data-testid="floating-inquiry-phone"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-[11px] font-medium text-amber-300">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                      Travel Category
                    </label>
                    <select
                      value={form.segment}
                      onChange={(e) => {
                        const seg = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          segment: seg,
                          package_id:
                            seg && prev.package_id && getPackage(prev.package_id)?.segment_id !== seg
                              ? ""
                              : prev.package_id,
                        }));
                      }}
                      className={`${glassInputCls} appearance-none`}
                      data-testid="floating-inquiry-segment"
                    >
                      <option value="" className="bg-forest text-ivory">
                        Select a travel category (optional)
                      </option>
                      {segments.map((s) => (
                        <option
                          key={s.id}
                          value={s.id}
                          className="bg-forest text-ivory"
                        >
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                      Package / Expedition
                    </label>
                    <select
                      value={form.package_id}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const found = pid && getPackage ? getPackage(pid) : null;
                        setForm((prev) => ({
                          ...prev,
                          package_id: pid,
                          segment: found?.segment_id || prev.segment,
                        }));
                      }}
                      className={`${glassInputCls} appearance-none`}
                      data-testid="floating-inquiry-package"
                    >
                      <option value="" className="bg-forest text-ivory">
                        Select a package (or custom journey)
                      </option>
                      {(form.segment
                        ? packages.filter((p) => p.segment_id === form.segment)
                        : packages
                      ).map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          className="bg-forest text-ivory"
                        >
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                      Your journey expectation for us *
                    </label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={setField("message")}
                      placeholder="Dates, number of travellers, destinations or wildlife you hope to see…"
                      className={`${glassInputCls} resize-none`}
                      data-testid="floating-inquiry-message"
                    />
                    {errors.message && (
                      <p className="mt-1 text-[11px] font-medium text-amber-300">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={setField("website")}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  {serverError && (
                    <p
                      className="rounded-lg border border-red-400/40 bg-red-950/50 px-3 py-2 text-xs text-red-200"
                      role="alert"
                    >
                      {serverError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-full border border-gold/50 bg-gradient-to-r from-gold via-[#d4af72] to-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-forest shadow-[0_10px_30px_rgba(182,139,80,0.4)] transition-all duration-300 hover:brightness-105 disabled:opacity-60"
                    data-testid="floating-inquiry-submit"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Send Inquiry <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Left Floating Inquiry Button (Matches WhatsApp Button on Right) */}
        <button
          type="button"
          onClick={() => setOpenInquiry((prev) => !prev)}
          aria-label="Open quick inquiry form"
          data-testid="floating-inquiry-btn"
          className="group relative z-50 flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-gold text-forest shadow-[0_12px_40px_rgba(20,39,31,0.35)] transition-transform hover:-translate-y-0.5 sm:w-auto sm:pl-4 sm:pr-5"
        >
          <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          <span className="hidden text-sm font-semibold sm:inline">
            Inquiry
          </span>
        </button>
      </div>

      {/* ── GLASSMORPHIC SUCCESS POPUP ── */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            key="inquiry-success-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            onClick={() => setShowSuccessPopup(false)}
            data-testid="floating-inquiry-success-popup"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/30 bg-forest/70 p-8 text-center text-ivory shadow-[0_28px_90px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.35)] backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gold/30 blur-3xl" />

              <button
                type="button"
                onClick={() => setShowSuccessPopup(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-ivory/75 hover:border-gold hover:text-gold"
                aria-label="Close popup"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-gold/20 text-gold shadow-[0_0_30px_rgba(182,139,80,0.35)] backdrop-blur-md">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <p className="relative z-10 mt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                Inquiry Received
              </p>

              <h3 className="relative z-10 mt-2 font-serif text-3xl text-ivory">
                Thank you, {submittedName}.
              </h3>

              <p className="relative z-10 mt-3 text-sm leading-relaxed text-ivory/80">
                Your inquiry has been sent to our travel curators. A member of the Sacred Vista team will connect with you personally via email or phone.
              </p>

              <button
                type="button"
                onClick={() => setShowSuccessPopup(false)}
                className="relative z-10 mt-6 inline-flex items-center justify-center rounded-full border border-gold/50 bg-gold px-7 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-forest transition-transform hover:-translate-y-0.5"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RIGHT SIDE: Scroll-to-Top & WhatsApp Button ── */}
      <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-3 sm:right-8 lg:bottom-28">
        <AnimatePresence>
          {showTop && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              onClick={() => scrollToTop()}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-forest text-ivory shadow-lg transition-colors hover:bg-gold hover:text-forest"
              aria-label="Back to top"
              data-testid="scroll-top-btn"
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
        {SITE.whatsapp && (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            data-testid="whatsapp-btn"
            className="group flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-gold text-forest shadow-[0_12px_40px_rgba(20,39,31,0.35)] transition-transform hover:-translate-y-0.5 sm:w-auto sm:pl-4 sm:pr-5"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden text-sm font-semibold sm:inline">
              WhatsApp
            </span>
          </a>
        )}
      </div>
    </>
  );
}
