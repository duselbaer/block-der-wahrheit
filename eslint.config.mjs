import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import vitest from "@vitest/eslint-plugin";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals"),

  // Importregel: keine zirkulären Abhängigkeiten
  {
    plugins: { import: importPlugin },
    rules: {
      "import/no-cycle": "error",
    },
  },

  // Test-Dateien: keine .only-Tests, keine doppelten Titeln
  {
    files: ["src/tests/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
    plugins: { vitest },
    rules: {
      "vitest/no-focused-tests": "error",
      "vitest/no-identical-title": "error",
    },
  },
];
