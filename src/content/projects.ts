export type Link = { label: string; href: string };
export type Proof = { value: string; label: string };

export type Media =
  | { kind: "video"; src: { webm: string; mp4: string }; poster: string; width: number; height: number; alt: string; caption: string; preferMp4?: boolean }
  | { kind: "image"; src: string; width: number; height: number; alt: string; caption: string; pixelated?: boolean }
  | { kind: "hnsw"; caption: string };

export type CaseStudy = {
  problem: string;
  approach: string[];
  evidence: { figures?: Media[]; metrics?: { label: string; value: string; note?: string }[]; charts?: "quiver" };
  hard: { title: string; body: string };
  note?: string;
};

export type Project = {
  id: string;
  index: string;
  title: string;
  kicker: string;
  oneLiner: string;
  proof: Proof[];
  stack: string[];
  links: Link[];
  linkNote?: string;
  media: Media;
  case: CaseStudy;
  extra?: Media;
};

const GH = "https://github.com/uppalasrichaitanya";

export const projects: Project[] = [
  {
    id: "dum-e",
    index: "01",
    title: "DUM-E",
    kicker: "Desktop app · Agent orchestration",
    oneLiner:
      "Runs OpenCode, Qwen Code, Claude Code and Codex as one coordinated team, on a pixel-art workshop floor where you can watch them work.",
    proof: [
      { value: "4", label: "coding-agent engines on one floor" },
      { value: "PTY", label: "every agent is a real terminal, not a wrapper" },
      { value: "0", label: "telemetry. Keys and code stay local" },
    ],
    stack: ["Electron", "TypeScript", "React", "PixiJS", "node-pty", "SQLite"],
    links: [
      { label: "GitHub", href: `${GH}/DUM-E` },
      { label: "Website", href: "https://dum-e-lab.com" },
    ],
    media: {
      kind: "video",
      src: { webm: "/media/dume-floor.webm", mp4: "/media/dume-floor.mp4" },
      poster: "/media/dume-floor-poster.webp",
      width: 1280,
      height: 720,
      preferMp4: true,
      alt: "DUM-E's workshop floor: pixel-art robots walk between desks while the command center dispatches work.",
      caption: "The workshop floor. Each robot is a live agent session.",
    },
    case: {
      problem:
        "Coding-agent CLIs are strong on their own, but running several at once turns into a mess of terminal tabs, copy-pasted context and no clear picture of who is doing what.",
      approach: [
        "One orchestrator agent reads a shared board, breaks work down and delegates to workers. You stay in charge of the orchestrator.",
        "Every worker is a genuine CLI session in its own PTY, so each engine keeps its full native feature set.",
        "Agents coordinate through outbox → inbox mail with reply tracking. Per-agent memory and a shared task board hold the state.",
        "Optional git-worktree isolation keeps parallel edits from colliding; cost caps and a circuit breaker stop runaway loops.",
      ],
      evidence: {
        figures: [
          {
            kind: "image",
            src: "/media/dume-diagram.svg",
            width: 1200,
            height: 640,
            alt: "Architecture diagram: you set the mission; DUM-E reads memory, mailboxes, tasks.json and fleet.json and delegates to Qwen, Claude, Codex and OpenCode workers.",
            caption: "The orchestrator reads shared state and delegates to real terminals.",
          },
          {
            kind: "image",
            src: "/media/dume-terminal.webp",
            width: 1300,
            height: 230,
            alt: "Orchestrator log: all five tasks dispatched to existing idle agents, no new spawns needed.",
            caption: "The orchestrator's own log: five tasks routed to idle workers, no new spawns.",
          },
        ],
      },
      hard: {
        title: "Making many agents legible",
        body: "Logs show what happened, not what's happening. Putting every agent on a 2D floor, walking to errands and carrying mail between desks, sounds decorative. In practice it's the fastest way to see which agent is stuck, idle or busy.",
      },
    },
    extra: {
      kind: "image",
      src: "/media/dume-cast.png",
      width: 2496,
      height: 384,
      pixelated: true,
      alt: "The DUM-E cast: thirteen pixel-art robot agents.",
      caption: "The cast.",
    },
  },
  {
    id: "cartograph",
    index: "02",
    title: "Cartograph",
    kicker: "Web app · Static analysis",
    oneLiner:
      "Turns a repository into a verified architecture map. Every edge is read from an import statement; nothing is guessed from folder names.",
    proof: [
      { value: "4", label: "languages: JS, TS, Python, Go" },
      { value: "5", label: "confidence levels on every node and edge" },
      { value: "0", label: "lines of uploaded code executed" },
    ],
    stack: ["Next.js", "TypeScript", "tree-sitter", "ELK", "React Flow"],
    links: [
      { label: "GitHub", href: `${GH}/Cartograph` },
      { label: "Live demo", href: "https://cartograph-dev.vercel.app" },
    ],
    media: {
      kind: "video",
      src: { webm: "/media/carto-demo.webm", mp4: "/media/carto-demo.mp4" },
      poster: "/media/carto-demo-poster.webp",
      width: 1280,
      height: 720,
      alt: "Cartograph mapping axios: the region overview, a region opened to its files, and the AI guide explaining a file.",
      caption: "Mapping axios/axios: survey, open a region, inspect the evidence.",
    },
    case: {
      problem:
        "Architecture diagrams drift from the code they describe. Tools that infer structure from folder names produce maps that look right and aren't.",
      approach: [
        "Parse every file with tree-sitter and resolve each import to its target. An import that can't be resolved is drawn as unresolved, not dropped. A missing edge and an edge to nowhere are different facts.",
        "Tag every fact as verified, derived, heuristic, unknown or assisted, and never let confidence increase as data moves through the pipeline.",
        "Two altitudes: a region-level survey of the whole repository, then file-level dependencies with orthogonal routes laid out by ELK.",
        "An AI guide explains a repository, region or file in plain language, but generated text is never drawn as graph geometry.",
      ],
      evidence: {
        figures: [
          {
            kind: "image",
            src: "/media/carto-axios.webp",
            width: 1200,
            height: 630,
            alt: "Exported architecture figure for axios/axios: 89 files and 177 imports grouped by folder, with numbered observations about import cycles.",
            caption: "Exported figure for axios/axios: 89 files, 177 imports, arrows weighted by import count.",
          },
        ],
      },
      hard: {
        title: "Honesty under uncertainty",
        body: "The easy version silently drops imports it can't resolve and shows a clean graph. Keeping unresolved edges visible, and keeping AI output out of the geometry, makes the map messier, and makes it trustworthy.",
      },
    },
  },
  {
    id: "servopilot",
    index: "03",
    title: "ServoPilot",
    kicker: "Desktop app · Robotics · Teleparadigm Networks",
    oneLiner:
      "A desktop suite for configuring, monitoring and PID-tuning ST3215 servos, built when our SO-101 arm jittered and no tuning tool existed for its motors.",
    proof: [
      { value: "59%", label: "less time to tune (272 s → 112 s)" },
      { value: "70 Hz", label: "stable single-servo telemetry" },
      { value: "21 ms", label: "mean REST API round-trip" },
    ],
    stack: ["Python", "PyQt", "Serial bus", "PID control", "REST API", "Linux · Windows"],
    links: [],
    linkNote: "Source private while the paper is under double-blind review.",
    media: {
      kind: "image",
      src: "/media/servo-step.webp",
      width: 950,
      height: 350,
      alt: "ServoPilot's live step-response plot: the dashed goal position steps up and down and the measured position follows it.",
      caption: "Live step response while tuning: goal (dashed) against measured position.",
    },
    case: {
      problem:
        "Our SO-101 arm shook and jerked under load. On the OpenMANIPULATOR-X, Dynamixel Wizard fixed the same symptom, but the SO-101's ST3215 servos had no equivalent tool.",
      approach: [
        "Talk to the servos directly over the serial bus: scan, read the full register map, and edit IDs, angle limits, offsets and modes.",
        "Stream live telemetry (position, velocity, load, voltage, temperature, current) and plot goal against actual in real time.",
        "Run step tests and measure rise, overshoot and settling. A tuning advisor suggests the next P/I/D values and writes them to EEPROM.",
        "Coordinate all eight servos with synchronized moves and homing, and expose everything over a REST API for scripting.",
      ],
      evidence: {
        metrics: [
          { label: "Time to reach target tuning", value: "272 s → 112 s", note: "manual vs. advisor-guided, 59.0% less" },
          { label: "Tuning efficiency ratio", value: "2.44×", note: "T manual / T advisor" },
          { label: "Max stable telemetry rate", value: "70 Hz", note: "single servo, before packet loss exceeded threshold" },
          { label: "REST API round-trip", value: "21.15 ms", note: "mean of 50 trials, localhost" },
        ],
        figures: [
          {
            kind: "video",
            src: { webm: "/media/servo-bench.webm", mp4: "/media/servo-bench.mp4" },
            poster: "/media/servo-bench-poster.webp",
            width: 832,
            height: 464,
            alt: "The SO-101 arm on the bench moving through step tests while ServoPilot plots its response on the laptop beside it.",
            caption: "On the bench: step tests on the SO-101.",
          },
          {
            kind: "image",
            src: "/media/servo-tracking.webp",
            width: 1110,
            height: 870,
            alt: "Real-time graph: measured position of servo 77 tracking a sequence of goal positions.",
            caption: "Position tracking a goal sequence on servo #77.",
          },
        ],
      },
      hard: {
        title: "Telemetry rate against reliability",
        body: "Polling faster makes the plots smoother, until the bus starts dropping packets. 70 Hz is the highest single-servo rate that stayed under our packet-loss threshold, so that's the ceiling the tool works to.",
      },
      note: "Written up as a paper, currently under double-blind review.",
    },
  },
  {
    id: "quiver",
    index: "04",
    title: "Quiver",
    kicker: "Database · Systems",
    oneLiner:
      "A single-node vector database built from scratch in Rust, with HNSW, SQ8 and IVF-PQ indexes, a checksummed write-ahead log, crash recovery and filtered search.",
    proof: [
      { value: "0.9961", label: "Recall@10 on SIFT1M, above FAISS and hnswlib" },
      { value: "0.63 ms", label: "p99 latency, single-threaded" },
      { value: "2.3×", label: "faster filtered search at 1% selectivity" },
    ],
    stack: ["Rust", "AVX2", "mmap", "WAL", "HTTP API", "Python bindings"],
    links: [
      { label: "GitHub", href: `${GH}/Quiver` },
      { label: "Benchmarks", href: `${GH}/Quiver/blob/main/benchmarks/README.md` },
    ],
    media: {
      kind: "hnsw",
      caption: "How an HNSW query descends: greedy hops on sparse upper layers, then a local search at the bottom.",
    },
    case: {
      problem:
        "I wanted to understand vector search below the API: how a graph index finds neighbours, what quantization really costs, and what it takes for a database to survive being killed mid-write.",
      approach: [
        "HNSW with diversified neighbour selection; SQ8 (4×) and IVF-PQ (16×) compression with exact rerank.",
        "mmap storage, a CRC32 write-ahead log with group commit, and crash-safe compaction, tested with subprocess hard-kills at every failpoint.",
        "Filtered search over durable metadata: exact posting-list scans for selective filters, filter-aware graph traversal otherwise.",
        "Hand-written AVX2 distance kernels, a fuzz target in CI, an HTTP server and Python bindings.",
      ],
      evidence: { charts: "quiver" },
      hard: {
        title: "A regression I introduced",
        body: "After a refactor, search got slower. The cause was neighbors() allocating a Vec on every call inside the beam-search loop. Fixing it made search 3.4× faster than the original baseline. The build is still about 2× slower than FAISS, because Quiver fsyncs its WAL while building. Both are in the benchmark log.",
      },
    },
  },
];

