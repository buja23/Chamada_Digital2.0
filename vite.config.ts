import path from 'path';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    // Gera bundle de fallback com polyfills para navegadores sem suporte a ES Modules
    // Cobre: Chrome 60+, Firefox 60+, Safari 12+, Samsung Internet 12+, Edge legado
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // @ aponta para ./src
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // evita pré-bundle problemático
  },
  build: {
    // target gerenciado automaticamente pelo plugin-legacy (defaults → ~Chrome 87+, Safari 14+)
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
