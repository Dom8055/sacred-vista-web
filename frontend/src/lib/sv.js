import axios from "axios";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL !== undefined
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8001"
).replace(/\/$/, "");
export const API = `${BACKEND_URL}/api`;
export const http = axios.create({ baseURL: API, timeout: 15000 });

http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("sv_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const img = (url, w = 1600) => {
  if (!url) return "";
  if (url.startsWith("/api/files/")) return `${BACKEND_URL}${url}`;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (url.includes("/upload/f_auto")) return url;
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w},c_limit/`);
  }
  if (url.includes("images.unsplash.com")) return `${url}&w=${w}&fm=webp`;
  if (url.includes("images.pexels.com")) return url.replace(/w=\d+/, `w=${w}`);
  return url;
};

export const inr = (n) =>
  n ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n) : "Price on request";

export const nights = (days) => `${days} Days · ${Math.max(days - 1, 0)} Nights`;

export const apiError = (e) => {
  const detail = e?.response?.data?.detail;
  if (!detail) return e?.message === "Network Error" ? "We couldn't reach our server. Please try again." : "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => (d?.msg || "").replace(/^Value error, /, "")).filter(Boolean).join(" ");
  return String(detail?.msg || detail);
};

export const pad = (n) => String(n).padStart(2, "0");
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