export const experience = {
  org: "Teleparadigm Networks",
  role: "AI Research Intern",
  period: "Sep 2025 – present",
  summary:
    "From bringing up robot arms to training world action models: most of the work has been finding where the robot falls short and building what closes the gap.",
  tags: ["ROS 2", "SO-101", "OpenMANIPULATOR-X", "PID control", "VLA models", "World action models", "Sim-to-real", "VR teleoperation"],
  steps: [
    { title: "Bring-up", body: "ROS 2 manipulation on the OpenMANIPULATOR-X and SO-101 arms." },
    {
      title: "A problem without a tool",
      body: "Both arms jittered under load. Dynamixel Wizard fixed the OMX, but nothing existed for the SO-101's ST3215 servos.",
    },
    {
      title: "So I built one",
      body: "ServoPilot: servo configuration, telemetry and PID tuning that fixed the arm. Written up as a paper, now under double-blind review.",
      href: "/work/servopilot",
    },
    { title: "Vision-language-action models", body: "Ran and evaluated MolmoAct and SmolVLA on our arms." },
    {
      title: "World action models",
      body: "Studied the pipelines of LingBot-VA, Fast-WAM and Efficient-WAM, then trained, fine-tuned and tested them.",
    },
    {
      title: "Sim-to-real",
      body: "An actuator model for the SO-101 to close the gap between simulation and hardware (in progress), and VR teleoperation in simulation to record manipulation datasets.",
      now: true,
    },
  ],
};

