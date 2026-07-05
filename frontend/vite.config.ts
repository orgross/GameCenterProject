import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Game Center',
        short_name: 'Game Center',
        description: 'Register, play 10 games, and climb the leaderboard.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0b0a17',
        theme_color: '#0b0a17',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // No custom workbox.runtimeCaching entries — the backend API lives on a
      // different origin (cross-origin fetches), so Workbox's default
      // precache-only behavior already leaves it untouched by the service
      // worker. Only the built app shell (JS/CSS/HTML) is cached, so login,
      // scores, and live game state always come straight from the network.
    }),
  ],
})
