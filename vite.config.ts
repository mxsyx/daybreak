import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// @ts-ignore
import vueClickToComponent from 'vue-click-to-component/vite-plugin'

export default defineConfig({
  plugins: [vue(), tailwindcss(), vueClickToComponent()],
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
