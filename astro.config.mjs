import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/static";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";
import { trailingSlash } from "./src/middleware/trailingSlash.js";
import { remarkModifiedTime } from "./src/utils/remark-modified-time.mjs";
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "http://localhost:4321",
  integrations: [tailwind(), vue(), sitemap()],
  output: "static",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  build: {
    middleware: [trailingSlash],
  },
  markdown: {
    remarkPlugins: [remarkModifiedTime, remarkReadingTime],
  },
  trailingSlash: "always",
});
