<script setup lang="ts">
import { Button } from '@/components/ui/button'
import ImageExplorer from './ImageExplorer.vue'

const BUTTON_CLASS =
  'w-10 h-6 text-xs !bg-[#272836] text-white hover:opacity-90'
</script>

<template>
  <div class="bg-[#13131B] border-[1px] rounded-xl overflow-auto">
    <div class="flex gap-2 p-4 border-b sticky top-0 bg-[#13131B]">
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
  </div>
</template>
