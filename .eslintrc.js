module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "@nuxtjs/eslint-config-typescript",
    "plugin:nuxt/recommended",
    "eslint:recommended",
    "plugin:vue/recommended",
    "plugin:prettier-vue/recommended",
    "prettier",
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    "@typescript-eslint/no-empty-interface": 1,
  },
}
