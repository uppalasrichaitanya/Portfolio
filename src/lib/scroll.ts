import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * One smooth-scroll + animation runtime for the whole site.
 * - Lenis gives inertial scrolling; GSAP's ticker drives it so ScrollTrigger
 *   reads the same frame.
 * - Components register page setups with onPage(); they run on every
 *   astro:page-load and are reverted before the next swap.
 */

export const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => window.matchMedia("(pointer: fine)").matches;

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

function startLenis() {
  if (lenis || reduced()) return;
  lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), anchors: { offset: -80 }, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

type Setup = (ctx: gsap.Context) => void | (() => void);
const setups: Setup[] = [];
let ctx: gsap.Context | null = null;
let cleanups: (() => void)[] = [];

export function onPage(fn: Setup) {
  setups.push(fn);
  // Registered after the first page-load already fired (late module): run now.
  if (ctx) runOne(fn);
}

function runOne(fn: Setup) {
  ctx!.add(() => {
    const c = fn(ctx!);
    if (typeof c === "function") cleanups.push(c);
  });
}

/* ---------- built-in page behaviours ---------- */

function splitWords(root: Element) {
  if (root.hasAttribute("data-split-done")) return;
  root.setAttribute("data-split-done", "");
  let i = 0;
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent ?? "").split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) return frag.append(document.createTextNode(" "));
          const outer = document.createElement("span");
          outer.className = "split-word";
          const inner = document.createElement("span");
          inner.textContent = p;
          inner.style.setProperty("--i", String(Math.min(i++, 18)));
          outer.append(inner);
          frag.append(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && !(child as Element).matches("br")) {
        walk(child);
      }
    });
  };
  walk(root);
}

function reveals() {
  document.querySelectorAll("[data-split]").forEach(splitWords);
  const show = (el: Element) => {
    el.setAttribute("data-shown", "");
    el.dispatchEvent(new CustomEvent("reveal"));
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
          show(e.target);
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  document.querySelectorAll("[data-reveal]:not([data-shown]), [data-split]:not([data-shown])").forEach((el) => io.observe(el));
  return () => io.disconnect();
}

function counters() {
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count!);
    const decimals = parseInt(el.dataset.decimals ?? "0", 10);
    const suffix = el.dataset.suffix ?? "";
    const pad = parseInt(el.dataset.pad ?? "0", 10);
    const fmt = (v: number) => {
      const s = v.toFixed(decimals);
      return (pad ? s.padStart(pad, "0") : s) + suffix;
    };
    if (reduced()) return void (el.textContent = fmt(target));
    const obj = { v: 0 };
    el.textContent = fmt(0);
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => gsap.to(obj, { v: target, duration: 2, ease: "expo.out", onUpdate: () => (el.textContent = fmt(obj.v)) }),
    });
  });
}

function magnetic() {
  if (!finePointer() || reduced()) return;
  const offs: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || "0.35");
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    offs.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    });
  });
  return () => offs.forEach((f) => f());
}

function tiltAndSpotlight() {
  if (!finePointer()) return;
  const offs: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>("[data-spotlight], [data-tilt]").forEach((el) => {
    const tilt = el.hasAttribute("data-tilt") && !reduced();
    const amount = parseFloat(el.dataset.tilt || "6");
    const rx = tilt ? gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3" }) : null;
    const ry = tilt ? gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3" }) : null;
    if (tilt) gsap.set(el, { transformPerspective: 900 });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      rx?.((0.5 - py) * amount);
      ry?.((px - 0.5) * amount);
    };
    const leave = () => {
      rx?.(0);
      ry?.(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    offs.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    });
  });
  return () => offs.forEach((f) => f());
}

function parallax() {
  if (reduced()) return;
  document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
    const amt = parseFloat(el.dataset.parallax || "12");
    gsap.fromTo(
      el,
      { yPercent: -amt / 2 },
      { yPercent: amt / 2, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true } },
    );
  });
}

function scrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  gsap.set(bar, { scaleX: 0, transformOrigin: "0 50%" });
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => gsap.set(bar, { scaleX: s.progress }) });
}

onPage(() => reveals());
onPage(() => counters());
onPage(() => magnetic());
onPage(() => tiltAndSpotlight());
onPage(() => parallax());
onPage(() => scrollProgress());

/* ---------- lifecycle ---------- */

document.addEventListener("astro:page-load", () => {
  startLenis();
  ctx = gsap.context(() => {});
  cleanups = [];
  setups.forEach(runOne);
  lenis?.resize();
  if (lenis && Math.abs(lenis.scroll - window.scrollY) > 1) lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  // Fonts and media change layout after load; re-measure pins and triggers.
  if (restoreTo !== null) {
    const y = restoreTo;
    restoreTo = null;
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      window.scrollTo(0, y);
      lenis?.scrollTo(y, { immediate: true, force: true });
    });
  }
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
});

// Back/forward: the home page's pinned sections only get their height once JS
// runs, so the browser's own restore lands short. Remember positions ourselves.
// (On back/forward the URL has already changed when the event fires, so track the path ourselves.)
const positions = new Map<string, number>();
let restoreTo: number | null = null;
let currentPath = location.pathname;
document.addEventListener("astro:page-load", () => (currentPath = location.pathname));
document.addEventListener("astro:before-preparation", (e) => {
  const ev = e as Event & { to: URL; navigationType: string };
  positions.set(currentPath, window.scrollY);
  restoreTo = ev.navigationType === "traverse" ? (positions.get(ev.to.pathname) ?? null) : null;
});

document.addEventListener("astro:before-swap", () => {
  cleanups.forEach((f) => f());
  cleanups = [];
  ctx?.revert();
  ctx = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
});

document.addEventListener("astro:after-swap", () => {
  // Astro replaces <html> attributes on swap; restore Lenis' classes and position.
  if (lenis) document.documentElement.classList.add("lenis", "lenis-smooth");
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
});

export { gsap, ScrollTrigger };
