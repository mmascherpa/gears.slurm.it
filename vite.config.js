import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import webfontDownload from 'vite-plugin-webfont-dl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    webfontDownload([
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap'
    ], {
      // The async media="print" + inline onload trick violates the CSP
      // (script-src has no 'unsafe-inline'), leaving the stylesheet stuck
      // on print media. The CSS is small and served locally, so load it
      // as a normal blocking stylesheet instead.
      async: false
    })
  ],
  build: {
    outDir: 'deploy/', // directory to output build files
    chunkSizeWarningLimit: 1500,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  worker: {
    format: 'es' // Enable ES module format for workers
  }
})
