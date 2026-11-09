import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Compass,
  Loader2,
  MapPin,
  PenLine,
  Quote,
  Search,
  Sparkles,
  Star,
  Upload,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatalog } from "@/context/CatalogContext";
import { useSeo } from "@/hooks/useSeo";
import { apiError, http, img } from "@/lib/sv";
import PageHero from "@/components/sv/PageHero";
import { PackageCard } from "@/components/sv/Cards";
import { Reveal, SectionHead } from "@/components/sv/Motion";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80";

export const SEGMENT_NAMES = [
  "Wildlife",
  "Corporate MICE",
  "School Trips",
  "Leisure",
  "Nature & Adventure",
  "Culture & Heritage",
  "Spiritual",
];

const SEGMENT_ID_BY_NAME = {
  Wildlife: "wildlife",
  "Corporate MICE": "corporate",
  "School Trips": "school",
  Leisure: "leisure",
  "Nature & Adventure": "adventure",
  "Culture & Heritage": "culture",
  Spiritual: "spiritual",
};

export const INITIAL_REVIEWS = [
  {
    id: "rev-seed-1",
    name: "Vikramaditya & Ananya Rao",
    role: "Private Safari Guests · Bengaluru",
    rating: 5,
    segment: "Wildlife",
    location: "Tadoba",
    travelDate: "October 2026",
    date: "22 October 2026",
    title: "Four tigers on a quiet bamboo fireline — without the rush.",
    review:
      "What sets Sacred Vista apart is their patience. Instead of chasing jeep crowds in Tadoba, our naturalist waited twenty minutes by a silent waterhole after hearing a single sambar alarm call. Watching a tigress and her three sub-adult cubs walk right past our vehicle in golden morning light was unforgettable.",
    image:
      "https://images.unsplash.com/photo-1586617356423-52763004deac?auto=format&fit=crop&q=80",
  },
  {
    id: "rev-seed-2",
    name: "Siddharth Malhotra",
    role: "Managing Partner · Mumbai",
    rating: 5,
    segment: "Corporate MICE",
    location: "Uttarakhand",
    travelDate: "September 2026",
    date: "14 October 2026",
    title: "Our most productive leadership off-site in a decade.",
    review:
      "We brought 24 senior partners to Jim Corbett for a three-day strategy retreat. Sacred Vista handled every charter transfer, private conservatory AV setup, and dawn river safari seamlessly. The fireside discussions by the Kosi River achieved more alignment than any hotel boardroom ever could.",
    image:
      "https://images.unsplash.com/photo-1789591901246-2d6f0e538fdc?auto=format&fit=crop&q=80",
  },
  {
    id: "rev-seed-3",
    name: "Dr. Nandini Kulkarni",
    role: "Principal & Biology Educator · Pune",
    rating: 5,
    segment: "School Trips",
    location: "Tadoba",
    travelDate: "October 2026",
    date: "08 October 2026",
    title: "Safety-first field learning that turned our students into conservationists.",
    review:
      "Taking 42 middle-school students into a tiger reserve requires extraordinary coordination. Sacred Vista's educators and field naturalists ran pugmark casting workshops, camera-trap sessions, and talks with forest guards with clockwork safety and genuine warmth.",
    image:
      "https://images.unsplash.com/photo-1627289496743-8a9a08bb228a?auto=format&fit=crop&q=80",
  },
  {
    id: "rev-seed-4",
    name: "Claire & Henri Moreau",
    role: "Bespoke Travellers · Geneva",
    rating: 5,
    segment: "Leisure",
    location: "Kerala",
    travelDate: "September 2026",
    date: "29 September 2026",
    title: "Unhurried mornings drifting through Vembanad and spice estates.",
    review:
      "From our heritage residence in Fort Kochi to a private wooden ketuvallam on the backwaters and cardamom-scented mornings in Thekkady, every single transfer and meal felt personal, quiet, and deeply restorative.",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80",
  },
  {
    id: "rev-seed-5",
    name: "Karanवीर Singhania",
    role: "Alpine Photographer · New Delhi",
    rating: 5,
    segment: "Nature & Adventure",
    location: "Spiti",
    travelDate: "August 2026",
    date: "19 September 2026",
    title: "Acclimatised to perfection in the high valleys of Spiti.",
    review:
      "Ascending gradually through Kinnaur into Kibber and Langza made all the difference at 14,000 feet. The local spotters knew every ridgeline, the homestays were warm and welcoming, and waking up to Key Monastery in the mist was pure magic.",
    image:
      "https://images.unsplash.com/photo-1653844573020-71f77a0ccb8c?auto=format&fit=crop&q=80",
  },
  {
    id: "rev-seed-6",
    name: "Meenakshi & Arvind Singhvi",
    role: "Art Collectors · Hyderabad",
    rating: 5,
    segment: "Culture & Heritage",
    location: "Rajasthan",
    travelDate: "September 2026",
    date: "11 September 2026",
    title: "Living history in Jaipur's forts and Jawai's granite leopard hills.",
    review:
      "Walking Amber Fort at opening hour with an architectural historian and then spending two dusks watching leopards on ancient temple rocks in Jawai gave us a side of Rajasthan we never knew existed.",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80",
  },
  {
    id: "rev-seed-7",
    name: "Radhika Iyer",
    role: "Wellness & Contemplative Traveller · Chennai",
    rating: 5,
    segment: "Spiritual",
    location: "Uttarakhand",
    travelDate: "August 2026",
    date: "02 September 2026",
    title: "Stillness by the Ganges before the world wakes up.",
    review:
      "Sacred Vista arranged private dawn meditation by the river, quiet forest walks to Kunjapuri, and evening aarti from a serene vantage point. It felt deeply authentic and completely unhurried.",
    image:
      "https://images.unsplash.com/photo-1729922141827-ba9163bfb884?auto=format&fit=crop&q=80",
  },
  {
    id: "rev-seed-8",
    name: "Rohan & Devika Kapoor",
    role: "Wildlife Enthusiasts · Gurugram",
    rating: 5,
    segment: "Wildlife",
    location: "Masai Mara",
    travelDate: "August 2026",
    date: "24 August 2026",
    title: "Crossing the Mara River at sunrise — a dream realised.",
    review:
      "From the bush plane landing on the airstrip to our tented camp overlooking the plains, every detail in Kenya was flawless. Our Maasai guide positioned us away from the crowds for both a cheetah hunt and a dramatic wildebeest crossing.",
    image:
      "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&q=80",
  },
];

