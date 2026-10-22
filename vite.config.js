import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Hosts the app is allowed to talk to. Keep in sync with vercel.json.
 */
const API_HOSTS = [
  'https://api.open-meteo.com',
  'https://geocoding-api.open-meteo.com',
  'https://air-quality-api.open-meteo.com',
  'https://api.bigdatacloud.net',
  'https://api-bdc.io',
  'https://api-bdc.net',
];

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${API_HOSTS.join(' ')}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

/** Inject the CSP <meta> only into production HTML (dev needs inline HMR scripts). */
function cspMetaPlugin() {
  return {
    name: 'csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
            injectTo: 'head-prepend',
          },
        ],
      };
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    cspMetaPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registered from src/main.jsx (no inline script → CSP friendly)
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Weather',
        short_name: 'Weather',
        description: 'Fast, private weather: 16-day forecast, hourly charts, air quality and UV for any place on Earth.',
        theme_color: '#0b1220',
        background_color: '#0b1220',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['weather', 'utilities'],
        icons: [
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.endsWith('open-meteo.com'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 40, maxAgeSeconds: 3 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => /bigdatacloud\.net$|api-bdc\.(io|net)$/.test(url.hostname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'reverse-geocode',
              expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    sourcemap: false,
    target: 'es2022',
    rollupOptions: {
      output: {
        // Function form works with both Rollup (Vite ≤7) and Rolldown (Vite 8+).
        manualChunks(id) {
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          if (id.includes('node_modules/@tanstack/')) return 'query';
          if (/node_modules[\\/]zod[\\/]/.test(id)) return 'zod';
          return undefined;
        },
      },
    },
  },
});
