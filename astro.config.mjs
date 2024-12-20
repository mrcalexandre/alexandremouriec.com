import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

import { remarkModifiedTime } from "./src/utils/remark-modified-time.mjs";
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), sitemap(), icon({
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
  trailingSlash: "never"
});
