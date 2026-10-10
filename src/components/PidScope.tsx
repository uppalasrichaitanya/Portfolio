import { useEffect, useRef, useState } from "react";

/*
 * A live PID loop drawn as an oscilloscope trace. The plant is a damped mass
 * (x'' = u - B·x'), the controller a PID with derivative on measurement, so a
 * setpoint step gives a real overshoot and a real settle. The visitor's
 * pointer sets the target; when idle it steps on its own.
 *
 * Closed loop: s² + (B+KD)s + KP  →  ωn ≈ 6.3 rad/s, ζ ≈ 0.47, ~19% overshoot.
 */

const KP = 40;
const KI = 6;
const KD = 4;
const B = 2;
const DT = 1 / 60;
const PX_PER_SAMPLE = 2.5;
const SIGNAL = "#2dd4bf";

type Sim = { x: number; v: number; i: number; sp: number };

function step(s: Sim) {
  const e = s.sp - s.x;
  s.i = Math.max(-0.5, Math.min(0.5, s.i + e * DT));
  const u = KP * e + KI * s.i - KD * s.v;
  s.v += (u - B * s.v) * DT;
  s.x += s.v * DT;
  return e;
}

// Static fallback: one step response, the same curve the loop produces.
function staticPath() {
  const s: Sim = { x: 0.2, v: 0, i: 0, sp: 0.62 };
  const pts: string[] = [];
  for (let k = 0; k <= 400; k++) {
    const t = k / 400;
    if (t > 0.18) step(s);
    pts.push(`${(t * 1000).toFixed(1)},${(100 - (t > 0.18 ? s.x : 0.2) * 100).toFixed(2)}`);
  }
  return "M" + pts.join(" L");
}

export default function PidScope({ hint }: { hint: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const [read, setRead] = useState({ sp: 0.62, err: 0, settled: true });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setLive(true);

    const sim: Sim = { x: 0.3, v: 0, i: 0, sp: 0.62 };
    let hist: { y: number; sp: number }[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let lastInput = -1e9;
    let nextAuto = 0;
    let frame = 0;
    let acc = 0;
    let last = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const n = Math.ceil(w / PX_PER_SAMPLE) + 2;
      hist = hist.length ? hist.slice(-n) : Array.from({ length: n }, () => ({ y: sim.x, sp: sim.sp }));
      while (hist.length < n) hist.unshift(hist[0]);
    };

    const setFromClientY = (clientY: number) => {
      const r = wrap.getBoundingClientRect();
      const t = 1 - (clientY - r.top) / r.height;
      sim.sp = Math.max(0.14, Math.min(0.86, t));
      lastInput = performance.now();
    };

    // The whole hero steers the loop, not just the strip, so the cursor never has to "find" it.
    const hero = wrap.closest("section") ?? wrap;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") setFromClientY(e.clientY);
    };
    const onDown = (e: PointerEvent) => setFromClientY(e.clientY);
    hero.addEventListener("pointermove", onMove as EventListener, { passive: true });
    wrap.addEventListener("pointerdown", onDown as EventListener, { passive: true });

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const pad = 18;
      const yOf = (v: number) => pad + (1 - v) * (h - pad * 2);
      const xOf = (k: number) => w - (hist.length - 1 - k) * PX_PER_SAMPLE;

      // Graticule
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gy = 1; gy < 4; gy++) {
        const y = Math.round((h / 4) * gy) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      const step = 96;
      const offset = (frame * PX_PER_SAMPLE) % step;
      for (let gx = w - offset; gx > 0; gx -= step) {
        ctx.moveTo(Math.round(gx) + 0.5, 0);
        ctx.lineTo(Math.round(gx) + 0.5, h);
      }
      ctx.stroke();

      // Setpoint history (dashed, stepped)
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "rgba(255,255,255,0.32)";
      ctx.beginPath();
      hist.forEach((p, k) => {
        const x = xOf(k);
        const y = yOf(p.sp);
        if (k === 0) ctx.moveTo(x, y);
        else {
          ctx.lineTo(x, yOf(hist[k - 1].sp));
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Measured position: soft fill, then the trace with a faint glow.
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(45,212,191,0.16)");
      grad.addColorStop(1, "rgba(45,212,191,0)");
      ctx.beginPath();
      hist.forEach((p, k) => (k === 0 ? ctx.moveTo(xOf(k), yOf(p.y)) : ctx.lineTo(xOf(k), yOf(p.y))));
      ctx.lineTo(w, h);
      ctx.lineTo(xOf(0), h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      hist.forEach((p, k) => (k === 0 ? ctx.moveTo(xOf(k), yOf(p.y)) : ctx.lineTo(xOf(k), yOf(p.y))));
      ctx.strokeStyle = SIGNAL;
      ctx.lineWidth = 2.25;
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(45,212,191,0.55)";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Probe at the leading edge
      const tipY = yOf(hist[hist.length - 1].y);
      ctx.fillStyle = "rgba(45,212,191,0.18)";
      ctx.beginPath();
      ctx.arc(w - 6, tipY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = SIGNAL;
      ctx.beginPath();
      ctx.arc(w - 6, tipY, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) {
        last = now;
        return;
      }
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      // Idle: step the target on its own so the loop is never still.
      if (now - lastInput > 3500 && now > nextAuto) {
        const levels = [0.24, 0.7, 0.42, 0.8, 0.3, 0.58];
        sim.sp = levels[Math.floor(now / 2600) % levels.length];
        nextAuto = now + 2600;
      }
      let err = 0;
      while (acc >= DT) {
        err = step(sim);
        hist.push({ y: sim.x, sp: sim.sp });
        if (hist.length > Math.ceil(w / PX_PER_SAMPLE) + 2) hist.shift();
        acc -= DT;
        frame++;
      }
      draw();
      if (frame % 6 === 0) setRead({ sp: sim.sp, err, settled: Math.abs(err) < 0.01 && Math.abs(sim.v) < 0.02 });
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap);
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      hero.removeEventListener("pointermove", onMove as EventListener);
      wrap.removeEventListener("pointerdown", onDown as EventListener);
    };
  }, []);

  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div className="relative h-full">
      <div ref={wrapRef} className="absolute inset-0 touch-pan-y" aria-hidden="true">
        {!live && (
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-x-0 top-[12%] h-[76%] w-full">
            <line x1="0" x2="1000" y1="38" y2="38" stroke="rgba(255,255,255,0.32)" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
            <path d={staticPath()} fill="none" stroke={SIGNAL} strokeWidth="2.25" vectorEffect="non-scaling-stroke" />
          </svg>
        )}
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em]">
        <span className="flex items-center gap-2 text-signal">
          <span className={`h-1.5 w-1.5 rounded-full bg-signal ${live ? "motion-safe:animate-pulse" : ""}`} />
          {live ? "PID loop · live" : "PID loop · step response"}
        </span>
        <span className="tabular hidden text-faint sm:inline">
          setpoint {pct(read.sp)} · error {(read.err * 100).toFixed(1).padStart(5, " ")}% ·{" "}
          <span className={read.settled ? "text-signal" : "text-text"}>{read.settled ? "settled" : "tracking"}</span>
        </span>
        <span className="tabular normal-case text-faint">
          K<sub>p</sub> {KP} · K<sub>i</sub> {KI} · K<sub>d</sub> {KD}
        </span>
      </div>
      <p className="pointer-events-none absolute bottom-0 left-0 font-mono text-[11px] text-faint">{hint}</p>
    </div>
  );
}
