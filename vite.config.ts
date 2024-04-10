/// <reference types="vitest" />

import { defineConfig } from "vite";

export default defineConfig({
  test: {
    hookTimeout: 120000,
    testTimeout: 60000,
  },
});
