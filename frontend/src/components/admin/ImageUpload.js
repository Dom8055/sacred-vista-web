import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { apiError, http, img } from "@/lib/sv";

export default function ImageUpload({
  label = "Image",
  value = "",
  onChange,
  aspect = "aspect-[16/9]",
  className = "",
  testId = "image-upload",
}) {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File is larger than 10 MB.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await http.post("/admin/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });

      if (res.data?.url) {
        onChange(res.data.url);
      }
    } catch (err) {
      setError(apiError(err) || "Failed to upload image.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUrlApply = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft("");
      setShowUrlInput(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`} data-testid={testId}>
      {/* Label & URL toggle */}
      <div className="flex items-center justify-between text-xs">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-char/70">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-char/50 hover:text-gold transition-colors"
        >
          <Link2 className="h-3 w-3" />
          {showUrlInput ? "Hide URL input" : "Or paste URL"}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
        disabled={busy}
      />

      {/* URL Input (if toggled) */}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Paste https:// image address..."
            className="flex-1 border border-char/20 bg-white px-3 py-2 text-xs text-char focus:border-gold focus:outline-none"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            disabled={!urlDraft.trim()}
            className="border border-char/20 bg-white px-3 py-2 text-xs font-semibold text-forest hover:border-gold disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      )}

      {/* Image Preview / Upload Drop Area */}
      {value ? (
        <div className={`relative overflow-hidden border border-char/20 rounded-sm bg-forest ${aspect}`}>
          <img
            src={img(value, 800)}
            alt={label}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest/90 px-3 py-1.5 text-xs text-ivory hover:bg-forest transition-colors shadow-sm"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 text-gold" />}
              Change Image
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-700/80 text-white hover:bg-red-700 transition-colors shadow-sm"
              aria-label="Remove image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-char/25 bg-white/70 p-6 text-char/60 transition-colors hover:border-gold hover:bg-white hover:text-forest ${aspect}`}
        >
          {busy ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
              <span className="text-xs font-medium">Uploading image...</span>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/5 text-forest">
                <Upload className="h-5 w-5 text-gold" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                Upload Image
              </span>
              <span className="text-[10px] text-char/50">
                Click to browse (JPG, PNG, WebP up to 10 MB)
              </span>
            </>
          )}
        </button>
      )}

      {/* Error alert */}
      {error && (
        <p className="text-[11px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

