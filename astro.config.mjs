import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/static";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

import { remarkModifiedTime } from "./src/utils/remark-modified-time.mjs";
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [tailwind(), sitemap(), icon({
    iconDir: "src/images/icons"
  })],
  markdown: {
    remarkPlugins: [remarkModifiedTime, remarkReadingTime]
  },
  output: "static",
  site: "http://localhost:4321",
  trailingSlash: "always"
});
