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
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for core libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-map';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('dompurify') || id.includes('react-helmet')) {
              return 'vendor-utils';
            }
            // Other node_modules
            return 'vendor-other';
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
