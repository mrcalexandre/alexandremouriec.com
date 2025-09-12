import eslintPluginAstro from "eslint-plugin-astro";
import perfectionist from "eslint-plugin-perfectionist";

export default [
  ...eslintPluginAstro.configs.recommended,
  {
    plugins: {
      perfectionist,
    },
    rules: {
      ...perfectionist.configs["recommended-natural"].rules,
    },
  }
];
