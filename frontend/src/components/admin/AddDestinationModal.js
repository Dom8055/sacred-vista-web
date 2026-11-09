import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { apiError, http } from "@/lib/sv";
import ImageUpload from "./ImageUpload";

const CONTINENTS = ["asia", "africa", "europe", "americas", "oceania", "antarctica"];

const BLANK = {
  id: "",
  name: "",
  region: "",
  country: "India",
  continent: "asia",
  lat: "",
  lng: "",
  tagline: "",
  description: "",
  banner: "",
  best_time: "",
  getting_there: "",
};

export default function AddDestinationModal({ open, destination = null, onClose, onSaved }) {
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(destination?.id);

  useEffect(() => {
    if (destination) {
      setForm({
        id: destination.id || "",
        name: destination.name || "",
        region: destination.region || "",
        country: destination.country || "India",
        continent: destination.continent || "asia",
        lat: destination.lat ?? "",
        lng: destination.lng ?? "",
        tagline: destination.tagline || "",
        description: destination.description || "",
        banner: destination.banner || "",
        best_time: destination.best_time || "",
        getting_there: destination.getting_there || "",
      });
    } else {
      setForm(BLANK);
    }
    setError("");
  }, [destination, open]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    let latVal = parseFloat(form.lat);
    let lngVal = parseFloat(form.lng);

    // If blank or 0, provide sensible default inside the map region
    if (isNaN(latVal) || latVal === 0) {
      latVal = form.continent === "asia" || form.country.toLowerCase() === "india" ? 20.0 : 0.0;
    }
    if (isNaN(lngVal) || lngVal === 0) {
      lngVal = form.continent === "asia" || form.country.toLowerCase() === "india" ? 77.0 : 37.0;
    }

    const payload = {
      ...form,
      lat: latVal,
      lng: lngVal,
    };

    try {
      if (isEdit) {
        await http.put(`/admin/destinations/${destination.id}`, payload);
      } else {
        await http.post("/admin/destinations", payload);
      }
      setForm(BLANK);
      onSaved();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" data-lenis-prevent>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal card */}
      <div data-lenis-prevent className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain bg-ivory border border-char/15 shadow-2xl">
        <div className="flex items-center justify-between border-b border-char/10 px-7 py-5">
          <h2 className="font-serif text-2xl text-forest">{isEdit ? "Edit Destination" : "Add Destination"}</h2>
          <button type="button" onClick={onClose} className="text-char/50 hover:text-forest transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-7 py-6 space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-char/60 mb-1">Destination Name *</label>
            <input
              className="w-full border border-char/20 bg-white px-4 py-2.5 text-sm text-char focus:border-forest focus:outline-none"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Harishchandragadh"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-char/60 mb-1">Region</label>
              <input
                className="w-full border border-char/20 bg-white px-4 py-2.5 text-sm text-char focus:border-forest focus:outline-none"
                value={form.region}
                onChange={set("region")}
                placeholder="e.g. Western Ghats · Maharashtra"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-char/60 mb-1">Country</label>
              <input
                className="w-full border border-char/20 bg-white px-4 py-2.5 text-sm text-char focus:border-forest focus:outline-none"
                value={form.country}
                onChange={set("country")}
                placeholder="e.g. India"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-char/60 mb-1">Continent</label>
              <select
                className="w-full border border-char/20 bg-white px-3 py-2.5 text-sm text-char focus:border-forest focus:outline-none capitalize"
                value={form.continent}
                onChange={set("continent")}
              >
                {CONTINENTS.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-char/60 mb-1">
                Map Latitude
              </label>
              <input
                type="number"
                step="any"
                className="w-full border border-char/20 bg-white px-3 py-2.5 text-sm text-char focus:border-forest focus:outline-none"
                value={form.lat}
                onChange={set("lat")}
                placeholder="e.g. 19.39"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-char/60 mb-1">
                Map Longitude
              </label>
              <input
                type="number"
                step="any"
                className="w-full border border-char/20 bg-white px-3 py-2.5 text-sm text-char focus:border-forest focus:outline-none"
                value={form.lng}
                onChange={set("lng")}
                placeholder="e.g. 73.78"
              />
            </div>
          </div>
          <p className="text-[11px] text-char/50 -mt-3">
            Tip: Latitude & Longitude place the pin on the interactive India map (e.g. 19.39, 73.78).
          </p>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-char/60 mb-1">Tagline</label>
            <input
              className="w-full border border-char/20 bg-white px-4 py-2.5 text-sm text-char focus:border-forest focus:outline-none"
              value={form.tagline}
              onChange={set("tagline")}
              placeholder="Short evocative line"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-char/60 mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full border border-char/20 bg-white px-4 py-2.5 text-sm text-char focus:border-forest focus:outline-none resize-none"
              value={form.description}
              onChange={set("description")}
              placeholder="Brief description of this destination"
            />
          </div>

          <ImageUpload
            label="Banner Image"
            value={form.banner}
            onChange={(url) => setForm((f) => ({ ...f, banner: url }))}
            aspect="aspect-[21/9]"
            testId="destination-banner-upload"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-char/60 mb-1">Best Time to Visit</label>
              <input
                className="w-full border border-char/20 bg-white px-4 py-2.5 text-sm text-char focus:border-forest focus:outline-none"
                value={form.best_time}
                onChange={set("best_time")}
                placeholder="e.g. Oct – Mar"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-char/60 mb-1">Getting There</label>
              <input
                className="w-full border border-char/20 bg-white px-4 py-2.5 text-sm text-char focus:border-forest focus:outline-none"
                value={form.getting_there}
                onChange={set("getting_there")}
                placeholder="Nearest airport / rail / road"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm border border-char/20 text-char hover:border-forest transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn-gold flex items-center gap-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEdit ? "Update Destination" : "Save Destination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
