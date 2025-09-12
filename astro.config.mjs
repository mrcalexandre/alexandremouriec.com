import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  output: "static",
  redirects: {
    "/resume":
      "https://kdrive.infomaniak.com/app/share/1247749/e07325e1-160f-42ae-a0c8-7722811139af",
  },
  site: "https://alexandremouriec.com",
  vite: { plugins: [tailwindcss()] },
});
