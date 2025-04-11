<script setup lang="ts">
import { Button } from '@/components/ui/button'
import ImageExplorer from './ImageExplorer.vue'

const BUTTON_CLASS =
  'w-10 h-6 text-xs bg-alpha-5 text-foreground-1 rounded shadow-none hover:bg-alpha-10'
</script>

<template>
  <aside
    class="bg-surface-2 border-[1px] border-stroke rounded-xl overflow-auto"
  >
    <div class="flex gap-2 p-4 border-b sticky top-0 bg-surface-2">
      <Button :class="BUTTON_CLASS">背景</Button>
      <Button :class="BUTTON_CLASS">音乐</Button>
      <Button :class="BUTTON_CLASS">音效</Button>
      <Button :class="BUTTON_CLASS">图片</Button>
      <Button :class="BUTTON_CLASS">贴纸</Button>
      <Button :class="BUTTON_CLASS">视频</Button>
      <Button :class="BUTTON_CLASS">文字</Button>
    </div>
    <div class="px-4 py-2">
      <ImageExplorer />
    </div>
  </aside>
</template>
