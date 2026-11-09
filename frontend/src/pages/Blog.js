import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  PenLine,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { apiError, http, img } from "@/lib/sv";
import PageHero from "@/components/sv/PageHero";
import { MaskLines, Reveal, SectionHead } from "@/components/sv/Motion";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80";

export const BLOG_POSTS = [
  {
    slug: "tracking-tigers-tadoba-dawn",
    title: "Tracking the Ghost of the Bamboo Forest: Dawn in Tadoba",
    subtitle:
      "How reading alarm calls, pugmarks in the dew, and unhurried patience reveal Central India's apex predator.",
    category: "Wildlife",
    location: "Tadoba-Andhari, Maharashtra",
    date: "18 October 2026",
    readTime: "6 min read",
    author: "Arjun Deshmukh",
    authorRole: "Lead Field Naturalist",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&q=80",
    excerpt:
      "Before the sun clears the teak canopy, the forest speaks in a language of langur coughs and sambar alarm stamps. Here is how our trackers compose a morning drive.",
    quote:
      "You do not find a tiger by chasing sightings; you find her by understanding the silence of the waterhole.",
    fieldNotes: [
      "Best Season: February to May for waterhole sightings; November to January for emerald winter light.",
      "Recommended Stay: 4 to 5 nights across Moharli and Kolara buffer corridors.",
      "Key Species: Bengal Tiger, Indian Leopard, Sloth Bear, Dhole (Wild Dog).",
    ],
    sections: [
      {
        heading: "Listening Before Looking",
        body: [
          "At 5:45 AM, the mist over Telia Lake still clings to the tall ghost trees. Most safari vehicles rush toward the previous evening's sighting coordinates, engines humming in anticipation. Our naturalist asks the driver to cut the ignition beside a quiet bamboo thicket instead.",
          "In Central India's deciduous forests, vision is secondary to sound. A single sharp bark from a spotted deer (chital) or the guttural alarm of a Hanuman langur high in a mahua tree tells a seasoned tracker not only that a predator is moving, but how fast and in which direction.",
        ],
      },
      {
        heading: "The Rhythm of the Buffer Zones",
        body: [
          "While core zones hold legendary territories, some of our most intimate encounters unfold in Tadoba's quieter buffer forests. With fewer vehicles and longer stretches of uninterrupted sal and bamboo, a tigress and her sub-adult cubs can walk a sandy fireline for twenty minutes completely unbothered.",
          "We pace every expedition around two unhurried drives a day, leaving midday for library conversations, camera lens care, and rest at handpicked wilderness lodges.",
        ],
      },
    ],
  },
  {
    slug: "monasteries-in-the-clouds-spiti-ladakh",
    title: "Monasteries in the Clouds: Walking the Ancient Salt Routes of Spiti",
    subtitle:
      "High-altitude passes, thousand-year-old murals, and the quiet hospitality of trans-Himalayan villages.",
    category: "Nature & Adventure",
    location: "Spiti Valley & Ladakh",
    date: "09 October 2026",
    readTime: "5 min read",
    author: "Tenzin Norbu",
    authorRole: "Himalayan Expedition Leader",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1653844573020-71f77a0ccb8c?auto=format&fit=crop&q=80",
    excerpt:
      "Above 12,000 feet, the landscape strips away everything non-essential. What remains is wind, prayer flags, and centuries of unbroken mountain wisdom.",
    quote:
      "In the high Himalayas, altitude slows your footsteps until your mind finally catches up with your body.",
    fieldNotes: [
      "Best Season: June to early October when Kunzum Pass is open; winter for snow leopard tracking.",
      "Acclimatisation: Gradual ascent via Kinnaur with two rest days at 10,000 ft.",
      "Highlights: Key Monastery dawn prayers, Pin Valley trails, homestays in Langza.",
    ],
    sections: [
      {
        heading: "The Art of Slow Ascent",
        body: [
          "Rushing into the trans-Himalaya is the most common mistake travellers make. By ascending gradually through the wooded gorges of Kinnaur before entering the stark moonscapes of Spiti, your body adapts naturally while you witness the dramatic transition from deodar cedar forests to high desert.",
          "Along the way, centuries-old gompas such as Tabo and Dhankar sit perched on eroded cliffs—living repositories of Tibetan Buddhist art that have survived empires and earthquakes.",
        ],
      },
      {
        heading: "Evenings Around the Bukhari Stove",
        body: [
          "Our favourite moments happen after sunset in village homes built of rammed earth and poplar beams. Over butter tea and freshly steamed momos, local elders share stories of winter snowbound months and the elusive snow leopards that patrol the ridgelines above Kibber.",
        ],
      },
    ],
  },
  {
    slug: "kaziranga-rhinos-after-monsoon",
    title: "When the Brahmaputra Recedes: Kaziranga's Emerald Awakening",
    subtitle:
      "Inside the alluvial floodplains of Assam where prehistoric giants, wild water buffalo, and migratory birds gather.",
    category: "Wildlife",
    location: "Kaziranga, Assam",
    date: "28 September 2026",
    readTime: "7 min read",
    author: "Dr. Meera हजारिका",
    authorRole: "Conservation Biologist",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1549414279-6984e1b270cd?auto=format&fit=crop&q=80",
    excerpt:
      "Every monsoon, the mighty Brahmaputra floods Kaziranga's grasslands, renewing the silt and life of the world's most successful rhino stronghold.",
    quote:
      "To watch a two-tonne Indian rhinoceros graze in golden elephant grass is to look straight into the Pleistocene.",
    fieldNotes: [
      "Best Season: November to April for clear skies and migratory waterfowl.",
      "Zones Covered: Central (Kohora), Western (Bagori), and Eastern (Agaratoli) birding range.",
      "Combine With: Private river cruise on the Brahmaputra and tea estate stays in Jorhat.",
    ],
    sections: [
      {
        heading: "A Landscape Shaped by Water",
        body: [
          "Kaziranga is not a forest in the traditional sense; it is a dynamic mosaic of tall elephant grass, marshlands (beels), and semi-evergreen forest islands sculpted annually by the Brahmaputra River.",
          "In the Eastern Range of Agaratoli, we spend unhurried mornings with spotting scopes trained on bar-headed geese, Pallas's fish eagles, and black-necked storks while herds of Asian elephants cross the shallow channels.",
        ],
      },
    ],
  },
  {
    slug: "architecture-of-stillness-rajasthan-heritage",
    title: "The Architecture of Stillness: Living Inside Restored Royal Forts",
    subtitle:
      "Beyond the crowded palace circuits lies a network of intimate stepwells, desert havelis, and living craft guilds.",
    category: "Culture & Heritage",
    location: "Rajasthan, India",
    date: "14 September 2026",
    readTime: "5 min read",
    author: "Devika Rathore",
    authorRole: "Architectural Historian",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
    excerpt:
      "True heritage travel is not ticking off monuments at midday—it is waking up inside lime-plastered courtyards and dining under desert stars.",
    quote:
      "Stone remembers everything when you walk through a courtyard after the tour buses have gone.",
    fieldNotes: [
      "Best Season: October to March for crisp desert evenings.",
      "Curated Access: Private stepwell dinners, master miniature-painter studios, leopard safaris in Jawai.",
      "Stays: Restored 18th-century rawlas and boutique fort estates.",
    ],
    sections: [
      {
        heading: "Craft as a Living Conversation",
        body: [
          "In quiet towns between Jodhpur and Udaipur, generations of weavers, stone carvers, and natural-dye block printers still work to the rhythm of the seasons. We arrange private studio visits where you sit with master artisans over masala chai rather than browsing commercial showrooms.",
          "Pairing Rajasthan's architectural gems with the granite hills of Jawai—where leopards coexist peacefully with Rabari herdsmen—creates a journey that balances royal history with raw wilderness.",
        ],
      },
    ],
  },
  {
    slug: "sacred-ghats-at-first-light",
    title: "Sacred Ghats at First Light: A Contemplative Himalayan & River Journey",
    subtitle:
      "From the ashram bells of Rishikesh to ancient cedar temples in the Kumaon hills.",
    category: "Spiritual",
    location: "Uttarakhand & Varanasi",
    date: "02 September 2026",
    readTime: "6 min read",
    author: "Kabir Sharma",
    authorRole: "Cultural Curator",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80",
    excerpt:
      "Spirituality in India is woven into rivers, mountain confluences, and daily ritual. We design quiet pathways to experience it without spectacle.",
    quote:
      "When the morning mist rises off the Ganges before dawn, even the busiest riverfront becomes a sanctuary.",
    fieldNotes: [
      "Best Season: September to April.",
      "Experiences: Private dawn boat meditations, Vedic chanting with scholars, forest walks in Kumaon.",
      "Pace: Unhurried mornings with dedicated time for reflection and wellness.",
    ],
    sections: [
      {
        heading: "Finding Silence in Sacred Geography",
        body: [
          "India's sacred sites can feel overwhelming when approached without local guidance. By timing our visits to the quietest hours before dawn and retreating to serene estates in the Himalayan foothills, you experience the profound stillness that drew sages to these landscapes millennia ago.",
        ],
      },
    ],
  },
  {
    slug: "leadership-retreats-in-the-wilderness",
    title: "Why Leadership Retreats Belong in the Wilderness, Not a Boardroom",
    subtitle:
      "How nature-immersed corporate off-sites unlock clarity, trust, and strategic thinking.",
    category: "Corporate MICE",
    location: "Coorg, Kabini & Jim Corbett",
    date: "19 August 2026",
    readTime: "4 min read",
    author: "Rohan Mehta",
    authorRole: "Head of Bespoke Retreats",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&q=80",
    excerpt:
      "Swap fluorescent conference halls for private forest estates where morning safaris and campfire dialogues transform how teams connect.",
    quote:
      "The best strategic breakthroughs rarely happen in front of a slide deck; they happen around a fire under a canopy of stars.",
    fieldNotes: [
      "Group Sizes: 8 to 60 executives with full buyout options at boutique lodges.",
      "Logistics: Private charters, seamless AV-equipped conservatory spaces, curated field activities.",
      "Locations: Jim Corbett, Kabini, Tadoba, Coorg, and Ranthambore.",
    ],
    sections: [
      {
        heading: "Designing the Executive Off-Site",
        body: [
          "Every Sacred Vista corporate retreat balances focused strategy sessions in sunlit pavilion spaces with shared wilderness experiences—guided forest walks, conservation briefings with park wardens, and farm-to-table bush dinners.",
        ],
      },
    ],
  },
];

