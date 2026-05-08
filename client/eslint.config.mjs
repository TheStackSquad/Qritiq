import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import babelParser from "@babel/eslint-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": hooksPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["next/babel"],
        },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        URL: "readonly",
        CustomEvent: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": ["error", { ignore: ["jsx"] }],
      "no-console": "off",
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^__" },
      ],
    },
  },
  // ─── Node.js scripts (mjs files) ───────────────────────
  {
    files: ["**/*.mjs", "**/scripts/**/*.js"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        URL: "readonly",
        Buffer: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**"],
  },
];