export const alsoBuilt: { name: string; desc: string; href?: string; npm?: string }[] = [
  { name: "TARS", desc: "A disciplined, multi-session coding-agent loop." },
  { name: "Keyriff", desc: "A local-first typing trainer. Everything runs and stays in your browser.", href: `${GH}/Keyriff` },
  {
    name: "Design-Taste",
    desc: "A published MCP server (v1.0.1) with 7 tools that give coding agents design taste: rubrics, axe-core checks, a component registry and vision-model critique.",
    href: `${GH}/Design-Taste`,
    npm: "https://www.npmjs.com/package/design-taste-mcp",
  },
  { name: "Autodevlab", desc: "A personal second brain: auto-captured dev activity, AI insights, a live dashboard." },
  { name: "Scraper", desc: "Job aggregation and career intelligence: Next.js, FastAPI, Celery crawlers, pgvector, Elasticsearch." },
  {
    name: "Quillpad",
    desc: "A local-first Tauri notebook that turns chapter PDFs into clear, subject-organized study notes.",
    href: `${GH}/Quillpad`,
  },
];

export const about = {
  intro: [
    "I'm a second-year Computer Science & Machine Learning student at Keshav Memorial College of Engineering (KMCE), Hyderabad, and an AI Research Intern at Teleparadigm Networks, where I work on robot arms, from servo control up to world action models.",
    "Outside the lab I build things to understand them: a vector database in Rust, an orchestrator for coding agents, a static-analysis mapper. Each one ships with its numbers, including the ones that don't flatter it.",
  ],
  facts: [
    { label: "Based in", value: "Hyderabad, India" },
    { label: "Studying", value: "B.Tech CSM · KMCE '28" },
    { label: "Research", value: "Paper under peer review" },
    { label: "Now", value: "Sim-to-real for the SO-101" },
  ],
};

export const stats: { value: number; decimals?: number; suffix?: string; pad?: number; label: string }[] = [
  { value: 4, pad: 2, label: "systems built from scratch" },
  { value: 0.9961, decimals: 4, label: "Recall@10, Quiver on SIFT1M" },
  { value: 59, suffix: "%", label: "less servo tuning time" },
  { value: 1, pad: 2, label: "paper under peer review" },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Rust", "TypeScript", "Python", "JavaScript", "Java"] },
  { group: "Frameworks", items: ["React", "Next.js", "Node.js", "Electron", "Axum", "PyO3", "PyQt"] },
  { group: "Systems", items: ["mmap storage", "Write-ahead logging", "SIMD (AVX2/FMA)", "HNSW / ANN search"] },
  { group: "AI & agents", items: ["MCP", "Multi-agent orchestration", "LLM tool use", "Vision-model APIs"] },
  { group: "Robotics", items: ["ROS 2", "PID control", "Real-time telemetry", "VLA models", "Sim-to-real"] },
];

export const contact = {
  email: "uppalasrichaitanya2007@gmail.com",
  github: GH,
  linkedin: "https://www.linkedin.com/in/u-sri-chaitanya/",
  resume: "/resume.pdf",
};
