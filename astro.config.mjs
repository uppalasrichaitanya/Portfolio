import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";

// Preact with React compat: the components are written against React's API
// (and Motion's React bindings) but ship ~4 KB of runtime instead of ~60 KB.
export default defineConfig({
  site: "https://uppalasrichaitanya.vercel.app",
  integrations: [preact({ compat: true })],
  vite: {
    plugins: [tailwindcss()],
    // Bundle Motion during SSR so its `react` imports go through the compat alias too.
    ssr: { noExternal: ["motion", "framer-motion"] },
  },
  build: { inlineStylesheets: "auto" },
});
