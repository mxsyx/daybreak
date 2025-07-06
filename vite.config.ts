import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import { defineConfig } from 'vite'

// @ts-ignore
import vueClickToComponent from 'vue-click-to-component/vite-plugin'

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue(), vueClickToComponent()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['@jsquash/webp', 'jieba-wasm', '@ffmpeg/ffmpeg'],
  },
})
