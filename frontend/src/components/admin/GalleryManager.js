import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Link2, Loader2, Star, Trash2, Upload } from "lucide-react";
import { apiError, http, img } from "@/lib/sv";

const MAX = 16;

export default function GalleryManager({ gallery, cover, onChange, onCover }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  const upload = async (files) => {
    const list = Array.from(files || []).slice(0, MAX - gallery.length);
    if (!list.length) return;
    setBusy(true);
    setError("");
    const added = [];
    for (const f of list) {
      if (f.size > 10 * 1024 * 1024) { setError(`${f.name} is larger than 10 MB.`); continue; }
      const fd = new FormData();
      fd.append("file", f);
      try {
        const { data } = await http.post("/admin/uploads", fd, { timeout: 120000 });
        added.push(data.url);
      } catch (e) {
        setError(`${f.name}: ${apiError(e)}`);
      }
    }
    if (added.length) {
      onChange([...gallery, ...added]);
      if (!cover) onCover(added[0]);
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  };

  const addLink = () => {
    const url = link.trim();
    if (!/^https:\/\/\S+$/.test(url)) { setError("Links must start with https://"); return; }
    setError("");
    onChange([...gallery, url]);
    setLink("");
  };

  const move = (i, dir) => {
    const next = [...gallery];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i) => onChange(gallery.filter((_, k) => k !== i));

  return (
    <div data-testid="gallery-manager">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Photos · {gallery.length}/{MAX}</p>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => upload(e.target.files)} data-testid="gallery-file-input" />
          <button type="button" onClick={() => input.current?.click()} disabled={busy || gallery.length >= MAX} className="btn-dark !px-5 !py-2.5 disabled:opacity-50" data-testid="gallery-upload-btn">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{busy ? "Uploading…" : "Upload photos"}
          </button>
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Photo link</span>
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-char/50" />
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="…or paste an https:// image link" className="w-full border border-char/20 bg-ivory py-2.5 pl-9 pr-3 text-sm focus:border-gold focus:outline-none" data-testid="gallery-link-input" />
        </label>
        <button type="button" onClick={addLink} disabled={!link.trim() || gallery.length >= MAX} className="border border-char/20 px-4 text-sm hover:border-gold disabled:opacity-40" data-testid="gallery-link-add-btn">Add</button>
      </div>
      {error && <p className="mb-4 text-sm text-red-700" role="alert" data-testid="gallery-error">{error}</p>}
      {gallery.length === 0 ? (
        <p className="border border-dashed border-char/25 p-8 text-center text-sm text-char/60">No photos yet — upload some to build this package's gallery.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {gallery.map((url, i) => {
            const isCover = url === cover;
            return (
              <li key={`${url}-${i}`} className={`group relative overflow-hidden border-2 ${isCover ? "border-gold" : "border-transparent"}`} data-testid={`gallery-photo-${i}`}>
                <img src={img(url, 400)} alt={`Photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                {isCover && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-forest">Cover</span>}
                <div className="flex items-center justify-between bg-forest px-1.5 py-1 text-ivory">
                  <div className="flex">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 hover:text-gold disabled:opacity-30" aria-label="Move left" data-testid={`gallery-photo-${i}-left`}><ArrowLeft className="h-4 w-4" /></button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === gallery.length - 1} className="p-1.5 hover:text-gold disabled:opacity-30" aria-label="Move right" data-testid={`gallery-photo-${i}-right`}><ArrowRight className="h-4 w-4" /></button>
                  </div>
                  <div className="flex">
                    <button type="button" onClick={() => onCover(url)} disabled={isCover} className="p-1.5 hover:text-gold disabled:text-gold" aria-label="Use as cover photo" data-testid={`gallery-photo-${i}-cover`}><Star className={`h-4 w-4 ${isCover ? "fill-gold" : ""}`} /></button>
                    <button type="button" onClick={() => remove(i)} className="p-1.5 hover:text-red-300" aria-label="Remove photo" data-testid={`gallery-photo-${i}-remove`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-char/60">The first photos appear first on the package page. The ★ cover photo is used on cards and the page hero. Save the package to publish changes.</p>
    </div>
  );
}
