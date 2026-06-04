import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // 🆕 TAMBAHKAN INI untuk fix react-is error
    dedupe: ['react', 'react-dom', 'react-is'],
  },
  optimizeDeps: {
    // 🆕 TAMBAHKAN INI untuk pre-bundle recharts dependencies
    include: ['react-is', 'recharts', 'react', 'react-dom'],
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true, // ✅ Izinkan semua host (ngrok, dll)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
})