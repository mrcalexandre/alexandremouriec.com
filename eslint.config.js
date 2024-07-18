import eslintPluginAstro from "eslint-plugin-astro";
import perfectionist from "eslint-plugin-perfectionist";
import perfectionistNatural from "eslint-plugin-perfectionist/configs/recommended-natural";
export default [
  ...eslintPluginAstro.configs.recommended,
  perfectionistNatural,
  {
    plugins: {
      perfectionist,
    },
    rules: {
    },
  }
];
