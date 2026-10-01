// Builds optimised media in public/media from the raw uploads in assets/.
// Needs ffmpeg on PATH (or FFMPEG=/path/to/ffmpeg). Raw assets are never modified.
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";

const ff = process.env.FFMPEG || "ffmpeg";
const out = "public/media";
mkdirSync(out, { recursive: true });

const run = (args) => execFileSync(ff, ["-loglevel", "error", "-y", ...args], { stdio: "inherit" });
const still = (src, dst, vf = "null", q = 82) => run(["-i", src, "-vf", vf, "-frames:v", "1", "-c:v", "libwebp", "-quality", String(q), `${out}/${dst}`]);
const clip = (src, name, { ss, t, vf, poster = ss }) => {
  const base = ["-ss", ss, "-t", t, "-i", src, "-an", "-vf", vf];
  run([...base, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "40", "-row-mt", "1", "-deadline", "good", `${out}/${name}.webm`]);
  run([...base, "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `${out}/${name}.mp4`]);
  run(["-ss", poster, "-i", src, "-vf", vf, "-frames:v", "1", "-c:v", "libwebp", "-quality", "80", `${out}/${name}-poster.webp`]);
};

// DUM-E
copyFileSync("assets/dum-e/floor-loop.webm", `${out}/dume-floor.webm`);
run(["-i", "assets/dum-e/floor-loop.webm", "-an", "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `${out}/dume-floor.mp4`]);
still("assets/dum-e/floor-loop-poster.webp", "dume-floor-poster.webp");
copyFileSync("assets/dum-e/diagram-how.svg", `${out}/dume-diagram.svg`);
copyFileSync("assets/dum-e/cast-sheet.png", `${out}/dume-cast.png`);
still("assets/dum-e/command-center-terminal.png", "dume-terminal.webp", "crop=1300:230:316:410", 90);

// Cartograph: the map-to-explanation stretch of the demo
clip("assets/cartograph/cartograph-demo-small.mp4", "carto-demo", { ss: "19.5", t: "24", vf: "scale=1280:-2,fps=30", poster: "21" });
still("assets/cartograph/og-axios.png", "carto-axios.webp", "null", 88);

// ServoPilot: crop to the panels that carry the story
still("assets/servopilot/Screenshot_2026-05-12_125022.webp", "servo-step.webp", "crop=950:350:955:128", 88);
still("assets/servopilot/Screenshot_2026-05-12_124836.webp", "servo-tracking.webp", "crop=1110:870:808:115", 86);
clip("assets/servopilot/WhatsApp Video 2026-06-29 at 11.49.08.mp4", "servo-bench", { ss: "3", t: "9", vf: "fps=30" });
