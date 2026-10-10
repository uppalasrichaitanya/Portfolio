import * as THREE from "three";

/*
 * A vector-space "galaxy": points clustered like embeddings. Scroll can morph
 * them into a layered HNSW-style graph (the thing Quiver builds), with edges
 * and one greedy-descent search path lighting up.
 */

export type GalaxyState = {
  intro: number; // 0 → 1 on load: points expand from the centre
  camZ: number;
  camY: number;
  lookY: number;
  tiltX: number; // group rotation around X (graph view)
  spin: number; // extra rotation around Y driven by scroll
  morph: number; // 0 clusters → 1 graph
  path: number; // 0 → 1 draws the search path
  dim: number; // global brightness
  offsetX: number; // shifts the cloud sideways (hero composition)
};

const vert = /* glsl */ `
uniform float uTime;
uniform float uIntro;
uniform float uMorph;
uniform float uSize;
uniform float uPixel;
uniform float uAspect;
uniform vec2 uMouse;
attribute vec3 aB;
attribute float aSeed;
attribute float aScale;
varying float vGlow;
varying float vSeed;
varying float vAlpha;
void main() {
  float m = clamp(uMorph * 1.5 - aSeed * 0.5, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 p = mix(position, aB, m);
  p += 0.07 * vec3(sin(uTime * 0.6 + aSeed * 40.0), cos(uTime * 0.5 + aSeed * 31.0), sin(uTime * 0.45 + aSeed * 23.0)) * (1.0 - m);
  float k = clamp(uIntro * 1.35 - aSeed * 0.35, 0.0, 1.0);
  float intro = 1.0 - pow(1.0 - k, 4.0);
  p *= mix(0.001, 1.0, intro);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;
  float d = distance(vec2(ndc.x * uAspect, ndc.y), vec2(uMouse.x * uAspect, uMouse.y));
  vGlow = smoothstep(0.42, 0.0, d);
  float tw = 0.7 + 0.3 * sin(uTime * 1.7 + aSeed * 113.0);
  float depth = -mv.z;
  gl_PointSize = uSize * aScale * (1.0 + vGlow * 1.1) * tw * uPixel / max(depth, 0.3);
  gl_Position = clip;
  vSeed = aSeed;
  vAlpha = intro * smoothstep(0.25, 2.2, depth) * smoothstep(48.0, 14.0, depth);
}
`;

const frag = /* glsl */ `
uniform float uDim;
varying float vGlow;
varying float vSeed;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  float a = pow(smoothstep(0.5, 0.0, r), 1.7);
  vec3 ember = vec3(0.88, 0.36, 0.09);
  vec3 amber = vec3(1.0, 0.56, 0.25);
  vec3 cream = vec3(1.0, 0.92, 0.8);
  vec3 col = mix(ember, amber, smoothstep(0.0, 0.55, vSeed));
  col = mix(col, cream, smoothstep(0.78, 1.0, vSeed));
  col = mix(col, vec3(1.0, 0.85, 0.65), vGlow * 0.6);
  gl_FragColor = vec4(col, a * vAlpha * uDim * (0.72 + vGlow * 0.45));
}
`;

