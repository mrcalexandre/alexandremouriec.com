
/** @type {import("tailwindcss").Config} */

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: ["class"],
  extend: {
    colors: {
      "dark": "#2e2e2e",
      "light": "#fff7f3",
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
  safelist: ["dark"],
};
