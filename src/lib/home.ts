import type { createGalaxy, GalaxyState } from "./galaxy";
import { gsap, onPage, reduced } from "./scroll";

/*
 * Home page choreography:
 *   load   → galaxy expands from a point while the name falls into place
 *   scroll → (sticky "dolly" stage) hero lifts away, the camera flies into
 *            the cloud as three words rush past, then the points re-form
 *            into a layered HNSW graph and one search path lights up
 *   after  → the galaxy dims to a backdrop for the rest of the page
 *
 * three.js is most of the page's script weight, so the galaxy loads once the
 * name has painted and the main thread is idle. The scroll timeline drives a
 * plain state object from the start, so the words and hero still play if the
 * galaxy is late, skipped (Save-Data) or unsupported (no WebGL).
 */

const whenIdle = (fn: () => void) => ("requestIdleCallback" in window ? window.requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 300));

onPage((ctx) => {
  const canvas = document.getElementById("galaxy") as HTMLCanvasElement | null;
  if (!canvas) return;

  const wide = window.innerWidth >= 1024;
  const s: GalaxyState = { intro: 0, camZ: 13, camY: 0.6, lookY: 0, tiltX: 0.18, spin: 0, morph: 0, path: 0, dim: 1, offsetX: 0 };
  if (reduced()) {
    s.intro = 1;
    s.dim = 0.8;
  } else {
    // Desktop hero: the cloud sits to the right of the name, then centres as the camera flies in.
    s.offsetX = wide ? 4.2 : 0;
    if (!wide) s.camZ = 9.5;
    choreograph(s);
  }

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) {
    canvas.remove();
    return;
  }

  let galaxy: ReturnType<typeof createGalaxy> | null = null;
  let gone = false;
  whenIdle(async () => {
    try {
      const { createGalaxy } = await import("./galaxy");
      if (gone) return;
      galaxy = createGalaxy(canvas, { count: window.innerWidth < 768 ? 2800 : 6500, still: reduced(), state: s });
    } catch {
      // No WebGL (or the chunk failed): the vignette and type carry the hero on their own.
      canvas.remove();
      return;
    }
    if (reduced()) galaxy.render();
    // Inside the page context, so it is reverted on navigation.
    else ctx.add(() => gsap.to(s, { intro: 1, duration: 2.8, ease: "expo.out", delay: 0.1 }));
  });

  return () => {
    gone = true;
    galaxy?.dispose();
  };
});

function choreograph(s: GalaxyState) {
  const dolly = document.getElementById("dolly");
  const hero = document.getElementById("hero-content");
  const words = gsap.utils.toArray<HTMLElement>("[data-dolly-word]");
  const caption = document.getElementById("dolly-caption");

  if (dolly) {
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: dolly, start: "top top", end: "bottom bottom", scrub: 1.2 },
    });

    // Fly in
    tl.to(s, { camZ: 3.4, spin: 1.3, duration: 0.6, ease: "power2.in" }, 0);
    tl.to(s, { offsetX: 0, duration: 0.3, ease: "power2.inOut" }, 0);
    if (hero) tl.to(hero, { yPercent: -18, opacity: 0, filter: "blur(10px)", duration: 0.14, ease: "power1.in" }, 0);

    // Words rush past the camera, one after another.
    words.forEach((w, i) => {
      const at = 0.08 + i * 0.165;
      tl.fromTo(w, { scale: 0.35, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.1, ease: "power2.out" }, at);
      tl.to(w, { scale: 2.8, opacity: 0, filter: "blur(18px)", duration: 0.08, ease: "power2.in" }, at + 0.1);
    });

    // Re-form into the graph and pull back to see it.
    tl.to(s, { morph: 1, duration: 0.3, ease: "power1.inOut" }, 0.58);
    tl.to(s, { camZ: 15.5, camY: 8.2, tiltX: 0.32, spin: 1.95, duration: 0.32, ease: "power2.inOut" }, 0.58);
    tl.to(s, { path: 1, duration: 0.14, ease: "power1.inOut" }, 0.84);
    if (caption) tl.fromTo(caption, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08 }, 0.86);
    tl.to({}, { duration: 0.04 }, 0.98);
  }

  // Afterwards the galaxy is a dim backdrop, brightening a little for contact (not so much that the copy loses contrast).
  const about = document.getElementById("about");
  if (about) {
    gsap.fromTo(
      s,
      { dim: 1 },
      { dim: 0.28, ease: "none", immediateRender: false, scrollTrigger: { trigger: about, start: "top bottom", end: "top 30%", scrub: true } },
    );
  }
  const contact = document.getElementById("contact");
  if (contact) {
    gsap.fromTo(
      s,
      { dim: 0.28 },
      { dim: 0.45, ease: "none", immediateRender: false, scrollTrigger: { trigger: contact, start: "top bottom", end: "top 20%", scrub: true } },
    );
  }
}