function gaussian(rand: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LAYERS = [2.9, 0, -2.9];

function build(count: number) {
  const rand = mulberry32(11);
  const A = new Float32Array(count * 3);
  const B = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const scale = new Float32Array(count);
  const layerOf = new Uint8Array(count);

  // Clusters
  const clusters = Array.from({ length: 10 }, () => {
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    const r = 2 + rand() * 4.5;
    return {
      c: new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.55, r * Math.sin(ph) * Math.sin(th)),
      s: 0.45 + rand() * 0.75,
    };
  });

  for (let i = 0; i < count; i++) {
    const dust = rand() < 0.18;
    let x: number, y: number, z: number;
    if (dust) {
      const r = 3 + Math.pow(rand(), 0.6) * 13;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      x = r * Math.sin(ph) * Math.cos(th);
      y = r * Math.cos(ph) * 0.6;
      z = r * Math.sin(ph) * Math.sin(th);
    } else {
      const k = clusters[Math.floor(rand() * clusters.length)];
      x = k.c.x + gaussian(rand) * k.s;
      y = k.c.y + gaussian(rand) * k.s * 0.8;
      z = k.c.z + gaussian(rand) * k.s;
    }
    A.set([x, y, z], i * 3);

    // Graph: 7% top, 23% middle, rest bottom — sparse to dense, like HNSW.
    const u = rand();
    const layer = u < 0.07 ? 0 : u < 0.3 ? 1 : 2;
    layerOf[i] = layer;
    const spread = [0.75, 0.9, 1][layer];
    B.set([(rand() * 2 - 1) * 7 * spread, LAYERS[layer] + (rand() - 0.5) * 0.12, (rand() * 2 - 1) * 4.2 * spread], i * 3);

    seed[i] = rand();
    scale[i] = dust ? 0.55 + rand() * 0.6 : 0.7 + rand() * 1.1;
  }

  // Edges: each node to its 2 nearest neighbours in its own layer (bottom capped for clarity).
  const edges: number[] = [];
  const byLayer: number[][] = [[], [], []];
  for (let i = 0; i < count; i++) byLayer[layerOf[i]].push(i);
  const caps = [Infinity, 520, 900];
  const nb: Map<number, number[]> = new Map();
  byLayer.forEach((ids, L) => {
    const nodes = ids.slice(0, caps[L] === Infinity ? ids.length : caps[L]);
    nodes.forEach((i) => {
      const best: [number, number][] = [];
      for (const j of nodes) {
        if (j === i) continue;
        const dx = B[i * 3] - B[j * 3];
        const dz = B[i * 3 + 2] - B[j * 3 + 2];
        const d = dx * dx + dz * dz;
        if (best.length < 2 || d < best[best.length - 1][0]) {
          best.push([d, j]);
          best.sort((a, b) => a[0] - b[0]);
          if (best.length > 2) best.pop();
        }
      }
      nb.set(i, best.map((b) => b[1]));
      best.forEach(([, j]) => edges.push(...B.slice(i * 3, i * 3 + 3), ...B.slice(j * 3, j * 3 + 3)));
    });
  });

  // One greedy descent toward a query point, layer by layer.
  const q = { x: 3.2, z: 1.6 };
  const dq = (i: number) => (B[i * 3] - q.x) ** 2 + (B[i * 3 + 2] - q.z) ** 2;
  const path: number[] = [];
  let cur = byLayer[0].reduce((a, b) => (dq(a) > dq(b) ? a : b)); // farthest top node: a visible journey
  for (let L = 0; L < 3; L++) {
    if (L > 0) {
      // Drop to the next layer: the nearest node below.
      const below = byLayer[L].slice(0, caps[L] === Infinity ? undefined : caps[L]);
      const cx = B[cur * 3];
      const cz = B[cur * 3 + 2];
      cur = below.reduce((a, b) =>
        (B[a * 3] - cx) ** 2 + (B[a * 3 + 2] - cz) ** 2 < (B[b * 3] - cx) ** 2 + (B[b * 3 + 2] - cz) ** 2 ? a : b,
      );
    }
    path.push(cur);
    for (let guard = 0; guard < 40; guard++) {
      const next = (nb.get(cur) ?? []).reduce((a, b) => (dq(a) < dq(b) ? a : b), cur);
      if (next === cur || dq(next) >= dq(cur)) break;
      cur = next;
      path.push(cur);
    }
  }
  const pathPts: number[] = [];
  path.forEach((i) => pathPts.push(B[i * 3], B[i * 3 + 1] + 0.01, B[i * 3 + 2]));

  return { A, B, seed, scale, edges: new Float32Array(edges), path: new Float32Array(pathPts), pathCount: path.length };
}

