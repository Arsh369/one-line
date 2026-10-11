import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "My MERN App",
        short_name: "My App",
        description: "My Progressive Web App",

        theme_color: "#111827",
        background_color: "#111827",

        display: "standalone",
        start_url: "/",

        icons: [
          {
            src: "/pwa-80.png",
            sizes: "80x80",
            type: "image/png",
          },
          {
            src: "/pwa-80-1.png",
            sizes: "80x80",
            type: "image/png",
          },
        ],
      },
    })],
})
