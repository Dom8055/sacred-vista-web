import { Link } from "react-router-dom";
import { Compass, RotateCw } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";

export const Loading = ({ label = "Preparing your expedition…", dark = false }) => (
  <div className={`flex min-h-[40vh] flex-col items-center justify-center gap-5 ${dark ? "text-ivory" : "text-forest"}`} data-testid="loading-state" role="status">
    <span className="relative flex h-12 w-12 items-center justify-center">
      <span className="absolute inset-0 animate-spin rounded-full border border-gold/20 border-t-gold" />
      <Compass className="h-5 w-5 text-gold" />
    </span>
    <p className="text-sm tracking-wide opacity-70">{label}</p>
  </div>
);

export const Empty = ({ title, text, action }) => (
  <div className="flex flex-col items-center justify-center border border-dashed border-sand px-6 py-20 text-center" data-testid="empty-state">
    <Compass className="mb-5 h-8 w-8 text-gold" />
    <h3 className="text-2xl text-forest">{title}</h3>
    {text && <p className="mt-3 max-w-md text-char/70">{text}</p>}
    {action && <div className="mt-8">{action}</div>}
  </div>
);

export const CatalogError = () => {
  const { reload } = useCatalog();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center" data-testid="error-state">
      <h3 className="text-2xl text-forest">We couldn't load our journeys.</h3>
      <p className="mt-3 text-char/70">Please check your connection and try again.</p>
      <button type="button" onClick={reload} className="btn-dark mt-8" data-testid="retry-catalog-btn"><RotateCw className="h-4 w-4" /> Try again</button>
    </div>
  );
};

// Renders children only when catalog is ready.
export const CatalogGate = ({ children, dark }) => {
  const { status } = useCatalog();
  if (status === "loading") return <Loading dark={dark} />;
  if (status === "error") return <CatalogError />;
  return children;
};

export const NotFoundBlock = ({ title, text, to, cta }) => (
  <div className="shell flex min-h-[80vh] flex-col items-start justify-center pt-32 pb-20 text-ivory" data-testid="not-found-state">
    <p className="eyebrow mb-5">Off the map</p>
    <h1 className="text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
    <p className="mt-6 max-w-lg text-ivory/75">{text}</p>
    <Link to={to} className="btn-gold mt-10" data-testid="not-found-cta">{cta}</Link>
  </div>
);
