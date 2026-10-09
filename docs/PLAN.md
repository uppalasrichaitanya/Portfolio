# Portfolio — Design & Build Plan

Status: approved and built. Decisions from review are recorded in §10.

---

## 1. The idea

Your four projects share one trait, and the brief never mentions it.

- Cartograph: *"Every edge is read from an import statement."*
- Quiver: *"Every benchmark number links to raw JSON, including the ones where Quiver loses."*
- ServoPilot: you hit a problem with no tool for it, so you built the tool and measured the result (59% faster tuning).
- DUM-E: makes invisible agent work visible.

You build things from first principles and then **show the evidence**. That is rarer than "I build systems", and it's what will stick with a reader.

**The concept is an engineering logbook.** The site should feel like a carefully kept lab notebook from someone who measures things: precise type, data set in monospace, one signal colour, figures with real captions, and claims that sit next to their proof. It should not look like a startup landing page or a designer's showcase.

That gives the site its one recurring motif:

> **The signal trace.** One thin teal line, the colour of an oscilloscope trace. In the hero it draws itself once as a step response: a jump, a small overshoot, then settling onto its target. It comes from your own work (ServoPilot's PID tuning) and stands for converging on something correct. The same line returns as the hover underline on titles, the left rule on expanded case studies, and the highlight colour for Quiver in its charts. Teal always means *signal*. Nothing else is teal.

The brief's tagline, *"Building systems from scratch. AI research at scale"*, has a problem: "AI research at scale" isn't accurate. Your research is in robotics (VLAs, world action models, sim-to-real), and none of it is "at scale". A reader who checks will notice. I propose:

> **I build systems from first principles — and measure them honestly.**
> Robotics research at Teleparadigm Networks. A vector database, a code cartographer, an agent orchestrator, and a servo-tuning suite, built from scratch.

(Wording to be finalised in the copy pass. Both the measured-honestly framing and the robotics line are things you can back up.)

---

## 2. The journey

| Step | Visitor's question | Answered by |
|---|---|---|
| First screen (0–5 s) | Who is this, and are they serious? | Name, the one-line positioning, the trace drawing in, and a "currently" line naming the live work |
| Skim (5–30 s) | What have they built? | Four project chapters. Each shows a title, one sentence, **2–3 proof numbers**, and one strong visual. A reader who only skims still gets the substance. |
| Dig in (1–5 min) | How deep does it go? | "Read the case" opens an inline case study for each project: problem, approach, evidence, what was hard |
| Context | Real-world experience? | Teleparadigm, a short text log of how the work progressed |
| Range | What else? | One compact row of six more projects that expands into a list |
| Act | How do I reach them? | Large email link with one-click copy, plus GitHub and LinkedIn |

**Every section has to earn its place.** What I'm deliberately leaving out: an about-me essay, skill bars, a skills grid, testimonials, a blog, a dark/light toggle (the site is dark by design), and a loading screen.

---

## 3. Information architecture

```
Top bar (thin, fixed, hides on scroll down, returns on scroll up)
  Uppala Sri Chaitanya ............ Work  Experience  Contact

01  HERO
    Name · positioning · trace · "Currently: sim-to-real actuator model for the SO-101 arm"

02  SELECTED WORK                                  4 chapters, full width
    01 DUM-E · 02 Cartograph · 03 ServoPilot · 04 Quiver
    each: index · title · one-liner · proof strip · media plate · links · [Read the case]

03  EXPERIENCE
    Teleparadigm Networks · Sep 2025 — present · text-only progression log

04  ALSO BUILT                                     collapsed by default
    "TARS · Keyriff · Design-Taste · Autodevlab · Scraper · Quillpad  [+]"
    expands into a 6-row index: name · one-liner · stack · ↗ GitHub

05  CONTACT / FOOTER
    "Let's talk." · email (copy) · GitHub · LinkedIn
```

**Why chapters and not a card grid.** Cards make four substantial projects look like four interchangeable thumbnails. Full-width chapters give each project room, keep the required order, and read like a portfolio of *work* rather than a gallery. On desktop the media sits beside the text, alternating sides. On mobile they stack.

**Navigation through the four chapters.** On wide screens a small fixed index (`01 02 03 04`) sits in the left margin. The current project's number turns teal and each number jumps to its chapter. It's hidden on tablet and mobile.

---

## 4. The four chapters — content and curated visuals

I reviewed every asset you uploaded and read the three public repos. Several stack claims in the brief **don't match the code**, so I've corrected them below.

### 01 · DUM-E
- **One-liner:** A local-first desktop orchestrator that runs OpenCode, Qwen Code, Claude Code and Codex as one coordinated team, on a live pixel-art workshop floor.
- **Stack (corrected from the repo):** Electron · TypeScript · React · PixiJS · node-pty / xterm.js · SQLite. *(The brief said Rust/Python and "Claude API / Qwen API". The repo shows Electron plus real agent CLIs running in PTYs.)*
- **Proof strip:** `4 engines` · `real PTYs, not wrappers` · `local-first, no telemetry`
- **Primary visual:** `floor-loop.webm`, a 1 MB looping clip of the robots working the floor, with `floor-loop-poster.webp` as its poster image. It has more personality than anything else you sent.
- **Inside the case:** `diagram-how.svg` (the architecture), `command-center-terminal.png` (real orchestrator dispatch output, cropped), and `cast-sheet.png` as a thin strip of robot portraits.
- **Skipped:** `settings-engines.png` (an API-key form), `tasks-kanban.png` (mostly empty board), `hero-floor.png` (no UI context), `hero-command-center.png` (near-duplicate of the poster).
- **Links:** GitHub, Website (dum-e-lab.com), Download.

### 02 · Cartograph
- **One-liner:** Turns a repository into a verified architecture map. Every edge is read from an import statement; nothing is guessed.
- **Stack (corrected):** Next.js · TypeScript · tree-sitter (WASM) · ELK · React Flow. *(The brief said "Graph DB". There isn't one.)*
- **Proof strip:** `JS · TS · Python · Go` · `5 confidence levels` · `uploaded code is never executed`
- **Primary visual:** a re-cut of `cartograph-demo-small.mp4`. The original is 64 s and 11 MB, which is too heavy. I'll trim it to a ~20 s loop of the key moments (map renders → region opens → AI explains a file), at 1280 px wide, encoded as AV1/VP9 + H.264 at roughly 2–3 MB.
- **Inside the case:** `og-axios.png`, a real export run on axios/axios. It's the strongest evidence here because it shows the tool working on someone else's code. Also `hero-card-dark.png`.
- **Skipped:** `cartograph-demo.gif` (7 MB, and the video does the job better), `poster.png`, `social-square.png`, `og-cartograph.png`, `og-summary.png`. These are marketing images.
- **Links:** GitHub, Live (cartograph-dev.vercel.app).

### 03 · ServoPilot
- **One-liner:** A desktop suite for configuring, monitoring and PID-tuning ST3215 servos. Built at Teleparadigm when the SO-101 arm jittered and no tuning tool existed.
- **Proof strip:** `59% less tuning time` · `70 Hz stable telemetry` · `21 ms API round-trip`
- **Primary visual:** the PID Tuning screenshot, **cropped to the live step-response panel**. At full width the whole 1920 px window shrinks into unreadable UI, while the step response alone tells the story. It also echoes the hero trace.
- **Inside the case:** the Real-time Graph screenshot (tracking goal vs. actual) and a 6–8 s muted clip from the bench video showing the arm moving next to the laptop. The phone footage is shaky and ends on an Excel sheet, so I'll take only the best few seconds and remove the audio. If that clip still isn't good enough, I'll drop it.
- **Skipped:** the Control Table, Device Config and Sync Control screenshots (dense forms), and `st3215-hs-servo-motor-1.jpg` (a vendor product photo).
- **Links:** none. The repo is private.
- ⚠ **This chapter is blocked on the double-blind question in §10.**

### 04 · Quiver — custom visual
- **One-liner:** A single-node vector database built from scratch in Rust, with HNSW, SQ8 and IVF-PQ indexes, a checksummed WAL, crash recovery and filtered search.
- **Stack:** Rust · AVX2 SIMD · mmap · PyO3 bindings · HTTP server
- **Proof strip:** `Recall@10 0.9961` · `p99 0.63 ms` · `235 tests + hard-kill crash tests`
- **Primary visual: "HNSW descent".** I'll build this as an SVG/React animation, about 3 s long, that plays once when it scrolls into view. It shows three stacked layers of a sparse graph. A query point enters at the top, greedily hops toward its nearest neighbour, drops a layer, and repeats. On the bottom layer the 10 nearest results light up teal. Replay is a button, not a loop. It explains what the database actually does and is built for this page rather than borrowed from somewhere else.
- **Inside the case, the evidence section** (uses the dataviz skill, numbers checked against `benchmarks/README.md`):
  - **Recall@10:** Quiver 0.9961 · FAISS 0.9922 · hnswlib 0.9920
  - **Throughput (QPS):** hnswlib 2,832 · **Quiver 2,680** · FAISS 2,336. Quiver is shown second, as measured.
  - **p99 latency:** **Quiver 0.63 ms** · hnswlib 0.74 · FAISS 0.91
  - **Memory:** raw float32 488 MB → SQ8 122 MB (4×) → IVF-PQ codes 30.5 MB (16×). This compares index sizes only; HNSW's 902.5 MB peak RSS is labelled separately.
  - **Filtered search at 1% selectivity:** 83.7 → 195.2 QPS (2.3×). p99 fell from 52.3 to 12.7 ms. The cost: recall 0.9995 → 0.9983, stated plainly.
  - **The honest gap:** builds are about 2× slower than FAISS and hnswlib because Quiver fsyncs its WAL during the build. Quiver's own README says this, and showing it is what makes the rest believable.
  - **Caption:** *SIFT1M (1M × 128-d, 10k queries, L2). Single-threaded, i7-12650H, 16 GB, Windows 11. All engines M=32, efC=200, ef=100, same harness.* Plus a link to the raw JSON.
- **Story beat for the case:** a regression traced to `neighbors()` allocating a `Vec` inside the beam-search loop. Fixing it made search 3.4× faster. It's a good example of systems work.
- **Charts** use the site's own colours: Quiver in teal, the other engines in neutral grey, values on the bars, no legends to decode.
- **Links:** GitHub.

### Case study structure (the same for all four)
1. **Problem** (2–3 sentences)
2. **Approach** (3–5 short points, with one figure)
3. **Evidence** (numbers, charts, or the curated media)
4. **What was hard** (one honest paragraph, which is what makes it read as written by a person)

Each case is about 200–300 words plus figures, never a wall of text.

---

## 5. Experience — Teleparadigm Networks (text only)

**Robotics R&D · Sep 2025 — present**

Laid out as a vertical log of stages, each one or two lines, joined by a hairline. The work reads as a progression:

1. **Bring-up.** ROS 2 manipulation on the OpenMANIPULATOR-X and SO-101 arms.
2. **A problem without a tool.** Both arms jittered. Dynamixel Wizard fixed the OMX, but nothing existed for the SO-101's ST3215 servos.
3. **So I built one: ServoPilot.** Servo configuration, telemetry and PID tuning that fixed the arm. *(Paper status is subject to §10.)*
4. **Vision-language-action models.** Evaluated MolmoAct and SmolVLA.
5. **World action models.** Studied the pipelines of LingBot-VA, Fast-WAM and Efficient-WAM, and trained, fine-tuned and tested them.
6. **Now: sim-to-real.** An actuator model for the SO-101 to close the simulation gap *(in progress)*, plus VR teleoperation in simulation to record manipulation datasets.

The current stage ("Now") gets a small teal marker. That is the only colour in this section.

---

## 6. Visual system

**Colour** (each pairing checked for contrast)
| Token | Value | Use |
|---|---|---|
| `bg` | `#1a1a1a` | page |
| `bg-raised` | `#202020` | media plates, open case panels |
| `line` | `rgba(255,255,255,0.08)` | hairlines, plate borders |
| `text` | `#f5f5f5` | body |
| `text-strong` | `#ffffff` | headings, numbers |
| `text-muted` | `#a3a3a3` | secondary text (about 7:1 on bg) |
| `signal` | `#14b8a6` | the trace, hover underline, focus ring, "now" marker, Quiver's chart bars. Nothing else. |

No gradients, apart from one barely visible vertical lift from bg to `#1d1d1d` behind the hero. No glass effects and no glows.

**Type**
- **Inter** (variable, self-hosted, Latin subset) for everything written. Display sizes use weight 700–800, tighter tracking (−0.03em) and `font-size: clamp()`. Body is 400 at 17–18 px with 1.6 line height and about 68 characters per line.
- **JetBrains Mono** (subset) for data only: proof numbers, chapter indices, stack labels and chart labels. Numbers use tabular figures.
- **Scale:** 12 / 14 / 17 / 22 / 32 / 48 / 72–96 (hero).

**Media plates.** Every image and video sits in the same frame: 1px hairline border, 12px radius, `bg-raised`, and a small mono caption underneath (`FIG. 02 — Region view on axios/axios`). That frame lets DUM-E's cream pixel art, Cartograph's paper beige and ServoPilot's dark Qt UI sit on one page without clashing. Each project keeps its own look inside a consistent frame.

**Layout.** A 12-column grid with a 1200px max width. Large vertical gaps between chapters (160px on desktop, 96px on mobile). A 16px side gutter on phones and no horizontal scrolling.

---

## 7. Motion and interaction

All motion stays out of the reader's way. Nothing blocks reading and nothing loops for attention.

| Element | Behaviour |
|---|---|
| Hero trace | Draws once on load (about 1.1 s, `stroke-dashoffset`) and settles. Static afterwards. |
| Scroll reveals | Fade in plus a 12px upward slide over 350 ms, `cubic-bezier(0.22,1,0.36,1)`. Runs once per element, children staggered 60 ms. Applies to headings and plates only; body text is simply there. |
| Title hover | A teal underline grows from the left over 200 ms (the trace motif). No scaling of text. |
| Media hover (desktop) | Plate border brightens and the image lifts 1.01× over 200 ms. |
| Read the case | Inline expand: height animates over 400 ms and the content fades in after it. The chevron rotates. The URL updates (`#quiver/case`) so the case can be linked. A bottom "Close" button returns you to the chapter top. |
| Videos | Muted autoplay **only while on screen** and paused off screen. `preload="none"` with a poster image. With reduced motion or Save-Data on, they show the poster plus a play button. |
| HNSW descent | Plays once when in view, with a replay button. |
| Email | Click to copy, then "Copied ✓" for 1.5 s. A separate `mailto:` arrow sits next to it. |
| Chapter index | The current chapter number turns teal (tracked with IntersectionObserver). |
| Scrolling | **Native.** No smooth-scroll library (Lenis and similar) and no scroll hijacking. Those cause jank on trackpads and low-end phones and hurt accessibility. Smoothness comes from compositor-only animation (`transform`/`opacity`) and nothing heavy on the main thread. |

`prefers-reduced-motion`: no slides, no trace draw, no autoplay, only instant or opacity changes.

Things I'm deliberately not doing: custom cursors, magnetic buttons, parallax, count-up numbers, typing effects, page-load sequences, 3D, and sound.

---

## 8. Tech stack (a deliberate change from the brief)

**Astro + React islands + Tailwind v4 + Motion (the Framer Motion library under its new name).**

The brief offered Vite or Next.js. This site is mostly static content with a few interactive parts. With Astro the page ships as plain prerendered HTML: fast first paint, correct link previews, crawlable text. JavaScript loads only for the islands that need it: case expansion, the HNSW animation, charts, video control and email copy. A Vite single-page app would send the whole page as JavaScript. Next.js would add about 90 KB of runtime for features we don't use. The React, TypeScript, Tailwind and Motion code is the same either way.

- Motion loaded through `LazyMotion` with `domAnimation` to keep the bundle small.
- Charts written as plain SVG React components (no chart library for six bars).
- Media pipeline: `astro:assets` for AVIF/WebP plus `srcset`. Videos are re-encoded with ffmpeg to AV1/VP9 + H.264, with posters. Audio is stripped.
- Content lives in one typed file, `src/content/projects.ts`, with no copy hard-coded into components.
- **Budgets:** under 60 KB of JavaScript (gzip) on first load; LCP under 1.5 s on 4G; CLS of 0; Lighthouse 95+ in every category. Every image and video reserves its space (aspect-ratio).
- Accessibility: semantic landmarks, `aria-expanded` on the case toggles, visible teal focus rings, a skip link, alt text on every figure, and text alternatives for the charts.
- Hosting on Vercel as static output. An OG preview image generated in the same visual style.

### Project structure
```
src/
  pages/index.astro
  layouts/Base.astro              meta, fonts, OG
  content/projects.ts             all copy + data, typed
  components/
    Hero.astro  Trace.tsx
    Chapter.astro  CaseStudy.tsx  ProofStrip.astro  MediaPlate.astro  AutoVideo.tsx
    quiver/HnswDescent.tsx  quiver/BenchChart.tsx
    Experience.astro  AlsoBuilt.tsx  Contact.astro  ChapterIndex.tsx
  styles/tokens.css
public/media/                     optimised outputs only
assets/                           your raw uploads (kept untouched)
```

---

## 9. Build order

1. Scaffold (Astro, Tailwind, tokens, fonts) and the base layout.
2. Static content for every section with real copy and no animation, then a layout pass on mobile and desktop.
3. Media pipeline: crops, re-encodes and posters.
4. Interactions: reveals, case expansion with deep links, autoplay video, email copy, chapter index.
5. Quiver: HNSW descent animation and benchmark charts.
6. Hero trace.
7. Pass on accessibility, reduced motion and performance budgets, with Lighthouse and screenshots at 375 / 768 / 1440 px.
8. OG image, meta tags, Vercel config.

Each step gets its own commit pushed to the branch, with you as the author.

---

## 10. Decisions (resolved)

1. **ServoPilot:** show the metrics and say the paper is under review (venue not named). No repo or source links.
2. **ServoPilot stack:** Python + PyQt desktop app, Linux and Windows.
3. **Framework:** Astro, with Motion (Framer Motion) for reveals and interactions. React components run on Preact's compat layer, which cuts the runtime from ~67 KB to ~10 KB gzipped. First-load JS is ~50 KB gzipped in total.
4. **Tagline:** "Built from scratch. Measured honestly." "Systems that scale" was considered and rejected because nothing on the page demonstrates scale, while every project demonstrates measurement.
5. **Open projects:** TARS, Autodevlab and Scraper aren't public yet, so they're listed as "private repo" without links.

---

## 11. Visual revision (supersedes parts of §6 and §7)

The first build was correct but read as a plain document: one flat grey, no surfaces, an empty right half in the hero, and every section hidden until its island hydrated. The revision keeps the logbook concept and the single teal signal, and adds depth:

- **Palette:** near-black `#0a0b0d` with raised surfaces (`#111317`), brighter signal `#2dd4bf`. An engineering-paper grid and a soft teal glow behind the hero and contact panel only.
- **Type:** Inter + JetBrains Mono as before, plus Instrument Serif italic for one accent phrase per heading ("*Measured honestly.*").
- **Hero:** two columns. The trace now lives in an instrument-panel card with four readouts and the "Now" line. Primary and secondary buttons plus GitHub/LinkedIn.
- **Chapters:** each project is a card; media sits in a window-chrome frame; proof numbers are tiles; stack is chips. On phones the media comes first.
- **Experience:** sticky org card with focus-area chips, numbered stage cards, highlighted "Now".
- **Also built:** always-visible card grid (was collapsed behind a "+").
- **Contact:** a single panel with a copy-to-clipboard email field and buttons.
- **Reveals:** CSS + one IntersectionObserver. Content is visible by default and only hidden once JS is running, so nothing is blank without JS or on slow hydration.