export function createGalaxy(canvas: HTMLCanvasElement, opts: { count: number; still?: boolean }) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 120);
  const group = new THREE.Group();
  scene.add(group);

  const data = build(opts.count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(data.A, 3));
  geo.setAttribute("aB", new THREE.BufferAttribute(data.B, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(data.seed, 1));
  geo.setAttribute("aScale", new THREE.BufferAttribute(data.scale, 1));

  const uniforms = {
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uMorph: { value: 0 },
    uSize: { value: 52 },
    uPixel: { value: dpr },
    uAspect: { value: 1 },
    uMouse: { value: new THREE.Vector2(10, 10) },
    uDim: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  group.add(points);

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute("position", new THREE.BufferAttribute(data.edges, 3));
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
  group.add(edgeLines);

  const pathGeo = new THREE.BufferGeometry();
  pathGeo.setAttribute("position", new THREE.BufferAttribute(data.path, 3));
  const pathMat = new THREE.LineBasicMaterial({ color: 0xffe2c4, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const pathLine = new THREE.Line(pathGeo, pathMat);
  pathGeo.setDrawRange(0, 0);
  group.add(pathLine);

  // Layer planes for the graph view (faint frames).
  const planes = LAYERS.map((y) => {
    const g = new THREE.EdgesGeometry(new THREE.PlaneGeometry(15, 9.4));
    const m = new THREE.LineBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: 0, depthWrite: false });
    const l = new THREE.LineSegments(g, m);
    l.rotation.x = -Math.PI / 2;
    l.position.y = y;
    group.add(l);
    return m;
  });

  const state: GalaxyState = { intro: 0, camZ: 13, camY: 0.6, lookY: 0, tiltX: 0.18, spin: 0, morph: 0, path: 0, dim: 1, offsetX: 0 };

  // Pointer: eased tilt + "query" highlight.
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  const onMove = (e: PointerEvent) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    mouse.active = true;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 768 ? 70 : 55;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = w / h;
    uniforms.uSize.value = w < 768 ? 40 : 52;
  };
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  let running = true;
  let last = performance.now();
  let elapsed = 0;
  let autoSpin = 0;

  const render = () => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    const t = elapsed;
    if (!opts.still) autoSpin += dt * 0.045 * (1 - state.morph * 0.7);
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    uniforms.uTime.value = opts.still ? 0 : t;
    uniforms.uIntro.value = state.intro;
    uniforms.uMorph.value = state.morph;
    uniforms.uDim.value = state.dim;
    uniforms.uMouse.value.set(mouse.active ? mouse.tx : 10, mouse.active ? mouse.ty : 10);

    group.position.x = state.offsetX;
    group.rotation.y = autoSpin + state.spin + mouse.x * 0.35;
    group.rotation.x = state.tiltX - mouse.y * 0.18;
    camera.position.set(mouse.x * 0.6, state.camY + mouse.y * 0.3, state.camZ);
    camera.lookAt(0, state.lookY, 0);

    const m = Math.max(0, (state.morph - 0.55) / 0.45);
    edgeMat.opacity = m * m * 0.5 * state.dim;
    planes.forEach((p) => (p.opacity = m * 0.2 * state.dim));
    pathMat.opacity = Math.min(1, state.path * 3) * 0.95 * state.dim;
    pathGeo.setDrawRange(0, Math.max(0, Math.round(state.path * data.pathCount)));

    renderer.render(scene, camera);
  };

  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!running) return;
    render();
  };

  // Pause when the tab is hidden or the canvas is fully dimmed.
  const vis = () => (running = document.visibilityState === "visible");
  document.addEventListener("visibilitychange", vis);

  if (opts.still) {
    state.intro = 1;
    render();
  } else {
    loop();
  }

  return {
    state,
    render,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", vis);
      geo.dispose();
      mat.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      pathGeo.dispose();
      pathMat.dispose();
      renderer.dispose();
    },
  };
}
