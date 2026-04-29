import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss(), compression({ algorithm: 'gzip' }), compression({ algorithm: 'brotliCompress', ext: '.br' })];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}
  return {
    plugins,
    build: {
      target: 'es2015',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router': ['react-router-dom'],
            'motion': ['framer-motion'],
            'supabase': ['@supabase/supabase-js'],
          }
        }
      },
      chunkSizeWarningLimit: 600,
    }
  };
})
