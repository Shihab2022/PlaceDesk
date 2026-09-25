import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Standalone CommonJS helper scripts (not part of the Next.js build).
    "checkdepth.cjs",
    "scripts/**",
    // Legacy deck.gl helper module superseded by components/placeDesk/*;
    // kept for reference and not imported anywhere in the app.
    "utils/layers.ts",
  ]),
]);

export default eslintConfig;
