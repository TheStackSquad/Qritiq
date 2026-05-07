import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  // 1. Basic JS recommended rules
  js.configs.recommended,

  // 2. Wrap Next.js configs to fix the serialization/circularity issue
  ...compat.config({
    extends: ["next/core-web-vitals"],
    parser: "@babel/eslint-parser", // Explicitly set parser
    parserOptions: {
      requireConfigFile: false, // Prevents "No config file found" error with babel-eslint-parser
      babelOptions: {
        presets: ["next/babel"], // Use Next.js Babel preset
      },
    },
    rules: {
      // Add any specific overrides here if needed
    },
  }),

  // 3. Global ignores (Crucial for Vercel/Next.js builds)
  {
    ignores: [".next/**", "node_modules/**", "dist/**"],
  },
];

export default eslintConfig;
