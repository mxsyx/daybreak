<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Bot, Box, Folder } from 'lucide-vue-next'
import { ref } from 'vue'
import NavBtn from '@/components/NavBtn'
import VideoExplorer from './VideoExplorer'
import { Input } from '@/components/ui/input'
import Contribution from './Contribution.vue'

// prettier-ignore
const BUTTON_CLASS = 'w-10 h-6 text-xs bg-alpha-5 text-foreground-1 rounded shadow-none hover:bg-alpha-10'

const navs = [
  {
    label: '您的媒体',
    icon: Folder,
  },
  {
    label: '内容库',
    icon: Box,
  },
  {
    label: 'ChatGPT',
    icon: Bot,
  },
]

const activeNav = ref(0)
</script>

<template>
  <aside class="flex">
    <nav class="flex flex-col px-2 gap-1">
      <NavBtn
        v-for="nav in navs"
        :key="nav.label"
        :active="activeNav === navs.indexOf(nav)"
        :icon="nav.icon"
        :label="nav.label"
        position="left"
        @click="activeNav = navs.indexOf(nav)"
      />
    </nav>
    <div
      class="bg-surface-2 border-[1px] border-stroke rounded-xl overflow-auto"
    >
      <div class="p-4">
        <div class="flex-center gap-2">
          <Input
            class="border border-gray-background-3 rounded bg-background-1 !shadow-none"
            placeholder="搜索"
          />
          <Contribution />
        </div>
        <div class="flex gap-2 border-b sticky top-0 bg-surface-2 py-2">
          <Button :class="BUTTON_CLASS">图片</Button>
          <Button :class="BUTTON_CLASS">贴纸</Button>
          <Button :class="BUTTON_CLASS">形状</Button>
          <Button :class="BUTTON_CLASS">视频</Button>
          <Button :class="BUTTON_CLASS">音乐</Button>
          <Button :class="BUTTON_CLASS">音效</Button>
          <Button :class="BUTTON_CLASS">文字</Button>
        </div>
      </div>

      <div class="px-4 py-2">
        <VideoExplorer />
      </div>
    </div>
  </aside>
</template>
