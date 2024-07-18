/** @type {import("tailwindcss").Config} */

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: ["class"],
  plugins: [
    require("@tailwindcss/typography"),
  ],
  safelist: ["dark"],
  theme: {
    extend: {
      fontSize: {
        "xs": "12px"
      },
      screens: {
        "xxs": "525px"
      }
    }
  },
};
