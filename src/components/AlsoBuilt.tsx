import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { MotionRoot, EASE } from "../lib/motion";

type Item = { name: string; desc: string; href?: string };

export default function AlsoBuilt({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const id = useId();

  return (
    <MotionRoot>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="group flex w-full items-center gap-6 border-y border-line py-6 text-left"
      >
        <span className="min-w-0 flex-1 text-[clamp(1.05rem,2vw,1.25rem)] leading-snug text-muted transition-colors group-hover:text-text">
          {items.map((it, i) => (
            <span key={it.name} className="inline-block whitespace-nowrap">
              <span className="text-strong">{it.name}</span>
              {i < items.length - 1 && <span className="mx-2.5 text-line-strong">·</span>}
            </span>
          ))}
        </span>
        <span
          aria-hidden
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-strong transition-colors group-hover:border-signal"
        >
          <span className="absolute h-px w-3 bg-text" />
          <m.span className="absolute h-3 w-px bg-text" animate={{ scaleY: open ? 0 : 1 }} transition={{ duration: 0.25, ease: EASE }} />
        </span>
        <span className="sr-only">{open ? "Hide" : "Show"} other projects</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <m.ul
            id={id}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            {items.map((it) => (
              <li key={it.name} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[11rem_1fr_auto] sm:items-baseline sm:gap-6">
                <span className="text-[16px] font-semibold text-strong">{it.name}</span>
                <span className="text-[15px] leading-relaxed text-muted">{it.desc}</span>
                {it.href ? (
                  <a href={it.href} target="_blank" rel="noreferrer" className="trace-link w-fit font-mono text-[12px] text-muted">
                    GitHub ↗
                  </a>
                ) : (
                  <span className="font-mono text-[12px] text-faint">private repo</span>
                )}
              </li>
            ))}
          </m.ul>
        )}
      </AnimatePresence>
    </MotionRoot>
  );
}
