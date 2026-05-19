import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-ignore - plain JS module, no types
import { generateSitemap } from "./scripts/generate-sitemap.mjs";

// Vite plugin: regenerate public/sitemap.xml at build start
const sitemapPlugin = () => ({
  name: "generate-sitemap",
  apply: "build" as const,
  async buildStart() {
    try {
      await generateSitemap();
    } catch (e) {
      console.warn("[sitemap] generation failed:", e);
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  build: {
    // This increases the limit to 1000kb to resolve the chunk size warning
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(), 
    sitemapPlugin(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
