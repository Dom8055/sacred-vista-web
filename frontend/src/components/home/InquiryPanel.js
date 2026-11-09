import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { apiError, http } from "@/lib/sv";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()-]{7,20}$/;

const validate = (f) => {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!EMAIL.test(f.email.trim())) e.email = "Please enter a valid email.";
  if (!PHONE.test(f.phone.trim()) || f.phone.replace(/\D/g, "").length < 7)
    e.phone = "Please enter a valid phone number.";
  if (f.message.trim().length < 10)
    e.message = "Please share a few details (at least 10 characters).";
  return e;
};

export default function InquiryPanel({ segment }) {
  const { segments = [], packages = [], getPackage } = useCatalog() || {};
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    segment: segment?.id || "",
    package_id: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const [serverError, setServerError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  useEffect(() => {
    setForm((prev) => ({ ...prev, segment: segment?.id || "" }));
  }, [segment?.id]);

  useEffect(() => {
    if (!showSuccessPopup) return undefined;
    const timer = setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [showSuccessPopup]);

  const set = (k) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
    if (errors[k]) {
      setErrors((prev) => ({ ...prev, [k]: undefined }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    setServerError("");
    try {
      const selectedPkg = form.package_id && getPackage ? getPackage(form.package_id) : null;
      await http.post("/inquiries", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        segment: form.segment || selectedPkg?.segment_id || "",
        message: form.message,
        website: form.website,
        package_id: selectedPkg?.id || null,
        package_name: selectedPkg?.title || null,
        destination_id: selectedPkg?.destination_id || null,
      });
      const firstName = form.name.trim().split(" ")[0] || "Traveller";
      setSubmittedName(firstName);
      setForm({
        name: "",
        email: "",
        phone: "",
        segment: segment?.id || "",
        package_id: "",
        message: "",
        website: "",
      });
      setErrors({});
      setState("idle");
      setShowSuccessPopup(true);
    } catch (err) {
      setServerError(apiError(err));
      setState("idle");
    }
  };

  return (
    <>
      <motion.div
        key={segment?.id}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-white/25 bg-forest/70 p-6 text-ivory shadow-[0_24px_70px_rgba(20,39,31,0.32),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-xl"
        data-testid="segment-inquiry-panel"
      >
        <div className="pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-sage/15 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 border-b border-white/15 pb-4 mb-5">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-gold">
            <Sparkles className="h-3 w-3" /> Private Concierge
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-tight text-ivory">
            Plan Your Journey
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-ivory/75">
            Share your preferences and our travel curator will connect with you personally.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={submit}
          noValidate
          className="relative z-10 space-y-3.5"
        >
          <div>
            <label
              htmlFor="p-name"
              className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/85"
            >
              Full Name *
            </label>
            <input
              id="p-name"
              type="text"
              className="glass-input"
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="mt-1 text-[11px] font-medium text-amber-300" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="p-email"
                className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/85"
              >
                Email *
              </label>
              <input
                id="p-email"
                type="email"
                className="glass-input"
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
                placeholder="you@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] font-medium text-amber-300" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="p-phone"
                className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/85"
              >
                Phone *
              </label>
              <input
                id="p-phone"
                type="tel"
                className="glass-input"
                value={form.phone}
                onChange={set("phone")}
                autoComplete="tel"
                placeholder="+91 98765 43210"
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] font-medium text-amber-300" role="alert">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="p-segment"
              className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/85"
            >
              Travel Style
            </label>
            <select
              id="p-segment"
              value={form.segment}
              onChange={(e) => {
                const seg = e.target.value;
                setForm((f) => ({
                  ...f,
                  segment: seg,
                  package_id:
                    seg && f.package_id && getPackage(f.package_id)?.segment_id !== seg
                      ? ""
                      : f.package_id,
                }));
              }}
              className="glass-input appearance-none"
            >
              <option value="" className="bg-forest text-ivory">
                Select a travel style (optional)
              </option>
              {segments.map((s) => (
                <option key={s.id} value={s.id} className="bg-forest text-ivory">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="p-package"
              className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/85"
            >
              Package / Expedition
            </label>
            <select
              id="p-package"
              value={form.package_id}
              onChange={(e) => {
                const pid = e.target.value;
                const found = pid && getPackage ? getPackage(pid) : null;
                setForm((f) => ({
                  ...f,
                  package_id: pid,
                  segment: found?.segment_id || f.segment,
                }));
              }}
              className="glass-input appearance-none"
            >
              <option value="" className="bg-forest text-ivory">
                Select a package (or custom journey)
              </option>
              {(form.segment
                ? packages.filter((p) => p.segment_id === form.segment)
                : packages
              ).map((p) => (
                <option key={p.id} value={p.id} className="bg-forest text-ivory">
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="p-message"
              className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/85"
            >
              Your journey expectation for us *
            </label>
            <textarea
              id="p-message"
              rows={3}
              className="glass-input resize-none"
              value={form.message}
              onChange={set("message")}
              placeholder="Dates, number of travellers, destinations or wildlife you hope to see…"
            />
            {errors.message && (
              <p className="mt-1 text-[11px] font-medium text-amber-300" role="alert">
                {errors.message}
              </p>
            )}
          </div>

          {/* Honeypot */}
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={set("website")}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          {serverError && (
            <p
              className="rounded-lg border border-red-400/40 bg-red-950/60 px-3 py-2 text-xs text-red-200"
              role="alert"
            >
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={state === "loading"}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full border border-gold/50 bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-forest shadow-[0_10px_30px_rgba(182,139,80,0.35)] transition-all duration-300 hover:bg-sand disabled:opacity-60"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send Inquiry <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="pt-1 text-center text-[10px] text-ivory/65">
            Inquiry only — no payment is taken. Our team confirms every arrangement personally.
          </p>
        </form>
      </motion.div>

      {/* ── GLASSMORPHIC SUCCESS POPUP ── */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            key="panel-inquiry-success-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowSuccessPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/25 bg-forest/70 p-8 text-center text-ivory shadow-[0_28px_90px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.3)] backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gold/25 blur-3xl" />

              <button
                type="button"
                onClick={() => setShowSuccessPopup(false)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-ivory/80 hover:border-gold hover:text-gold"
                aria-label="Close popup"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-gold/20 text-gold shadow-[0_0_30px_rgba(182,139,80,0.35)] backdrop-blur-md">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <p className="relative z-10 mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
                Inquiry Received
              </p>

              <h3 className="relative z-10 mt-2 font-serif text-3xl text-ivory">
                Thank you, {submittedName}.
              </h3>

              <p className="relative z-10 mt-3 text-sm leading-relaxed text-ivory/85">
                Your inquiry has been received at the Sacred Vista expedition desk. A senior naturalist &amp; trip curator will connect with you personally.
              </p>

              <button
                type="button"
                onClick={() => setShowSuccessPopup(false)}
                className="relative z-10 mt-6 inline-flex items-center justify-center rounded-full border border-gold/50 bg-gold px-8 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-forest transition-transform hover:-translate-y-0.5"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
