import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { img, MONTHS } from "@/lib/sv";
import { Reveal } from "@/components/sv/Motion";

const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function Pick({ dest, level }) {
  return (
    <motion.div layout className="min-w-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.45 }}>
      <Link to={`/destinations/${dest.id}`} className="group flex items-center gap-4 border border-char/10 bg-ivory p-3 transition-colors hover:border-gold" data-testid={`season-pick-${dest.id}`}>
        <span className="h-20 w-20 shrink-0 overflow-hidden"><img src={img(dest.banner, 300)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" /></span>
        <span className="min-w-0 flex-1">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] ${level === 2 ? "bg-gold text-forest" : "bg-sage/30 text-forest"}`}>{level === 2 ? "Peak season" : "Good time"}</span>
          <span className="mt-1.5 block font-serif text-xl text-forest">{dest.name}</span>
          <span className="block truncate text-xs text-char/70">{dest.region}</span>
        </span>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-gold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}

export default function SeasonFinder({ destinations }) {
  const [params, setParams] = useSearchParams();
  const raw = Number(params.get("month"));
  const month = raw >= 1 && raw <= 12 ? raw - 1 : new Date().getMonth();
  const choose = (m) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    next.set("month", String(m + 1));
    return next;
  }, { replace: true, preventScrollReset: true });

  const ranked = destinations.map((d) => ({ d, level: d.best_months?.[month] ?? 0 })).filter((x) => x.level > 0).sort((a, b) => b.level - a.level);
  const off = destinations.filter((d) => !(d.best_months?.[month] > 0));

  return (
    <section className="bg-mist py-20 sm:py-24" data-testid="season-finder">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <Reveal as="p" className="eyebrow mb-5">Seasonal finder</Reveal>
          <h2 className="text-4xl leading-[1.08] text-forest sm:text-5xl">When do you want <span className="italic">to travel?</span></h2>
          <p className="mt-5 text-char/75">Pick a month and we'll show where the wild is at its best.</p>
          <div className="mt-8 grid grid-cols-4 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Travel month" data-testid="season-months">
            {MONTHS.map((m, i) => (
              <button key={m} type="button" role="radio" aria-checked={month === i} aria-label={FULL[i]} onClick={() => choose(i)} data-testid={`season-month-${i + 1}`}
                className={`rounded-full border py-2.5 text-sm transition-colors ${month === i ? "border-forest bg-forest text-ivory" : "border-char/20 text-char/80 hover:border-gold"}`}>{m}</button>
            ))}
          </div>
        </div>
        <div className="min-w-0 lg:col-span-7">
          <p className="mb-5 text-sm uppercase tracking-[0.2em] text-char/70" data-testid="season-summary">
            {FULL[month]} · {ranked.filter((x) => x.level === 2).length} at peak · {ranked.filter((x) => x.level === 1).length} good
          </p>
          {ranked.length === 0 ? (
            <p className="text-char/70">None of our destinations are at their best this month — ask us for ideas.</p>
          ) : (
            <motion.div layout className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {ranked.map(({ d, level }) => <Pick key={`${d.id}-${month}`} dest={d} level={level} />)}
              </AnimatePresence>
            </motion.div>
          )}
          {off.length > 0 && <p className="mt-6 text-sm text-char/70">Not ideal in {FULL[month]}: {off.map((d) => d.name).join(", ")}.</p>}
        </div>
      </div>
    </section>
  );
}
