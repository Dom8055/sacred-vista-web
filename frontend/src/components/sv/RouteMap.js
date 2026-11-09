import { motion } from "framer-motion";
import { INDIA_BOX, INDIA_PATH, KENYA_BOX, KENYA_PATH } from "@/data/mapGeo";
import { project } from "@/components/home/WorldMap";

const toUnits = (box, s) => {
  const p = project(box, s.lat, s.lng);
  return { ...s, x: (p.x * box.w) / 100, y: (p.y * box.h) / 100 };
};

// Merge stops that share a place (e.g. start and return city).
const groupStops = (pts) => {
  const out = [];
  pts.forEach((p) => {
    const hit = out.find((o) => o.name === p.name && Math.abs(o.x - p.x) < 0.01);
    if (hit) hit.days.push(p.day);
    else out.push({ ...p, days: [p.day] });
  });
  return out;
};

const curve = (pts) =>
  pts.reduce((d, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const a = pts[i - 1];
    const mx = (a.x + p.x) / 2;
    const my = (a.y + p.y) / 2;
    const dx = p.x - a.x;
    const dy = p.y - a.y;
    return `${d} Q${mx - dy * 0.22},${my + dx * 0.22} ${p.x},${p.y}`;
  }, "");

export default function RouteMap({ route, continent }) {
  const africa = continent === "africa";
  const box = africa ? KENYA_BOX : INDIA_BOX;
  const pts = route.map((s) => toUnits(box, s));
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), box.w * 0.04);
  const pad = span * 0.45;
  let x0 = Math.min(...xs) - pad;
  let y0 = Math.min(...ys) - pad;
  let w = Math.max(...xs) - Math.min(...xs) + pad * 2;
  let h = Math.max(...ys) - Math.min(...ys) + pad * 2;
  const ratio = 1.6;
  if (w / h < ratio) { x0 -= (h * ratio - w) / 2; w = h * ratio; } else { y0 -= (w / ratio - h) / 2; h = w / ratio; }
  const stops = groupStops(pts);
  const pct = (p) => ({ left: `${((p.x - x0) / w) * 100}%`, top: `${((p.y - y0) / h) * 100}%` });
  const d = curve(pts);
  // Nudge markers apart so close stops stay legible; leader lines point to the true spot.
  const min = w * 0.065;
  const marks = stops.map((s) => ({ x: s.x, y: s.y }));
  for (let it = 0; it < 40; it += 1) {
    for (let i = 0; i < marks.length; i += 1) {
      for (let j = i + 1; j < marks.length; j += 1) {
        const dx = marks[j].x - marks[i].x;
        const dy = marks[j].y - marks[i].y;
        const dist = Math.hypot(dx, dy) || 0.001;
        if (dist < min) {
          const push = (min - dist) / 2;
          const ux = dist > 0.001 ? dx / dist : Math.cos(j);
          const uy = dist > 0.001 ? dy / dist : Math.sin(j);
          marks[i].x -= ux * push; marks[i].y -= uy * push;
          marks[j].x += ux * push; marks[j].y += uy * push;
        }
      }
    }
  }

  return (
    <div>
    <div className="relative overflow-hidden bg-forest" style={{ aspectRatio: `${ratio}` }} data-testid="route-map">
      <svg viewBox={`${x0} ${y0} ${w} ${h}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="rt-dots" width={w / 90} height={w / 90} patternUnits="userSpaceOnUse"><circle cx={w / 180} cy={w / 180} r={w / 520} fill="#D8C9AD" opacity="0.5" /></pattern>
          <clipPath id="rt-clip"><path d={africa ? KENYA_PATH : INDIA_PATH} /></clipPath>
        </defs>
        <path d={africa ? KENYA_PATH : INDIA_PATH} fill="#1c3329" stroke="#B68B50" strokeWidth={w / 500} />
        <rect x={x0} y={y0} width={w} height={h} fill="url(#rt-dots)" clipPath="url(#rt-clip)" />
        <path d={d} fill="none" stroke="#F5F0E5" strokeOpacity="0.15" strokeWidth={w / 160} strokeLinecap="round" />
        <motion.path d={d} fill="none" stroke="#B68B50" strokeWidth={w / 260} strokeLinecap="round"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 2.6, ease: "easeInOut" }} data-testid="route-path" />
        {stops.map((s, i) => (
          <g key={`l-${i}`}>
            <line x1={s.x} y1={s.y} x2={marks[i].x} y2={marks[i].y} stroke="#D8C9AD" strokeOpacity="0.6" strokeWidth={w / 700} />
            <circle cx={s.x} cy={s.y} r={w / 260} fill="#F5F0E5" />
          </g>
        ))}
      </svg>
      {stops.map((s, i) => (
        <motion.div key={`${s.name}-${i}`} className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(marks[i])}
          initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + (i / Math.max(stops.length - 1, 1)) * 2.2, duration: 0.5 }} data-testid={`route-stop-${i}`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-ivory bg-gold font-serif text-[10px] text-forest shadow-[0_0_0_4px_rgba(182,139,80,0.25)] sm:h-7 sm:w-7 sm:text-xs" aria-hidden="true">{i + 1}</span>
        </motion.div>
      ))}
      <span className="absolute bottom-3 right-4 text-xs uppercase tracking-[0.25em] text-ivory/60">{africa ? "Kenya" : "India"} · Indicative route</span>
    </div>
    <ol className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="route-legend">
      {stops.map((s, i) => (
        <li key={`k-${i}`} className="flex items-baseline gap-3 border-b border-char/10 pb-2">
          <span className="font-serif text-sm italic text-gold">{i + 1}</span>
          <span><span className="block font-serif text-lg text-forest">{s.name}</span><span className="text-xs uppercase tracking-[0.16em] text-char/60">Day {s.days.join(" · ")}</span></span>
        </li>
      ))}
    </ol>
    </div>
  );
}
