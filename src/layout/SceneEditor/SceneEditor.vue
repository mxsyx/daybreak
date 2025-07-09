<script setup lang="ts">
import { Layers, Music, AudioLines, Image } from 'lucide-vue-next'
import { Tabs } from '@/components/ui/tabs'
import { ref } from 'vue'
import NavBtn from '@/components/NavBtn'

const navs = [
  {
    label: '图片',
    icon: Image,
  },
  {
    label: '背景',
    icon: Layers,
  },
  {
    label: '音乐',
    icon: Music,
  },
  {
    label: '音效',
    icon: AudioLines,
  },
]

const activeNav = ref(0)
</script>

<template>
  <Tabs default-value="account" as="aside" class="flex flex-row">
    <div
      class="bg-surface-2 rounded-xl border-[1px] border-stroke overflow-auto flex-grow"
    ></div>
    <nav class="flex flex-col px-2 gap-1">
      <NavBtn
        v-for="nav in navs"
        :key="nav.label"
        :active="activeNav === navs.indexOf(nav)"
        :icon="nav.icon"
        :label="nav.label"
        position="right"
        @click="activeNav = navs.indexOf(nav)"
      />
    </nav>
  </Tabs>
</template>
