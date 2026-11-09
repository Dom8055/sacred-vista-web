// Central business configuration — edit here, never inside components.
export const SITE = {
  name: "Sacred Vista",
  tagline: "Private wildlife expeditions & curated journeys",
  description:
    "Sacred Vista designs private wildlife safaris and curated journeys across India and East Africa — from tiger country to the Masai Mara, planned by hand and confirmed personally.",
  email: "obhalane@gmail.com",
  phone: "+91 72496 0354",
  whatsapp: "+91 72496 0354", // digits only, include country code for wa.me (e.g. 91XXXXXXXXXX)
  address: null, // e.g. "Studio 4, ... Pune, India" — hidden while null
  socials: [
    { id: "instagram", label: "Instagram", handle: "@sacredvista", url: "https://www.instagram.com/" },
    { id: "facebook", label: "Facebook", handle: "Sacred Vista Expeditions", url: "https://www.facebook.com/" },
    { id: "youtube", label: "YouTube", handle: "Sacred Vista Films", url: "https://www.youtube.com/" },
    { id: "linkedin", label: "LinkedIn", handle: "Sacred Vista", url: "https://www.linkedin.com/" },
    { id: "twitter", label: "X (Twitter)", handle: "@sacredvista", url: "https://x.com/" },
    { id: "whatsapp", label: "WhatsApp", handle: "+91 72496 0354", url: "https://wa.me/724960354" },
  ],
  policyUpdated: "31 October 2026",
};

export const NAV = [
  { label: "Home", to: "/" },
  { label: "Category", to: "/#category", selector: '[data-testid="segments-showcase"]' },
  { label: "Destination", to: "/destinations" },
  { label: "Packages", to: "/packages" },
  { label: "Gallery", to: "/gallery" },
  { label: "Blog", to: "/blog" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact Us", to: "/contact" },
  { label: "About Us", to: "/#about", selector: '[data-testid="why-section"]' },
  { label: "Philosophy", to: "/#philosophy", selector: '[data-testid="brand-story"]' },
  { label: "FAQ", to: "/#faq", selector: '[data-testid="faq-section"]' },
];

export const LEGAL_LINKS = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms-conditions" },
];

export const HOME_DEFAULT = {
  eyebrow: "Private wildlife expeditions · India & East Africa",
  lines: ["Enter the wild,", "unhurried."],
  description:
    "Naturalist-led safaris and journeys composed by hand — through tiger forests, rhino grasslands, Himalayan silence and the golden savannah.",
  accent: "Seven destinations · Two continents · One quiet philosophy",
  image: "https://images.unsplash.com/photo-1586617356423-52763004deac?auto=format&fit=crop&q=80",
};

export const WHY = [
  {
    title: "Curated experiences",
    eyebrow: "Tailored to the Wild",
    text: "Every journey is composed around wildlife rhythms, light and pace — never a template.",
    detail:
      "We align every game drive, river crossing and mountain morning with seasonal migrations, golden-hour light and unhurried private access.",
    highlights: ["Seasonal wildlife tracking", "Golden-hour field sessions", "Zero fixed templates"],
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80",
  },
  {
    title: "Expert planning",
    eyebrow: "Field-Led Intelligence",
    text: "Naturalists, historians and local hosts shape each itinerary with knowledge you cannot search for.",
    detail:
      "From veteran forest trackers in Central India to high-altitude guides in Ladakh, your expedition is architected by specialists who live on the land.",
    highlights: ["Dedicated private naturalists", "Historians & cultural scholars", "24/7 on-ground concierge"],
    image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80",
  },
  {
    title: "Authentic destinations",
    eyebrow: "Beyond the Tourist Trail",
    text: "Reserves, villages and valleys chosen for their character — not their crowds.",
    detail:
      "We bypass commercial circuits in favour of quiet buffer zones, remote Himalayan monasteries, heritage estates and untouched conservation corridors.",
    highlights: ["Low-density core zones", "Private community access", "Untouched wilderness"],
    image: "https://images.unsplash.com/photo-1653844573020-71f77a0ccb8c?auto=format&fit=crop&q=80",
  },
  {
    title: "Personalised journeys",
    eyebrow: "Bespoke From Day One",
    text: "Dates, lodges, pace and interests are tuned to you through a personal conversation.",
    detail:
      "Whether travelling with family, a photography team or seeking quiet solitude, every transfer, meal and activity bends around your rhythm.",
    highlights: ["Flexible daily pacing", "Custom charters & transfers", "Tailored around your interests"],
    image: "https://images.unsplash.com/photo-1549414279-6984e1b270cd?auto=format&fit=crop&q=80",
  },
  {
    title: "Quality & comfort",
    eyebrow: "Wilderness & Refinement",
    text: "Handpicked lodges, camps and homestays where comfort never dulls the wild.",
    detail:
      "Stay in intimate tented camps, restored royal forts and architectural eco-lodges chosen for their sense of place, warmth and culinary craft.",
    highlights: ["Boutique wilderness lodges", "Heritage forts & estates", "Regional culinary craft"],
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80",
  },
  {
    title: "Responsible exploration",
    eyebrow: "Conservation First",
    text: "Ethical wildlife viewing, local guides and respect for the communities who share these landscapes.",
    detail:
      "Every journey supports local indigenous trackers, village cooperatives and strict low-impact wildlife viewing protocols.",
    highlights: ["Ethical distance protocols", "Local community hosts", "Conservation-backed stays"],
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80",
  },
];

