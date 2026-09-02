import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import path from 'path'
import { createRequire } from 'module'

// vite-plugin-prerender is CJS-only; use createRequire for safe ESM interop.
// Only loaded at production build time to avoid Puppeteer download during dev.
let VitePluginPrerender: any = null;
let PuppeteerRenderer: any = null;
if (process.env.NODE_ENV === 'production' || process.env.PRERENDER === '1') {
  try {
    const _require = createRequire(import.meta.url);
    const prerender = _require('vite-plugin-prerender');
    VitePluginPrerender = prerender;
    PuppeteerRenderer = prerender.PuppeteerRenderer;
  } catch (_) {
    // Plugin not available — skip prerendering
  }
}

// Static routes to pre-render at build time.
// Crawlers (Facebook, Twitter, Slack, WhatsApp) fetch raw HTML — prerendering
// ensures they see correct meta tags instead of the empty index.html shell.
const PRERENDER_ROUTES = [
  '/',
  '/packages',
  '/destinations',
  '/blog',
  '/activities',
  '/attractions',
  '/hotels',
  '/group-trips',
  '/holiday-types',
  '/about-us',
  '/contact-us',
  '/visa-application',
  '/flights',
  '/search',
  '/payment-plans',
];

export default defineConfig({
  plugins: [
    react(),
    ...(VitePluginPrerender && PuppeteerRenderer
      ? [
          VitePluginPrerender({
            staticDir: path.join(__dirname, 'dist'),
            routes: PRERENDER_ROUTES,
            renderer: new PuppeteerRenderer({
              renderAfterDocumentEvent: 'render-event',
              headless: true,
            }),
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
    exclude: [],
  },
  build: {
    outDir: 'dist',
    minify: false, // Disable minification temporarily to debug
    sourcemap: true, // Enable source maps
    commonjsOptions: {
      // Handle Leaflet's CommonJS modules properly
      transformMixedEsModules: true,
      include: [/leaflet/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for core libraries
          if (id.includes('node_modules')) {
            // Keep Leaflet completely isolated - don't bundle with anything else
            if (id.includes('leaflet') && !id.includes('react-leaflet')) {
              return 'leaflet-core';
            }
            // Let Vite handle everything else
            return undefined;
          }

          // Split destination components into separate chunk
          if (id.includes('/features/destinations/components/')) {
            return 'destinations';
          }

          // Split tour/package components into separate chunk
          if (id.includes('/features/packages/') || id.includes('/components/tour/')) {
            return 'tours';
          }

          // Split admin features into separate chunk
          if (id.includes('/features/admin/')) {
            return 'admin';
          }
        },
      },
    },
    // Enable tree-shaking
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    cors: true,
    allowedHosts: ['localhost', 'dev.allboundtravel.com', 'allboundtravel.com', 'localhost:8005', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:8005',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
