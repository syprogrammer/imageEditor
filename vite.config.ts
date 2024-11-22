import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  // server: { https: true }, // Not needed for Vite 5+
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
