import { useEffect } from "react";
import { SITE } from "@/data/site";

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

export function useSeo(title, description = SITE.description, image) {
  useEffect(() => {
    const full = title ? `${title} — ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
    document.title = full;
    setMeta("name", "description", description);
    setMeta("property", "og:title", full);
    setMeta("property", "og:description", description);
    if (image) setMeta("property", "og:image", image);
    setMeta("name", "twitter:card", "summary_large_image");
  }, [title, description, image]);
}