export const FAQS = [
  { q: "How does booking work?", a: "Sacred Vista is inquiry-based. Share your interests through the form or WhatsApp, and our team replies with a tailored proposal. Arrangements are confirmed manually once you approve the plan." },
  // { q: "Are the listed prices final?", a: "Prices shown are indicative starting prices per person. Final pricing depends on dates, lodge availability, group size and permits, and is confirmed in writing before any payment." },
  { q: "Can itineraries be customised?", a: "Yes. Every itinerary can be lengthened, shortened or combined with another destination. Tell us what matters most to you." },
  { q: "Are wildlife sightings guaranteed?", a: "No responsible operator can guarantee sightings. We maximise your chances through experienced naturalists, the right season and enough time in the field." },
  { q: "Do you arrange international trips such as Kenya?", a: "Yes — our Masai Mara safari includes in-country flights, camps and game drives. International flights and visas are usually arranged by the traveller with our guidance." },
];

const note = "This is sample policy content prepared for review. Please have it checked by your legal advisor before launch.";

export const POLICIES = {
  privacy: {
    title: "Privacy Policy",
    intro: "How Sacred Vista collects, uses and protects the information you share with us.",
    notice: note,
    sections: [
      { h: "Information we collect", p: ["When you send an inquiry we collect your name, email address, phone number, travel interests and any message you provide.", "We may also receive basic technical information such as browser type and pages visited, used only to keep the website working well."] },
      { h: "How we use your information", p: ["To respond to your inquiry, prepare travel proposals and coordinate arrangements with lodges, guides and transport partners you approve.", "We do not sell your personal information."] },
      { h: "Sharing with partners", p: ["Where a journey is confirmed, relevant details (such as names and ID for permits) are shared only with the service providers needed to deliver it."] },
      { h: "Data retention", p: ["Inquiry information is kept for as long as necessary to serve you and meet legal or accounting obligations, after which it is deleted or anonymised."] },
      { h: "Your choices", p: ["You may ask us to access, correct or delete your information at any time by writing to the email listed on our Contact page."] },
      { h: "Updates", p: ["We may update this policy from time to time. The date at the top of this page shows when it was last revised."] },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "The terms that apply when you use this website and plan a journey with Sacred Vista.",
    notice: note,
    sections: [
      { h: "Use of this website", p: ["Content on this website is provided for general information and inspiration. Itineraries, images and prices are illustrative and may change."] },
      { h: "Inquiries and proposals", p: ["Submitting an inquiry does not create a booking. A journey is confirmed only after you accept a written proposal and our team confirms availability."] },
      { h: "Itinerary changes", p: ["Wildlife reserves, weather, permits and local conditions can require changes. We will always seek comparable alternatives and keep you informed."] },
      { h: "Traveller responsibilities", p: ["Travellers are responsible for valid passports, visas, vaccinations and travel insurance, and for following guide and park instructions at all times."] },
      { h: "Liability", p: ["Sacred Vista coordinates services from independent providers. Our responsibility is limited to the services we directly provide, to the extent permitted by law."] },
      { h: "Intellectual property", p: ["Text, design and branding on this website belong to Sacred Vista. Stock images are used under their respective licences."] },
    ],
  },
};
