import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import { defineConfig } from 'astro/config';

import vercel from "@astrojs/vercel/static";

// https://astro.build/config
export default defineConfig({
  site: "https://alexandremouriec.com",
  integrations: [tailwind(), vue(), sitemap()],
  output: "static",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});
