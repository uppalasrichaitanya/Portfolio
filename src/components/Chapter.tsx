import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import type { Media, Project } from "../content/projects";
import { MotionRoot, RevealItem, EASE } from "../lib/motion";
import AutoVideo from "./AutoVideo";
import HnswDescent from "./quiver/HnswDescent";
import BenchCharts from "./quiver/BenchCharts";

function Figure({ media, n, priority }: { media: Media; n: string; priority?: boolean }) {
  return (
    <figure>
      <div className="plate">
        {media.kind === "video" && (
          <AutoVideo
            webm={media.src.webm}
            mp4={media.src.mp4}
            poster={media.poster}
            width={media.width}
            height={media.height}
            label={media.alt}
            preferMp4={media.preferMp4}
          />
        )}
        {media.kind === "image" && (
          <img
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="block h-auto w-full"
            style={media.pixelated ? { imageRendering: "pixelated" } : undefined}
          />
        )}
        {media.kind === "hnsw" && <HnswDescent />}
      </div>
      <figcaption className="mt-3 flex gap-3 text-[13px] leading-snug text-faint">
        <span className="shrink-0 font-mono">FIG. {n}</span>
        <span>{media.caption}</span>
      </figcaption>
    </figure>
  );
}

function CaseBody({ p }: { p: Project }) {
  const c = p.case;
  return (
    <div className="grid gap-12 pt-10 lg:grid-cols-12 lg:gap-16">
      <div className="space-y-10 lg:col-span-5">
        <section>
          <h4 className="label">Problem</h4>
          <p className="mt-3 text-[17px] leading-relaxed text-text">{c.problem}</p>
        </section>
        <section>
          <h4 className="label">Approach</h4>
          <ul className="mt-3 space-y-3">
            {c.approach.map((a) => (
              <li key={a} className="relative pl-5 text-[16px] leading-relaxed text-text/90">
                <span aria-hidden className="absolute left-0 top-[0.7em] h-px w-2.5 bg-faint" />
                {a}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="label">What was hard</h4>
          <p className="mt-3 text-[17px] font-semibold text-strong">{c.hard.title}</p>
          <p className="mt-2 text-[16px] leading-relaxed text-text/90">{c.hard.body}</p>
        </section>
        {c.note && <p className="border-l border-line-strong pl-4 text-[14px] text-muted">{c.note}</p>}
      </div>

      <div className="space-y-10 lg:col-span-7">
        <h4 className="label">Evidence</h4>
        {c.evidence.metrics && (
          <dl className="-mt-6 divide-y divide-line border-y border-line">
            {c.evidence.metrics.map((mt) => (
              <div key={mt.label} className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-4">
                <dt className="text-[15px] text-text">{mt.label}</dt>
                <dd className="tabular font-mono text-[15px] text-strong">{mt.value}</dd>
                {mt.note && <dd className="col-span-2 text-[13px] text-faint">{mt.note}</dd>}
              </div>
            ))}
          </dl>
        )}
        {c.evidence.charts === "quiver" && (
          <div className="-mt-4">
            <BenchCharts />
          </div>
        )}
        {c.evidence.figures?.map((f, i) => (
          <Figure key={i} media={f} n={`${p.index}.${i + 2}`} />
        ))}
      </div>
    </div>
  );
}

export default function Chapter({ p, flip }: { p: Project; flip?: boolean }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const panelId = useId();
  const hash = `#case-${p.id}`;

  useEffect(() => {
    if (window.location.hash === hash) {
      setOpen(true);
      requestAnimationFrame(() => rootRef.current?.scrollIntoView({ block: "start" }));
    }
  }, [hash]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    history.replaceState(null, "", next ? hash : window.location.pathname + window.location.search);
    if (!next) {
      const top = rootRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) rootRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
  };

  return (
    <MotionRoot>
      <article ref={rootRef} id={p.id} data-chapter={p.index} aria-labelledby={`${p.id}-title`} className="scroll-mt-24">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <RevealItem className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
            <p className="label">
              <span className="text-signal">{p.index}</span>
              <span className="mx-2 text-line-strong">/</span>
              {p.kicker}
            </p>
            <h3 id={`${p.id}-title`} className="mt-4 text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-strong">
              <a href={`#${p.id}`} className="trace-link pb-1">
                {p.title}
              </a>
            </h3>
            <p className="mt-5 max-w-[34rem] text-[18px] leading-relaxed text-muted">{p.oneLiner}</p>

            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-5">
              {p.proof.map((pr) => (
                <div key={pr.label} className="min-w-0">
                  <dt className="sr-only">{pr.label}</dt>
                  <dd className="tabular font-mono text-[clamp(1.1rem,2.2vw,1.5rem)] font-medium leading-none tracking-tight text-strong">
                    {pr.value}
                  </dd>
                  <dd aria-hidden className="mt-2 text-[12.5px] leading-snug text-faint">
                    {pr.label}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 font-mono text-[12px] leading-relaxed text-faint">{p.stack.join("  ·  ")}</p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-controls={panelId}
                className="group inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-[14px] font-medium text-strong transition-colors duration-200 hover:border-signal"
              >
                {open ? "Close case study" : "Read the case study"}
                <m.svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  aria-hidden
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="text-muted group-hover:text-signal"
                >
                  <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </m.svg>
              </button>
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="trace-link text-[14px] text-muted">
                  {l.label} <span aria-hidden>↗</span>
                </a>
              ))}
              {p.linkNote && <span className="text-[13px] text-faint">{p.linkNote}</span>}
            </div>
          </RevealItem>

          <RevealItem delay={0.08} className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
            <Figure media={p.media} n={`${p.index}.1`} priority={p.index === "01"} />
          </RevealItem>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <m.div
              id={panelId}
              key="case"
              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.45, ease: EASE },
                opacity: { duration: 0.3, ease: EASE, delay: open ? 0.1 : 0 },
              }}
              className="overflow-hidden"
            >
              <div className="mt-12 border-l border-signal/70 pl-5 sm:pl-8">
                <CaseBody p={p} />
                {p.extra && (
                  <div className="mt-12">
                    <Figure media={p.extra} n={`${p.index}.${(p.case.evidence.figures?.length ?? 0) + 2}`} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={toggle}
                  className="mt-10 inline-flex items-center gap-2 text-[14px] text-muted transition-colors hover:text-strong"
                >
                  <span aria-hidden>↑</span> Close {p.title}
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </article>
    </MotionRoot>
  );
}