function StarRow({ rating = 5, size = "h-4 w-4" }) {
  return (
    <div className="inline-flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${
            n <= rating ? "fill-gold text-gold" : "text-gold/30"
          }`}
        />
      ))}
    </div>
  );
}

function SubmitReviewModal({ open, onClose, destinations }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [segment, setSegment] = useState("Wildlife");
  const [location, setLocation] = useState("Tadoba");
  const [travelDate, setTravelDate] = useState("");
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setSubmitted(false);
    setError("");
    onClose();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await http.post("/blogs/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) setImage(res.data.url);
    } catch (err) {
      setError(apiError(err, "Could not upload image."));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await http.post("/reviews", {
        name: name.trim(),
        role: role.trim() || "Verified Traveller",
        email: email.trim(),
        rating,
        segment,
        location: location.trim() || "India",
        travelDate: travelDate.trim(),
        title: title.trim(),
        review: review.trim(),
        image: image.trim(),
      });
      setSubmitted(true);
      setName("");
      setRole("");
      setEmail("");
      setRating(5);
      setTravelDate("");
      setTitle("");
      setReview("");
      setImage("");
    } catch (err) {
      setError(apiError(err, "Could not submit your review."));
    } finally {
      setSubmitting(false);
    }
  };

  const glassInputCls = "glass-input";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
      data-testid="review-submit-modal"
    >
      <div
        data-lenis-prevent
        className="relative my-8 w-full max-w-2xl rounded-2xl border border-white/25 bg-forest/70 text-ivory shadow-[0_28px_90px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-xl max-h-[88vh] overflow-y-auto overscroll-contain"
      >

        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gold/25 bg-forest/85 px-6 py-5 backdrop-blur-xl">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-gold">
              <Sparkles className="h-3 w-3" /> Guest Review Desk
            </span>
            <h3 className="mt-1 font-serif text-2xl text-ivory">
              Share Your Sacred Vista Experience
            </h3>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-ivory/80 hover:border-gold hover:text-gold transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div
            className="relative z-10 p-8 sm:p-12 text-center space-y-5"
            data-testid="review-submit-success"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/60 bg-gold/20 text-gold shadow-[0_0_30px_rgba(182,139,80,0.4)]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
              Submitted for Admin Approval
            </p>
            <h4 className="font-serif text-3xl text-ivory">
              Thank you for sharing your journey.
            </h4>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-ivory/85">
              Your review has been sent to the Sacred Vista admin desk. Once approved by our team, it will appear live on the Reviews page under its segment and location.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="btn-gold !px-8 !py-3 text-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative z-10 p-6 sm:p-8 space-y-5">
            {/* Interactive Star Rating */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                Overall Rating *
              </label>
              <div className="mt-2 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="rounded-lg border border-white/15 bg-black/30 p-2 transition-transform hover:scale-110"
                    data-testid={`review-star-${star}`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= rating ? "fill-gold text-gold" : "text-ivory/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-semibold text-ivory/85">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  Segment *
                </label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  className={`${glassInputCls} appearance-none`}
                  data-testid="review-input-segment"
                >
                  {SEGMENT_NAMES.map((seg) => (
                    <option key={seg} value={seg} className="bg-forest text-ivory">
                      {seg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  Location / Reserve *
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`${glassInputCls} appearance-none`}
                  data-testid="review-input-location"
                >
                  {(destinations?.length
                    ? destinations.map((d) => d.name)
                    : ["Tadoba", "Kaziranga", "Masai Mara", "Uttarakhand", "Rajasthan", "Kerala", "Spiti"]
                  ).map((loc) => (
                    <option key={loc} value={loc} className="bg-forest text-ivory">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Arjun & Priya Verma"
                  className={glassInputCls}
                  data-testid="review-input-name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  City / Traveller Profile
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Wildlife Travellers · Mumbai"
                  className={glassInputCls}
                  data-testid="review-input-role"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={glassInputCls}
                  data-testid="review-input-email"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  Month of Travel
                </label>
                <input
                  type="text"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  placeholder="e.g., October 2026"
                  className={glassInputCls}
                  data-testid="review-input-date"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  Review Headline *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience in one line..."
                  className={glassInputCls}
                  data-testid="review-input-title"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  Your Review *
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell fellow travellers about the guides, sightings, lodges, and moments that stood out..."
                  className={`${glassInputCls} resize-none`}
                  data-testid="review-input-body"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  Journey Photograph (Optional — Upload or Paste URL)
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gold/45 bg-black/35 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold hover:bg-gold hover:text-forest transition-colors">
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Or paste an image URL (https://...)"
                    className={`${glassInputCls} !mt-0 flex-1`}
                    data-testid="review-input-image"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-300" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-gold/25 pt-5">
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-full border border-white/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ivory/80 hover:border-gold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="btn-gold !px-7 !py-2.5 text-xs"
                data-testid="review-submit-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit for Admin Approval <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const ALL = "all";

export default function Reviews() {
  const { packages = [], destinations = [], getDestination } = useCatalog() || {};
  const [params, setParams] = useSearchParams();
  const activeSegment = params.get("segment") || ALL;
  const activeLocation = params.get("location") || ALL;
  const [query, setQuery] = useState("");
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useSeo(
    "Guest Reviews & Stories",
    "Read verified traveller reviews across Sacred Vista's wildlife safaris, corporate retreats, school trips, and cultural expeditions."
  );

  const loadApprovedReviews = useCallback(() => {
    http
      .get("/reviews")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setApprovedReviews(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadApprovedReviews();
  }, [loadApprovedReviews]);

  const allReviews = useMemo(
    () => [...approvedReviews, ...INITIAL_REVIEWS],
    [approvedReviews]
  );

  const updateFilter = (updates) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (!v || v === ALL) next.delete(k);
          else next.set(k, v);
        });
        return next;
      },
      { replace: true }
    );
  };

  // Locations available for the selected Segment
  const locationOptions = useMemo(() => {
    const allLocs = new Set([
      ...destinations.map((d) => d.name),
      ...allReviews.map((r) => r.location).filter(Boolean),
    ]);

    if (activeSegment === ALL) {
      return [ALL, ...Array.from(allLocs)];
    }

    const segId = SEGMENT_ID_BY_NAME[activeSegment];
    const segLocs = new Set(
      allReviews
        .filter((r) => r.segment === activeSegment)
        .map((r) => r.location)
        .filter(Boolean)
    );
    packages
      .filter((p) => p.segment_id === segId)
      .forEach((p) => {
        const d = getDestination ? getDestination(p.destination_id) : null;
        if (d?.name) segLocs.add(d.name);
      });

    const list = segLocs.size > 0 ? Array.from(segLocs) : Array.from(allLocs);
    return [ALL, ...list];
  }, [activeSegment, destinations, allReviews, packages, getDestination]);

  const filteredReviews = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allReviews.filter((r) => {
      if (activeSegment !== ALL && r.segment !== activeSegment) return false;
      if (
        activeLocation !== ALL &&
        (r.location || "").toLowerCase() !== activeLocation.toLowerCase()
      ) {
        return false;
      }
      if (
        q &&
        !`${r.name} ${r.title} ${r.review} ${r.location} ${r.segment}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [allReviews, activeSegment, activeLocation, query]);

  // Related packages for the selected Segment & Location
  const relatedPackages = useMemo(() => {
    const segId = activeSegment !== ALL ? SEGMENT_ID_BY_NAME[activeSegment] : null;
    const matched = packages.filter((p) => {
      const d = getDestination ? getDestination(p.destination_id) : null;
      if (segId && p.segment_id !== segId) return false;
      if (
        activeLocation !== ALL &&
        d?.name?.toLowerCase() !== activeLocation.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
    return (matched.length > 0 ? matched : packages).slice(0, 3);
  }, [packages, activeSegment, activeLocation, getDestination]);

  const avgRating = useMemo(() => {
    if (!allReviews.length) return "5.0";
    const sum = allReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / allReviews.length).toFixed(1);
  }, [allReviews]);

  return (
    <>
      <PageHero
        image={HERO_IMAGE}
        eyebrow="Guest Chronicles & Testimonials"
        title={["Words from those", "who walked with us."]}
        text="Every journey is judged by the quiet moments our travellers carry home — across tiger reserves, Himalayan passes, and private heritage estates."
        crumbs={[{ label: "Home", to: "/" }, { label: "Reviews" }]}
      />

      <section className="bg-ivory py-16 sm:py-24" data-testid="reviews-page">
        <div className="shell">
          {/* ── Top Summary & Share Review Banner ── */}
          <div className="relative mb-12 overflow-hidden rounded-2xl border border-gold/40 bg-[#0d1d16] p-6 text-ivory shadow-xl sm:p-8">
            <img
              src={HERO_IMAGE}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="pointer-events-none absolute inset-0 bg-forest/70 backdrop-blur-xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold/80 to-transparent" />

            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4 border-r border-gold/25 pr-6">
                  <span className="font-serif text-4xl sm:text-5xl text-gold">
                    {avgRating}
                  </span>
                  <div>
                    <StarRow rating={5} />
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ivory/80">
                      {allReviews.length} Verified Guest Reviews
                    </p>
                  </div>
                </div>
                <div className="max-w-md">
                  <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-gold">
                    Travelled With Sacred Vista?
                  </p>
                  <p className="mt-1 font-serif text-xl sm:text-2xl text-ivory">
                    Share your review by segment &amp; reserve.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-gold shrink-0 !px-7 !py-3 text-xs"
                data-testid="review-open-submit-btn"
              >
                <PenLine className="h-4 w-4" /> Write a Review
              </button>
            </div>
          </div>

          {/* ── Level-Wise Filter Bar: Segment -> Location + Search ── */}
          <div className="mb-10 grid gap-4 border-b border-char/15 pb-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-4">
              <span className="mb-1 block px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                01. Select Segment
              </span>
              <Select
                value={activeSegment}
                onValueChange={(val) =>
                  updateFilter({ segment: val, location: ALL })
                }
              >
                <SelectTrigger
                  className="h-12 rounded-full border-char/20 bg-ivory px-5 text-sm text-forest"
                  data-testid="reviews-filter-segment"
                >
                  <SelectValue placeholder="All Segments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All Segments</SelectItem>
                  {SEGMENT_NAMES.map((seg) => (
                    <SelectItem key={seg} value={seg}>
                      {seg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-4">
              <span className="mb-1 block px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                02. Select Location
              </span>
              <Select
                value={activeLocation}
                onValueChange={(val) => updateFilter({ location: val })}
              >
                <SelectTrigger
                  className="h-12 rounded-full border-char/20 bg-ivory px-5 text-sm text-forest"
                  data-testid="reviews-filter-location"
                >
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc === ALL ? "All Locations" : loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-4">
              <span className="mb-1 block px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-char/55">
                Search Reviews
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-char/45" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by guest, reserve, segment..."
                  className="h-12 w-full rounded-full border border-char/20 bg-ivory pl-11 pr-4 text-sm text-char placeholder:text-char/50 focus:border-gold focus:outline-none"
                  data-testid="reviews-search-input"
                />
              </div>
            </div>
          </div>

          {/* Active Filter Status */}
          {(activeSegment !== ALL || activeLocation !== ALL || query.trim()) && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gold/30 bg-mist px-5 py-3">
              <p className="text-xs text-forest">
                Showing <strong>{filteredReviews.length}</strong>{" "}
                {filteredReviews.length === 1 ? "review" : "reviews"}
                {activeSegment !== ALL ? ` for ${activeSegment}` : ""}
                {activeLocation !== ALL ? ` in ${activeLocation}` : ""}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setParams(new URLSearchParams(), { replace: true });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold hover:text-forest"
              >
                <X className="h-3.5 w-3.5" /> Reset Filters
              </button>
            </div>
          )}

          {/* ── Reviews Grid ── */}
          {filteredReviews.length === 0 ? (
            <div className="rounded-2xl border border-char/15 bg-mist p-12 text-center">
              <p className="font-serif text-2xl text-forest">
                No reviews found for this segment &amp; location yet.
              </p>
              <p className="mt-2 text-sm text-char/70">
                Be the first to share your experience or reset the filters to explore all guest reviews.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="btn-gold !px-6 !py-2.5 text-xs"
                >
                  Write a Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setParams(new URLSearchParams(), { replace: true });
                  }}
                  className="btn-dark !px-6 !py-2.5 text-xs"
                >
                  Show All Reviews
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-7 md:grid-cols-2" data-testid="reviews-grid">
              <AnimatePresence mode="popLayout">
                {filteredReviews.map((item, idx) => (
                  <Reveal key={item.id || idx} delay={(idx % 2) * 0.06}>
                    <motion.article
                      layout
                      className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-char/15 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl"
                      data-testid={`review-card-${item.id || idx}`}
                    >
                      <div>
                        {/* Optional Header Photo */}
                        {item.image && (
                          <div className="relative h-48 w-full overflow-hidden bg-forest">
                            <img
                              src={img(item.image, 800)}
                              alt={item.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-forest/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur-md">
                                <Compass className="h-3 w-3" /> {item.segment}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-3 py-1 text-[11px] text-ivory backdrop-blur-md">
                                <MapPin className="h-3 w-3 text-gold" /> {item.location}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="p-6 sm:p-7">
                          {!item.image && (
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-forest px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                                <Compass className="h-3 w-3" /> {item.segment}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-forest">
                                <MapPin className="h-3.5 w-3.5 text-gold" /> {item.location}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-3">
                            <StarRow rating={item.rating || 5} />
                            {item.travelDate && (
                              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-char/55">
                                <Calendar className="h-3 w-3 text-gold" /> {item.travelDate}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3.5 font-serif text-xl sm:text-2xl leading-snug text-forest">
                            “{item.title}”
                          </h3>

                          <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-char/80">
                            {item.review}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-char/10 bg-mist/50 px-6 py-4 sm:px-7">
                        <div>
                          <p className="font-serif text-base font-medium text-forest">
                            {item.name}
                          </p>
                          <p className="text-xs text-char/65">{item.role}</p>
                        </div>
                        <Quote className="h-6 w-6 text-gold/40" />
                      </div>
                    </motion.article>
                  </Reveal>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ── Related Expeditions for Selected Segment & Location ── */}
          {relatedPackages.length > 0 && (
            <div className="mt-20 border-t border-char/15 pt-16" data-testid="reviews-related-packages">
              <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <SectionHead
                  eyebrow={
                    activeSegment !== ALL || activeLocation !== ALL
                      ? `Related to ${[
                          activeSegment !== ALL ? activeSegment : null,
                          activeLocation !== ALL ? activeLocation : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}`
                      : "Explore the Journeys"
                  }
                  title={[
                    "Expeditions matching",
                    "these guest stories.",
                  ]}
                />
                <Link
                  to="/packages"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-forest hover:text-gold transition-colors"
                >
                  View All Packages <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPackages.map((pkg, i) => (
                  <PackageCard key={pkg.id} pkg={pkg} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <SubmitReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        destinations={destinations}
      />
    </>
  );
}

