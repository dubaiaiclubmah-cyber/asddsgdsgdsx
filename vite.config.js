import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // The site is published to a GitHub Pages project repository and served
  // from a subpath: https://dubaiaiclubmah-cyber.github.io/asddsgdsgdsx/
  // This base makes `npm run build` emit asset URLs that resolve correctly
  // under that subpath (no 404s, no blank page).
  base: "/asddsgdsgdsx/",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
