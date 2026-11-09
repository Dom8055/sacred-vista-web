import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export function Reveal({ children, delay = 0, y = 32, className = "", as = "div", ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  if (reduce) return <Tag className={className} {...rest}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 1, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Masked line-by-line headline reveal. Observer sits on the unclipped wrapper.
export function MaskLines({ lines, className = "", lineClassName = "", delay = 0, onMount = false, as = "h2", testId }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const trigger = onMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.1 } };
  return (
    <Tag className={className} initial={reduce ? false : "hide"} {...trigger} data-testid={testId}>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] ${lineClassName}`}>
          <motion.span
            className="block"
            variants={{ hide: { y: "110%" }, show: { y: "0%", transition: { duration: 1.1, delay: delay + i * 0.12, ease: EASE } } }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function Marquee({ items, className = "" }) {
  const row = [...items, ...items];
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap hover:[animation-play-state:paused]">
        {row.map((item, i) => {
          const isObj = typeof item === "object" && item !== null;
          const label = isObj ? item.name || item.title : item;
          const to = isObj ? item.to : null;

          return (
            <span
              key={i}
              className="flex items-center gap-10 font-serif text-5xl italic sm:text-7xl lg:text-8xl"
            >
              {to ? (
                <Link
                  to={to}
                  className="transition-colors duration-300 hover:text-gold cursor-pointer"
                  data-testid={`marquee-link-${isObj && item.id ? item.id : i}`}
                >
                  {label}
                </Link>
              ) : (
                <span>{label}</span>
              )}
              <span className="h-2 w-2 rotate-45 bg-gold shrink-0" />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function SectionHead({ eyebrow, title, text, dark = false, className = "", align = "left" }) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && <Reveal as="p" className="eyebrow mb-5">{eyebrow}</Reveal>}
      <MaskLines lines={Array.isArray(title) ? title : [title]} className={`text-4xl leading-[1.08] sm:text-5xl lg:text-6xl ${dark ? "text-ivory" : "text-forest"}`} />
      {text && <Reveal as="p" delay={0.15} className={`mt-6 text-base leading-relaxed md:text-lg ${dark ? "text-ivory/75" : "text-char/75"}`}>{text}</Reveal>}
    </div>
  );
}
