import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Allow Japanese comments - disable any comment-related language consistency rules
      "spaced-comment": "off",
      // Allow mixed language comments in this internationalized project
      "@typescript-eslint/prefer-ts-expect-error": "off",
    },
  },
  {
    files: ["scripts/**/*.js"],
    rules: {
      // Allow CommonJS require in Node.js scripts
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
