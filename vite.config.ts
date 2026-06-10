import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(async () => {
  const plugins: any[] = [react(), tailwindcss()]
  try {
    const m = await import('./.vite-source-tags.js' as any)
    plugins.push(m.sourceTags())
  } catch {}

  return {
    plugins,
    build: {
      target: 'es2020' as const,
      sourcemap: false,
      cssCodeSplit: true,
      minify: 'esbuild' as const,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor'
            }
            if (id.includes('node_modules/@supabase/')) {
              return 'supabase'
            }
            if (id.includes('node_modules/framer-motion/')) {
              return 'motion'
            }
            if (id.includes('node_modules/')) {
              return 'vendor'
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        }
      },
      chunkSizeWarningLimit: 500,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@supabase/supabase-js'],
    },
  }
})
