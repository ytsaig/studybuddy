import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/studybuddy/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-512.png'],
      manifest: {
        name: 'Studybuddy',
        short_name: 'Studybuddy',
        description: 'Flashcard study app',
        display: 'standalone',
        background_color: '#fafafa',
        theme_color: '#fafafa',
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,ico,woff,woff2}'],
      },
    }),
  ],
});
