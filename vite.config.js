import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "One line block puzzle",
        short_name: "One line",
        description: "One Line is a minimalist block puzzle where you draw a single, unbroken line through every block on the grid",

        theme_color: "#111827",
        background_color: "#111827",

        display: "standalone",
        start_url: "/",

        icons: [
          {
            src: "/one_line_block_puzzle",
            sizes: "80x80",
            type: "image/png",
          }
        ],
      },
    })],
})
