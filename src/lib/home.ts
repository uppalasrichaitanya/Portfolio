import { createGalaxy } from "./galaxy";
import { gsap, onPage, reduced } from "./scroll";

/*
 * Home page choreography:
 *   load   → galaxy expands from a point while the name falls into place
 *   scroll → (sticky "dolly" stage) hero lifts away, the camera flies into
 *            the cloud as three words rush past, then the points re-form
 *            into a layered HNSW graph and one search path lights up
 *   after  → the galaxy dims to a backdrop for the rest of the page
 */

onPage(() => {
  const canvas = document.getElementById("galaxy") as HTMLCanvasElement | null;
  if (!canvas) return;

  let galaxy: ReturnType<typeof createGalaxy>;
  try {
    galaxy = createGalaxy(canvas, { count: window.innerWidth < 768 ? 2800 : 6500, still: reduced() });
  } catch {
    // No WebGL: the vignette and type carry the hero on their own.
    canvas.remove();
    return;
  }
  const s = galaxy.state;

  if (reduced()) {
    s.intro = 1;
    s.dim = 0.8;
    galaxy.render();
    return () => galaxy.dispose();
  }

  // Desktop hero: the cloud sits to the right of the name, then centres as the camera flies in.
  const wide = window.innerWidth >= 1024;
  s.offsetX = wide ? 4.2 : 0;
  if (!wide) s.camZ = 9.5;
  gsap.to(s, { intro: 1, duration: 2.8, ease: "expo.out", delay: 0.1 });

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

  // Afterwards the galaxy is a dim backdrop, brightening again for contact.
  const about = document.getElementById("about");
  if (about) {
    gsap.fromTo(s, { dim: 1 }, { dim: 0.28, ease: "none", immediateRender: false, scrollTrigger: { trigger: about, start: "top bottom", end: "top 30%", scrub: true } });
  }
  const contact = document.getElementById("contact");
  if (contact) {
    gsap.fromTo(s, { dim: 0.28 }, { dim: 0.7, ease: "none", immediateRender: false, scrollTrigger: { trigger: contact, start: "top bottom", end: "top 20%", scrub: true } });
  }

  return () => galaxy.dispose();
});
