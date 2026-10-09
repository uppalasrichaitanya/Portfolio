import { m, useInView, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { MotionRoot, EASE } from "../../lib/motion";

/*
 * A small, deterministic HNSW: three layers of one point set, greedy descent
 * from the entry point to the query, then the k nearest lit on layer 0.
 * Geometry is computed once; the animation is just a timeline over it.
 */

type Pt = { x: number; y: number };

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LAYER_SIZES = [46, 14, 5]; // L0, L1, L2
const DEGREE = [3, 3, 2];
const K = 5;
const QUERY: Pt = { x: 0.8, y: 0.7 };

const d2 = (a: Pt, b: Pt) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

function build() {
  const rand = mulberry32(7);
  const pts: Pt[] = Array.from({ length: LAYER_SIZES[0] }, () => ({
    x: 0.05 + rand() * 0.9,
    y: 0.08 + rand() * 0.84,
  }));

  // Undirected k-nearest-neighbour graph within each layer.
  const adj = LAYER_SIZES.map((n, layer) => {
    const nb: Set<number>[] = Array.from({ length: n }, () => new Set());
    for (let i = 0; i < n; i++) {
      const order = [...Array(n).keys()].filter((j) => j !== i).sort((a, b) => d2(pts[i], pts[a]) - d2(pts[i], pts[b]));
      for (const j of order.slice(0, DEGREE[layer])) {
        nb[i].add(j);
        nb[j].add(i);
      }
    }
    return nb;
  });

  const edges = adj.map((nb) => {
    const out: [number, number][] = [];
    nb.forEach((set, i) => set.forEach((j) => i < j && out.push([i, j])));
    return out;
  });

  // Entry point: the top-layer node farthest from the query, so the descent has somewhere to go.
  let cur = [...Array(LAYER_SIZES[2]).keys()].sort((a, b) => d2(pts[b], QUERY) - d2(pts[a], QUERY))[0];
  const entry = cur;
  const hops: { layer: number; from: number; to: number }[] = [];
  const landings: { layer: number; node: number }[] = [];
  for (let layer = 2; layer >= 0; layer--) {
    for (;;) {
      let best = cur;
      adj[layer][cur].forEach((j) => {
        if (d2(pts[j], QUERY) < d2(pts[best], QUERY)) best = j;
      });
      if (best === cur) break;
      hops.push({ layer, from: cur, to: best });
      cur = best;
    }
    landings.push({ layer, node: cur });
  }
  const nearest = [...Array(LAYER_SIZES[0]).keys()].sort((a, b) => d2(pts[a], QUERY) - d2(pts[b], QUERY)).slice(0, K);
  return { pts, edges, hops, landings, entry, nearest };
}

// Each layer is drawn as a receding plane.
const W = 430;
const S = 110;
const D = 96;
const OX = 70;
const LAYER_Y = [282, 152, 22]; // L0, L1, L2 (top of plane)

const project = (p: Pt, layer: number) => ({
  x: OX + p.x * W + (1 - p.y) * S,
  y: LAYER_Y[layer] + p.y * D,
});

const planePoints = (layer: number) => {
  const y = LAYER_Y[layer];
  return `${OX + S},${y} ${OX + S + W},${y} ${OX + W},${y + D} ${OX},${y + D}`;
};

const STEP = 0.34;

function Scene({ play, reduce }: { play: boolean; reduce: boolean }) {
  const g = useMemo(build, []);

  // Timeline: hops in order, each descent after its layer's last hop, then results.
  const timeline = useMemo(() => {
    let t = 0.2;
    const hopAt: number[] = [];
    const landAt: number[] = [];
    let h = 0;
    for (const land of g.landings) {
      while (h < g.hops.length && g.hops[h].layer === land.layer) {
        hopAt.push(t);
        t += STEP;
        h++;
      }
      landAt.push(t);
      t += STEP * 1.2;
    }
    return { hopAt, landAt, resultsAt: t };
  }, [g]);

  const visitedAt = new Map<string, number>();
  visitedAt.set(`2:${g.entry}`, 0);
  g.hops.forEach((hop, i) => visitedAt.set(`${hop.layer}:${hop.to}`, timeline.hopAt[i] + STEP * 0.8));
  g.landings.forEach((land, i) => {
    if (land.layer > 0) visitedAt.set(`${land.layer - 1}:${land.node}`, timeline.landAt[i] + STEP);
  });

  const go = (delay: number) =>
    reduce ? { duration: 0 } : { duration: STEP * 0.9, ease: EASE, delay };
  const shown = play || reduce;

  return (
    <>
      {[0, 1, 2].map((layer) => {
        const n = [46, 14, 5][layer];
        const q = project(QUERY, layer);
        return (
          <g key={layer}>
            <polygon points={planePoints(layer)} fill="#12151a" stroke="rgba(255,255,255,0.1)" />
            <text x={OX - 10} y={LAYER_Y[layer] + D / 2 + 4} textAnchor="end" className="hidden fill-faint font-mono text-[12px] sm:inline">
              L{layer}
            </text>
            {g.edges[layer].map(([a, b]) => {
              const p = project(g.pts[a], layer);
              const r = project(g.pts[b], layer);
              return <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={r.x} y2={r.y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />;
            })}
            {g.pts.slice(0, n).map((p, i) => {
              const at = visitedAt.get(`${layer}:${i}`);
              const pp = project(p, layer);
              const isResult = layer === 0 && g.nearest.includes(i);
              const lit = at !== undefined || isResult;
              return (
                <g key={i}>
                  <circle cx={pp.x} cy={pp.y} r={layer === 0 ? 2.4 : 3.2} fill="#5c5c5c" />
                  {lit && (
                    <m.circle
                      cx={pp.x}
                      cy={pp.y}
                      r={isResult ? 4.2 : layer === 0 ? 2.8 : 3.6}
                      fill="#2dd4bf"
                      initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                      animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
                      style={{ transformOrigin: `${pp.x}px ${pp.y}px` }}
                      transition={go(isResult && at === undefined ? timeline.resultsAt : isResult ? Math.max(at!, timeline.resultsAt) : at!)}
                    />
                  )}
                </g>
              );
            })}
            {/* The query's position on this layer. */}
            <g opacity={0.9}>
              <circle cx={q.x} cy={q.y} r={7} fill="none" stroke="#2dd4bf" strokeOpacity={0.55} strokeDasharray="2 2.5" />
              <path d={`M${q.x - 3},${q.y} h6 M${q.x},${q.y - 3} v6`} stroke="#2dd4bf" strokeOpacity={0.8} />
            </g>
          </g>
        );
      })}

      {g.hops.map((hop, i) => {
        const a = project(g.pts[hop.from], hop.layer);
        const b = project(g.pts[hop.to], hop.layer);
        return (
          <m.line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#2dd4bf"
            strokeWidth={2}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={shown ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={go(timeline.hopAt[i])}
          />
        );
      })}

      {g.landings.slice(0, -1).map((land, i) => {
        const a = project(g.pts[land.node], land.layer);
        const b = project(g.pts[land.node], land.layer - 1);
        return (
          <m.line
            key={`d${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#2dd4bf"
            strokeWidth={1.25}
            strokeDasharray="3 4"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={shown ? { pathLength: 1, opacity: 0.8 } : { pathLength: 0, opacity: 0 }}
            transition={go(timeline.landAt[i])}
          />
        );
      })}

      <g className="hidden font-mono text-[11px] sm:inline">
        {(() => {
          const e = project(g.pts[g.entry], 2);
          const q = project(QUERY, 0);
          return (
            <>
              <text x={e.x} y={e.y - 10} textAnchor="middle" className="fill-muted">
                entry
              </text>
              <m.text
                x={q.x + 12}
                y={q.y + 26}
                className="fill-signal"
                initial={reduce ? false : { opacity: 0 }}
                animate={shown ? { opacity: 1 } : { opacity: 0 }}
                transition={go(timeline.resultsAt + 0.15)}
              >
                top-{K} neighbours
              </m.text>
            </>
          );
        })()}
      </g>
    </>
  );
}

export default function HnswDescent() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = !!useReducedMotion();
  const [run, setRun] = useState(0);

  return (
    <MotionRoot>
      <div ref={ref} className="relative bg-sunk px-2 pb-2 pt-4 sm:px-6 sm:pt-6">
        <svg viewBox="0 0 640 400" className="block h-auto w-full" role="img" aria-labelledby="hnsw-title hnsw-desc">
          <title id="hnsw-title">HNSW search, layer by layer</title>
          <desc id="hnsw-desc">
            Three stacked graph layers. A query starts at an entry point on the sparse top layer, hops greedily toward the
            query, drops to the next layer and repeats; on the dense bottom layer the five nearest neighbours are found.
          </desc>
          <Scene key={run} play={inView} reduce={reduce} />
        </svg>
        {!reduce && (
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            className="absolute right-3 top-3 rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-signal hover:text-strong"
          >
            Replay
          </button>
        )}
      </div>
    </MotionRoot>
  );
}
