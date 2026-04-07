import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
      },
      '/api/foursquare': {
        target: 'https://api.foursquare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/foursquare/, ''),
      },
      '/api/tavily': {
        target: 'https://api.tavily.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tavily/, ''),
      },
    },
  },
})
