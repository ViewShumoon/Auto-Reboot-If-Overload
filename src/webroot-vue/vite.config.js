import { resolve } from 'path'

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envConfig = loadEnv(mode, process.cwd());

  const VITE_PORT = parseInt(envConfig.VITE_PORT);
  return {
    server: {
      port: VITE_PORT,
    },
    plugins: [
      vue(),
      vueDevTools()
    ],
    build: {
      sourcemap: false,
      outDir: "../webroot",
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        "@": resolvePath("./src"),
      },
    },
  };
});

function resolvePath(p) {
  return resolve(__dirname, p);
}