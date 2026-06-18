import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Optimize for PWA
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Minify and optimize
    minify: 'terser',
    sourcemap: false,
    
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunk
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            'axios'
          ],
          // Split large dependencies
          'utils': [
            'html2pdf.js',
            'xlsx'
          ]
        }
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // CommonJS support for better compatibility
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  
  // Define environment variables for PWA
  define: {
    'process.env.VITE_PWA_ENABLED': JSON.stringify(true),
  }
})
