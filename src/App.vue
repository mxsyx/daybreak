<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { PlayCircle, Redo2, Undo2 } from 'lucide-vue-next'

import { Toaster } from '@/components/ui/sonner'
import SceneLine from '@/components/SceneLine'
import AssetsExplorer from '@/components/AssetsExplorer'
import SceneEditor from '@/components/SceneEditor'
import Menu from '@/components/Menu'
import Ruler from '@/components/Ruler'
import Timeline from '@/components/Timeline'

import pixi from './pixi'

const container = ref<HTMLDivElement>()
onMounted(() => {
  container.value!.appendChild(pixi.canvas)
})
</script>

<template>
  <Menu></Menu>
  <div class="grid grid-cols-[2fr_6fr_2fr] gap-4 overflow-hidden">
    <AssetsExplorer />
    <main
      class="grid grid-rows-[auto_1fr] gap-4 bg-surface-1 border-[1px] border-stroke p-3 rounded-xl"
    >
      <div ref="container"></div>
      <hr class="mt-4 mb-1" />
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 center">
          <Undo2 :size="20" class="text-foreground-5" />
          <Redo2 :size="20" class="text-foreground-5" />
        </div>
        <PlayCircle :size="20" />
        <div>
          <Ruler />
        </div>
      </div>
      <Timeline />
    </main>
    <SceneEditor />
  </div>
  <SceneLine />

  <Toaster />
</template>