const CATEGORIES = [
  "All",
  "Wildlife",
  "Corporate MICE",
  "School Trips",
  "Leisure",
  "Nature & Adventure",
  "Culture & Heritage",
  "Spiritual",
];

function SubmitBlogModal({ open, onClose }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Wildlife");
  const [location, setLocation] = useState("");
  const [author, setAuthor] = useState("");
  const [authorRole, setAuthorRole] = useState("Guest Contributor");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [quote, setQuote] = useState("");
  const [fieldNotesText, setFieldNotesText] = useState("");
  const [content, setContent] = useState("");
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
      const fieldNotes = fieldNotesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      await http.post("/blogs", {
        title: title.trim(),
        subtitle: subtitle.trim(),
        category,
        location: location.trim() || "India",
        author: author.trim(),
        authorRole: authorRole.trim() || "Guest Contributor",
        email: email.trim(),
        image: image.trim(),
        quote: quote.trim(),
        excerpt: subtitle.trim() || content.trim().slice(0, 200),
        content: content.trim(),
        fieldNotes,
      });
      setSubmitted(true);
      setTitle("");
      setSubtitle("");
      setLocation("");
      setAuthor("");
      setEmail("");
      setImage("");
      setQuote("");
      setFieldNotesText("");
      setContent("");
    } catch (err) {
      setError(apiError(err, "Could not submit your blog."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
      data-testid="blog-submit-modal"
    >
      <div
        data-lenis-prevent
        className="relative my-8 w-full max-w-2xl border border-gold/30 bg-ivory text-char shadow-2xl max-h-[88vh] overflow-y-auto overscroll-contain"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-char/15 bg-forest px-6 py-5 text-ivory">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-gold">
              Field Journal Submission
            </p>
            <h3 className="mt-1 font-serif text-2xl text-ivory">
              Share Your Wilderness Story
            </h3>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-full border border-ivory/20 p-2 text-ivory/70 hover:border-gold hover:text-gold transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 sm:p-12 text-center space-y-5" data-testid="blog-submit-success">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest text-gold">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="eyebrow">Awaiting Editorial Review</p>
            <h4 className="font-serif text-3xl text-forest">
              Thank you for your dispatch.
            </h4>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-char/75">
              Your blog has been sent to the Sacred Vista admin desk. Once an administrator reviews and accepts your submission, it will be published live on the Field Journal.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="btn-gold !px-7 !py-3 text-xs"
              >
                Back to Field Journal
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <p className="text-xs leading-relaxed text-char/70">
              Submit your travel dispatch or wildlife field note below. All entries are reviewed by our admin team before appearing live on the website.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Story Title *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Morning Mist Over Kabini Backwaters"
                  className="field mt-1"
                  data-testid="blog-input-title"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Subtitle / Short Summary
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="A brief one-line introduction to your story..."
                  className="field mt-1"
                  data-testid="blog-input-subtitle"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="field mt-1 bg-transparent"
                  data-testid="blog-input-category"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Location / Reserve *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Tadoba-Andhari, Maharashtra"
                  className="field mt-1"
                  data-testid="blog-input-location"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g., Kabir Verma"
                  className="field mt-1"
                  data-testid="blog-input-author"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="e.g., Wildlife Photographer / Traveller"
                  className="field mt-1"
                  data-testid="blog-input-role"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Email (for editorial updates)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="field mt-1"
                  data-testid="blog-input-email"
                />
              </div>

              {/* Cover Photo Upload or URL */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Cover Photograph (Upload or Paste URL)
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-char/25 bg-mist px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest hover:border-gold transition-colors">
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-gold" />
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
                    className="field !mt-0 flex-1"
                    data-testid="blog-input-image"
                  />
                </div>
                {image && (
                  <div className="mt-3 relative h-36 w-full overflow-hidden border border-char/15 bg-forest">
                    <img
                      src={img(image, 600)}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Highlight Quote (Optional)
                </label>
                <input
                  type="text"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="A memorable line or reflection from your journey..."
                  className="field mt-1"
                  data-testid="blog-input-quote"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Full Story / Article *
                </label>
                <textarea
                  rows={6}
                  required
                  minLength={20}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your full story here. Separate paragraphs with a blank line..."
                  className="mt-2 w-full border border-char/20 bg-mist/40 p-3.5 text-sm leading-relaxed text-char focus:border-gold focus:outline-none"
                  data-testid="blog-input-content"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/75">
                  Field Notes / Tips (Optional, one per line)
                </label>
                <textarea
                  rows={3}
                  value={fieldNotesText}
                  onChange={(e) => setFieldNotesText(e.target.value)}
                  placeholder={"Best Season: November to April\nKey Sightings: Bengal Tiger, Sloth Bear"}
                  className="mt-2 w-full border border-char/20 bg-mist/40 p-3 text-xs leading-relaxed text-char focus:border-gold focus:outline-none"
                  data-testid="blog-input-notes"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-char/15 pt-5">
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-full border border-char/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-char/70 hover:border-char"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="btn-gold !px-6 !py-2.5 text-xs"
                data-testid="blog-submit-btn"
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

function BlogDetailView({ post, allPosts }) {
  useSeo(
    `${post.title} — Sacred Vista Blog`,
    post.subtitle || post.excerpt
  );

  const related = (allPosts || BLOG_POSTS)
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="bg-ivory text-char" data-testid="blog-detail-page">
      {/* ── Cinematic Article Hero ── */}
      <section className="relative min-h-[62vh] flex items-end overflow-hidden bg-forest text-ivory pt-32 pb-16 sm:pb-20">
        <img
          src={img(post.image, 2000)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/70 to-black/45" />

        <div className="shell relative z-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold hover:text-sand transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Field Journal
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-gold mb-4">
            <span className="rounded-full border border-gold/50 bg-black/35 px-3.5 py-1 font-semibold">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-ivory/80">
              <MapPin className="h-3.5 w-3.5 text-gold" /> {post.location}
            </span>
            <span className="inline-flex items-center gap-1.5 text-ivory/80">
              <Clock className="h-3.5 w-3.5 text-gold" /> {post.readTime}
            </span>
            <span className="inline-flex items-center gap-1.5 text-ivory/80">
              <Calendar className="h-3.5 w-3.5 text-gold" /> {post.date}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl leading-[1.08] max-w-4xl text-ivory">
            {post.title}
          </h1>

          <p className="mt-4 max-w-2xl text-base sm:text-lg text-ivory/85 leading-relaxed">
            {post.subtitle}
          </p>

          <div className="mt-6 flex items-center gap-3 border-t border-ivory/15 pt-5 text-xs text-ivory/80">
            <span className="font-semibold text-ivory">{post.author}</span>
            <span className="text-gold">•</span>
            <span>{post.authorRole}</span>
          </div>
        </div>
      </section>

      {/* ── Article Content + Sidebar ── */}
      <section className="py-16 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 items-start">
          {/* Left: Story Body */}
          <article className="lg:col-span-7 xl:col-span-8 space-y-8">
            <p className="font-serif text-xl sm:text-2xl leading-relaxed text-forest">
              {post.excerpt}
            </p>

            {/* Pull Quote */}
            {post.quote && (
              <blockquote className="border-l-2 border-gold bg-mist/60 p-6 sm:p-8">
                <p className="font-serif text-xl sm:text-2xl italic text-forest leading-relaxed">
                  “{post.quote}”
                </p>
              </blockquote>
            )}

            {post.sections?.map((sec) => (
              <div key={sec.heading} className="space-y-4 pt-2">
                <h2 className="font-serif text-2xl sm:text-3xl text-forest">
                  {sec.heading}
                </h2>
                {sec.body.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-base sm:text-[17px] leading-[1.8] text-char/85"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </article>

          {/* Right: Sticky Field Notes & CTA */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="border border-char/15 bg-mist p-6 sm:p-8">
              <p className="eyebrow mb-3 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold" /> Field Notes
              </p>
              <h3 className="font-serif text-2xl text-forest">
                Expedition Essentials
              </h3>
              <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-char/80">
                {post.fieldNotes?.map((note, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grain relative overflow-hidden bg-forest p-7 sm:p-8 text-ivory">
              <p className="eyebrow relative z-10 mb-2">Inspired by this story?</p>
              <h3 className="relative z-10 font-serif text-2xl sm:text-3xl leading-tight">
                Craft your own {post.category.toLowerCase()} journey.
              </h3>
              <p className="relative z-10 mt-3 text-sm text-ivory/75 leading-relaxed">
                Speak directly with our naturalists and trip designers to shape a private itinerary around your dates.
              </p>
              <div className="relative z-10 mt-6 flex flex-wrap gap-3">
                <Link to="/contact" className="btn-gold !px-5 !py-2.5 text-xs">
                  Plan Your Journey <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/packages"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:text-sand transition-colors"
                >
                  Browse Packages <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Related Dispatches ── */}
      <section className="border-t border-char/15 bg-mist py-16 sm:py-24">
        <div className="shell">
          <div className="flex items-end justify-between gap-4 mb-10">
            <SectionHead
              eyebrow="Continue Reading"
              title="More from the Field Journal"
            />
            <Link
              to="/blog"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-forest hover:text-gold transition-colors"
            >
              All Articles <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                to={`/blog/${item.slug}`}
                className="group flex flex-col overflow-hidden border border-char/15 bg-ivory transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-forest">
                  <img
                    src={img(item.image, 800)}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-forest/85 backdrop-blur-md px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                    {item.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-char/60">
                      {item.date} · {item.readTime}
                    </p>
                    <h3 className="mt-2 font-serif text-xl text-forest group-hover:text-gold transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                    Read Dispatch{" "}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Blog() {
  const { slug } = useParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [approvedBlogs, setApprovedBlogs] = useState([]);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const loadApprovedBlogs = useCallback(() => {
    http
      .get("/blogs")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setApprovedBlogs(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadApprovedBlogs();
  }, [loadApprovedBlogs]);

  useSeo(
    "Field Journal & Blog",
    "Dispatches, wildlife tracking notes, and travel stories from Sacred Vista's naturalists and curators across India and East Africa."
  );

  const allPosts = useMemo(
    () => [...approvedBlogs, ...BLOG_POSTS],
    [approvedBlogs]
  );

  const activePost = useMemo(
    () => (slug ? allPosts.find((p) => p.slug === slug) : null),
    [slug, allPosts]
  );

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (post.title || "").toLowerCase().includes(q) ||
        (post.excerpt || "").toLowerCase().includes(q) ||
        (post.location || "").toLowerCase().includes(q) ||
        (post.category || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, allPosts]);

  if (activePost) {
    return <BlogDetailView post={activePost} allPosts={allPosts} />;
  }

  const featuredPost =
    allPosts.find((p) => p.featured) || allPosts[0];

  return (
    <>
      <PageHero
        image={HERO_IMAGE}
        eyebrow="Field Journal & Dispatches"
        title={["Stories from the", "quiet wild."]}
        text="Notes from our naturalists, conservation biologists, and historians across tiger reserves, Himalayan passes, and timeless heritage estates."
        crumbs={[{ label: "Home", to: "/" }, { label: "Blog" }]}
      />

      <section className="bg-ivory py-16 sm:py-24" data-testid="blog-page">
        <div className="shell">
          {/* ── Write / Submit Blog Banner ── */}
          <div className="mb-12 flex flex-col justify-between gap-4 border border-gold/35 bg-forest px-6 py-5 text-ivory sm:flex-row sm:items-center sm:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-gold">
                Community & Naturalist Dispatches
              </p>
              <p className="mt-1 font-serif text-xl sm:text-2xl text-ivory">
                Have a wilderness story or field note to share?
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              className="btn-gold shrink-0 !px-6 !py-2.5 text-xs"
              data-testid="blog-open-submit-btn"
            >
              <PenLine className="h-3.5 w-3.5" /> Write a Blog
            </button>
          </div>

          {/* ── Featured Lead Dispatch ── */}
          {activeCategory === "All" && !query.trim() && featuredPost && (
            <Reveal className="mb-16">
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="group grid overflow-hidden border border-char/15 bg-forest text-ivory lg:grid-cols-12 shadow-xl"
                data-testid="blog-featured-card"
              >
                <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-7 overflow-hidden">
                  <img
                    src={img(featuredPost.image, 1400)}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-forest/90" />
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-black/50 backdrop-blur-md px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                    <BookOpen className="h-3 w-3" /> Featured Dispatch
                  </span>
                </div>

                <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-5">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-gold">
                    <span>{featuredPost.category}</span>
                    <span>•</span>
                    <span className="text-ivory/70">{featuredPost.location}</span>
                  </div>

                  <h2 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl leading-tight text-ivory group-hover:text-gold transition-colors">
                    {featuredPost.title}
                  </h2>

                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-ivory/80 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-ivory/15 pt-5 text-xs text-ivory/70">
                    <span>
                      By <strong className="text-ivory">{featuredPost.author}</strong> ·{" "}
                      {featuredPost.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.2em] text-gold">
                      Read Story{" "}
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          {/* ── Filter Pills & Search Bar ── */}
          <div className="mb-12 flex flex-col gap-4 border-b border-char/15 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${
                      active
                        ? "bg-forest text-gold shadow-sm"
                        : "border border-char/20 bg-transparent text-char/75 hover:border-gold hover:text-forest"
                    }`}
                    data-testid={`blog-filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-char/45" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stories, places..."
                className="w-full rounded-full border border-char/20 bg-mist/60 pl-10 pr-4 py-2 text-xs text-char placeholder:text-char/50 focus:border-gold focus:outline-none"
                data-testid="blog-search-input"
              />
            </div>
          </div>

          {/* ── Articles Grid ── */}
          {filteredPosts.length === 0 ? (
            <div className="border border-char/15 bg-mist p-12 text-center">
              <p className="font-serif text-2xl text-forest">
                No dispatches match your filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setQuery("");
                }}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, idx) => (
                <Reveal key={post.slug} delay={(idx % 3) * 0.06}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group flex h-full flex-col overflow-hidden border border-char/15 bg-ivory shadow-sm transition-shadow duration-500 hover:shadow-xl"
                      data-testid={`blog-card-${post.slug}`}
                    >
                      {/* Card Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-forest">
                        <img
                          src={img(post.image, 900)}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />

                        <span className="absolute top-3.5 left-3.5 rounded-full border border-gold/45 bg-forest/85 backdrop-blur-md px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                          {post.category}
                        </span>

                        <span className="absolute bottom-3 left-3.5 inline-flex items-center gap-1 text-[11px] text-ivory/90">
                          <MapPin className="h-3 w-3 text-gold" /> {post.location}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-char/55">
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>

                          <h3 className="mt-2.5 font-serif text-2xl leading-snug text-forest group-hover:text-gold transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="mt-3 text-sm leading-relaxed text-char/75 line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-char/10 pt-4 text-xs">
                          <span className="text-char/70 font-medium">
                            {post.author}
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.2em] text-gold">
                            Read{" "}
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <SubmitBlogModal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
      />
    </>
  );
}

