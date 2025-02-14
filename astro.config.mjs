import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

import { remarkModifiedTime } from "./src/utils/remark-modified-time.mjs";
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap(), icon({
    iconDir: "src/images/icons"
  })],
  markdown: {
    remarkPlugins: [remarkModifiedTime, remarkReadingTime]
  },
  output: "static",
  redirects: {
    "/resume": "https://kdrive.infomaniak.com/app/share/1247749/e07325e1-160f-42ae-a0c8-7722811139af"
  },
  site: "https://alexandremouriec.com",
  vite: { plugins: [tailwindcss()] }
});
