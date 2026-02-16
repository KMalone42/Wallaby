import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/preload.mjs"), // write ESM here
      formats: ["cjs"],
      fileName: () => "preload.cjs",
    },
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: false,
    rollupOptions: {
      // IMPORTANT: don't externalize deps; bundle them into preload output
      external: ["electron"],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});

