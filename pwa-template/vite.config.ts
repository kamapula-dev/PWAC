import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: manifest as ManifestOptions,
    }),
  ],
});
