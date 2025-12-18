import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
    allowedHosts: ['localhost', 'dev.allboundtravel.com', 'allboundtravel.com'],
    proxy: {
      '/api': {
        target: 'http://localhost:8005',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
