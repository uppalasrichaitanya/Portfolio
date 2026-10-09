import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import type { Media, Project } from "../content/projects";
import { MotionRoot, EASE } from "../lib/motion";
import AutoVideo from "./AutoVideo";
import HnswDescent from "./quiver/HnswDescent";
import BenchCharts from "./quiver/BenchCharts";

function Figure({ media, n, priority, chrome }: { media: Media; n: string; priority?: boolean; chrome?: string }) {
  return (
    <figure>
      <div className="plate">
        {chrome && (
          <div className="chrome" aria-hidden>
            <i />
            <i />
            <i />
            <span className="ml-1 truncate">{chrome}</span>
          </div>
        )}
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
        <span className="shrink-0 font-mono text-muted">FIG. {n}</span>
        <span>{media.caption}</span>
      </figcaption>
    </figure>
  );
}

function CaseBody({ p }: { p: Project }) {
  const c = p.case;
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
      <div className="space-y-10 lg:col-span-5">
        <section>
          <h4 className="label text-signal">Problem</h4>
          <p className="mt-3 text-[17px] leading-relaxed text-text">{c.problem}</p>
        </section>
        <section>
          <h4 className="label text-signal">Approach</h4>
          <ul className="mt-3 space-y-3">
            {c.approach.map((a) => (
              <li key={a} className="relative pl-5 text-[16px] leading-relaxed text-text/90">
                <span aria-hidden className="absolute left-0 top-[0.62em] h-1.5 w-1.5 rounded-full bg-signal/70" />
                {a}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="label text-signal">What was hard</h4>
          <p className="mt-3 text-[17px] font-semibold text-strong">{c.hard.title}</p>
          <p className="mt-2 text-[16px] leading-relaxed text-text/90">{c.hard.body}</p>
        </section>
        {c.note && <p className="rounded-xl border border-line bg-sunk/60 px-4 py-3 text-[14px] text-muted">{c.note}</p>}
      </div>

      <div className="space-y-10 lg:col-span-7">
        <h4 className="label text-signal">Evidence</h4>
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

  const area = p.kicker.split("·")[1]?.trim().toLowerCase() ?? "";

  return (
    <MotionRoot>
      <article
        ref={rootRef}
        id={p.id}
        data-chapter={p.index}
        aria-labelledby={`${p.id}-title`}
        className="card scroll-mt-24 p-4 sm:p-8 lg:p-10"
      >
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div data-reveal className={`lg:col-span-5 ${flip ? "lg:order-2" : "lg:order-1"}`}>
            <p className="label flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="rounded-full border border-signal/40 bg-signal-dim px-2 py-0.5 text-signal">{p.index}</span>
              {p.kicker}
            </p>
            <h3 id={`${p.id}-title`} className="mt-5 text-[clamp(2.4rem,5vw,3.6rem)] font-extrabold leading-[1] tracking-[-0.04em] text-strong">
              <a href={`#${p.id}`} className="trace-link pb-1">
                {p.title}
              </a>
            </h3>
            <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-muted sm:text-[18px]">{p.oneLiner}</p>

            <dl className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
              {p.proof.map((pr) => (
                <div key={pr.label} className="flex min-w-0 flex-col-reverse justify-end rounded-xl border border-line bg-sunk/60 p-3 sm:p-4">
                  <dt className="mt-2 text-[12px] leading-snug text-faint">{pr.label}</dt>
                  <dd className="tabular font-mono text-[clamp(1.05rem,2vw,1.45rem)] font-medium leading-none tracking-tight text-strong">
                    {pr.value}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Stack">
              {p.stack.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-controls={panelId}
                className="btn btn-ghost group"
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
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="trace-link text-[14px] font-medium text-muted">
                  {l.label} <span aria-hidden>↗</span>
                </a>
              ))}
              {p.linkNote && (
                <span className="flex items-center gap-2 text-[13px] text-faint">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  {p.linkNote}
                </span>
              )}
            </div>
          </div>

          <div data-reveal style={{ "--d": "120ms" } as Record<string, string>} className={`order-first lg:col-span-7 ${flip ? "lg:order-1" : "lg:order-2"}`}>
            <Figure media={p.media} n={`${p.index}.1`} priority={p.index === "01"} chrome={`${p.id} — ${area}`} />
          </div>
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
              <div className="mt-10 border-t border-line pt-10">
                <CaseBody p={p} />
                {p.extra && (
                  <div className="mt-12">
                    <Figure media={p.extra} n={`${p.index}.${(p.case.evidence.figures?.length ?? 0) + 2}`} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={toggle}
                  className="btn btn-ghost mt-10"
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
