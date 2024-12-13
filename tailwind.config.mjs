/** @type {import("tailwindcss").Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: ["class"],
  plugins: [
    require("@tailwindcss/typography"),
  ],
  safelist: ["dark"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', ...defaultTheme.fontFamily.sans],
        serif: ['EBGaramondVariable', ...defaultTheme.fontFamily.serif],
      },
      fontSize: {
        "xs": "12px"
      },
      screens: {
        "xxs": "525px"
      }
    }
  },
};
