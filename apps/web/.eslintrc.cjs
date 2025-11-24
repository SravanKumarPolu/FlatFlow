module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ["@flatflow/config/eslint/react.js"],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: {
    react: {
      version: "detect",
    },
  },
};

