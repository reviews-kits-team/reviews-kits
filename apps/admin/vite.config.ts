import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  clearScreen: false,
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: "0.0.0.0",
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      ignored: ["**/playwright-report/**"],
    },
  },
  optimizeDeps: {
    entries: ["index.html"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})