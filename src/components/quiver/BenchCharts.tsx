import { m, useReducedMotion } from "motion/react";
import { MotionRoot, EASE } from "../../lib/motion";

/*
 * Quiver benchmark facets. One measure per chart, one axis each, Quiver in the
 * signal colour and everything else neutral. Values come from the Quiver repo's
 * benchmarks/README.md (SIFT1M, single-threaded, i7-12650H).
 */

type Row = { label: string; value: number; display: string; ours?: boolean };
type Facet = { title: string; sub: string; rows: Row[] };

const facets: Facet[] = [
  {
    title: "Recall@10",
    sub: "Neighbours missed per 1,000 · lower is better",
    rows: [
      { label: "Quiver", value: 3.9, display: "0.9961", ours: true },
      { label: "FAISS", value: 7.8, display: "0.9922" },
      { label: "hnswlib", value: 8.0, display: "0.9920" },
    ],
  },
  {
    title: "Throughput",
    sub: "Queries per second · higher is better",
    rows: [
      { label: "hnswlib", value: 2832, display: "2,832" },
      { label: "Quiver", value: 2680, display: "2,680", ours: true },
      { label: "FAISS", value: 2336, display: "2,336" },
    ],
  },
  {
    title: "Tail latency",
    sub: "p99, milliseconds · lower is better",
    rows: [
      { label: "Quiver", value: 0.63, display: "0.63 ms", ours: true },
      { label: "hnswlib", value: 0.74, display: "0.74 ms" },
      { label: "FAISS", value: 0.91, display: "0.91 ms" },
    ],
  },
  {
    title: "Index size",
    sub: "1M × 128-d vectors, MB · lower is smaller",
    rows: [
      { label: "Raw float32", value: 488, display: "488 MB" },
      { label: "Quiver SQ8", value: 122.1, display: "122 MB · 4×", ours: true },
      { label: "Quiver IVF-PQ", value: 30.5, display: "30.5 MB · 16×", ours: true },
    ],
  },
];

function Bars({ facet, delay }: { facet: Facet; delay: number }) {
  const reduce = useReducedMotion();
  const max = Math.max(...facet.rows.map((r) => r.value));
  return (
    <figure className="min-w-0">
      <figcaption className="mb-3">
        <span className="block text-[15px] font-semibold text-strong">{facet.title}</span>
        <span className="block text-[13px] text-muted">{facet.sub}</span>
      </figcaption>
      <ul className="space-y-[2px]">
        {facet.rows.map((r, i) => (
          <li key={r.label} className="group grid grid-cols-[6.5rem_1fr] items-center gap-3 py-1" title={`${r.label}: ${r.display}`}>
            <span className={`truncate font-mono text-[12px] ${r.ours ? "text-strong" : "text-muted"}`}>{r.label}</span>
            <span className="relative flex h-5 items-center">
              <m.span
                className={`block h-full rounded-r-[4px] ${r.ours ? "bg-signal" : "bg-[#4a5059] group-hover:bg-[#5b626c]"}`}
                style={{ width: `${(r.value / max) * 100}%`, transformOrigin: "left" }}
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.6, ease: EASE, delay: delay + i * 0.06 }}
              />
              <span className="tabular ml-2 shrink-0 whitespace-nowrap font-mono text-[12px] text-text">{r.display}</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export default function BenchCharts() {
  return (
    <MotionRoot>
      <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
        {facets.map((f, i) => (
          <Bars key={f.title} facet={f} delay={(i % 2) * 0.08} />
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-line bg-sunk/60 p-4 sm:p-5">
        <p className="text-[15px] font-semibold text-strong">Filtered search, 1% selectivity</p>
        <p className="mt-1 text-[13px] text-muted">Naive post-filtering → filter-aware graph traversal, ef=100</p>
        <dl className="mt-4 grid grid-cols-3 gap-4 font-mono text-[12px]">
          {[
            ["QPS", "83.7", "195.2"],
            ["p99", "52.3 ms", "12.7 ms"],
            ["Recall@10", "0.9995", "0.9983"],
          ].map(([k, a, b]) => (
            <div key={k}>
              <dt className="text-faint uppercase tracking-wider">{k}</dt>
              <dd className="tabular mt-1 text-muted">
                {a} <span aria-hidden>→</span>
                <span className="sr-only">to</span> <span className="text-strong">{b}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[13px] text-muted">2.3× the throughput and 4.1× lower p99, for a small recall cost that's left in the numbers.</p>
      </div>

      <p className="mt-6 text-[13px] leading-relaxed text-faint">
        SIFT1M (1M base vectors, 10k queries, 128-d, L2). Single-threaded on an Intel i7-12650H, 16 GB, Windows 11. Every
        HNSW engine at M=32, efConstruction=200, efSearch=100, same harness. Quiver's build is ~2× slower than FAISS and
        hnswlib (1,145 s vs. ~560 s) because it fsyncs a write-ahead log while building.{" "}
        <a className="trace-link text-muted" href="https://github.com/uppalasrichaitanya/Quiver/blob/main/benchmarks/README.md">
          Methodology and raw JSON ↗
        </a>
      </p>
    </MotionRoot>
  );
}
