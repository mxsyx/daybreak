<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Bot, Box, Folder } from 'lucide-vue-next'
import { ref } from 'vue'
import NavBtn from '@/components/NavBtn'
import { Input } from '@/components/ui/input'
import Contribution from './Contribution.vue'
import ImageExplorer from './ImageExplorer.vue'
import VideoExplorer from './VideoExplorer'
import AudioExplorer from './AudioExplorer/AudioExplorer.vue'

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

const tabs = [
  {
    label: '图片',
  },
  {
    label: '视频',
  },
  {
    label: '音乐',
  },
  {
    label: '贴纸',
  },
  {
    label: '形状',
  },
  {
    label: '音效',
  },
  {
    label: '文字',
  },
]

const activeNav = ref(0)
const activeTab = ref(0)
</script>

<template>
  <aside class="flex overflow-x-hidden shrink-0">
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
      class="bg-surface-2 border-[1px] border-stroke rounded-xl flex flex-col w-90"
    >
      <div class="p-4 pb-2">
        <div class="flex-center gap-2">
          <Input
            class="border border-gray-background-3 rounded bg-background-1 !shadow-none"
            placeholder="搜索"
          />
          <Contribution />
        </div>
        <div class="flex gap-2 border-b sticky top-0 bg-surface-2 py-2">
          <Button
            v-for="(tab, index) in tabs"
            :key="tab.label"
            class="w-10 h-6 text-xs bg-alpha-5 text-foreground-1 rounded shadow-none hover:bg-alpha-10"
            @click="activeTab = index"
          >
            {{ tab.label }}
          </Button>
        </div>
      </div>

      <div
        class="w-[700%] overflow-y-auto pb-4 grid grid-cols-7 transition-all duration-300"
        :style="{ transform: `translateX(-${(activeTab / 7) * 100}%)` }"
      >
        <ImageExplorer />
        <VideoExplorer />
        <AudioExplorer />
      </div>
    </div>
  </aside>
</template>
