import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Vite plugin to ensure Vercel and Netlify SPA routing rewrite rules are always generated and updated
function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-generator',
    buildStart() {
      try {
        // Generate root vercel.json
        const vercelPath = path.resolve(__dirname, 'vercel.json')
        const vercelConfig = {
          rewrites: [
            {
              source: '/(.*)',
              destination: '/index.html'
            }
          ]
        }
        fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2) + '\n', 'utf8')

        // Generate public/_redirects for Netlify / Cloudflare
        const publicDir = path.resolve(__dirname, 'public')
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true })
        }
        fs.writeFileSync(path.resolve(publicDir, '_redirects'), '/*    /index.html   200\n', 'utf8')
      } catch (err) {
        console.warn('Could not generate SPA redirect files automatically:', err)
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  server: {
    port: 5173,
    open: false
  }
})

