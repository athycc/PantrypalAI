import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  optimizeDeps: {
    exclude: [
      "@tanstack/start-client-core",
      "@tanstack/start-plugin-core",
      "@tanstack/start-server-core",
    ],
  },
  plugins: [
    cloudflare(),
    tanstackStart({
      server: { entry: "server" },
    }),
    tailwindcss(),
    tsconfigPaths(),
    react(),
  ],
});
