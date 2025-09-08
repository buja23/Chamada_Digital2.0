import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // @ aponta para ./src
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // evita pré-bundle problemático
  },
  build: {
    target: 'esnext',
    outDir: 'dist', // pasta de saída (Firebase Hosting lê aqui)
    sourcemap: false, // não gerar sourcemaps na produção
    rollupOptions: {
      output: {
        // separa node_modules em vendor.js
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1500, // aumenta limite de aviso de chunks grandes
  },
});
