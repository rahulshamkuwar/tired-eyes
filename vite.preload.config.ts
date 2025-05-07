import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@preload": resolve(__dirname, "src/preload"),
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
  build: {
    outDir: ".vite/build",
    rollupOptions: {
      external: ["electron"],
    },
  },
});
