import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import { defineConfig } from 'astro/config';
import { remarkModifiedTime } from './src/scripts/remark-modified-time.mjs';


// https://astro.build/config
export default defineConfig({
  site: "https://alexandremouriec.com",
  integrations: [tailwind(), vue(), sitemap()],
  markdown: {
    remarkPlugins: [remarkModifiedTime],
  }
});
