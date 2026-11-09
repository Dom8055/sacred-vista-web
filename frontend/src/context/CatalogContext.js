import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http } from "@/lib/sv";

const CatalogContext = createContext(null);
const EMPTY = { segments: [], destinations: [], packages: [], gallery: [] };

export function CatalogProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState("loading");

  const load = useCallback(() => {
    setStatus("loading");
    http
      .get("/catalog")
      .then((res) => {
        const d = res.data || {};
        setData({
          segments: Array.isArray(d.segments) ? d.segments : [],
          destinations: Array.isArray(d.destinations) ? d.destinations : [],
          packages: Array.isArray(d.packages) ? d.packages : [],
          gallery: Array.isArray(d.gallery) ? d.gallery : [],
        });
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
    const pk = byId(data.packages);
    const ds = byId(data.destinations);
    const sg = byId(data.segments);
    return {
      ...data,
      status,
      reload: load,
      getPackage: (id) => pk[id],
      getDestination: (id) => ds[id],
      getSegment: (id) => sg[id],
      packagesForDestination: (id) => data.packages.filter((p) => p.destination_id === id),
      packagesForSegment: (id) => data.packages.filter((p) => p.segment_id === id),
    };
  }, [data, status, load]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
