import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/static";
import vue from "@astrojs/vue";
import { defineConfig } from 'astro/config';
import { remarkModifiedTime } from './src/utils/remark-modified-time.mjs';
import { remarkReadingTime } from './src/utils/remark-reading-time.mjs';


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
  markdown: {
    remarkPlugins: [remarkModifiedTime, remarkReadingTime],
  },
});
