<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Redo2, Undo2 } from 'lucide-vue-next'

import { Toaster } from '@/components/ui/sonner'
import SceneLine from '@/components/SceneLine'
import AssetsExplorer from '@/components/AssetsExplorer'
import SceneEditor from '@/components/SceneEditor'
import Menu from '@/components/Menu'
import Ruler from '@/components/Ruler'
import Timeline from '@/components/Timeline'

import pixi from './pixi'
import { useDark } from '@vueuse/core'

const container = ref<HTMLDivElement>()
onMounted(() => {
  container.value!.appendChild(pixi.canvas)
})

useDark({
  storageKey: 'color-scheme',
})
</script>

<template>
  <Menu></Menu>
  <div class="grid grid-cols-[2.2fr_6fr_2.2fr] gap-4 overflow-hidden flex-grow">
    <AssetsExplorer />
    <main
      class="grid grid-rows-[auto_1fr] gap-4 bg-surface-1 border-[1px] border-stroke p-3 rounded-xl"
    >
      <div ref="container"></div>
      <div>
        <hr class="mt-4 mb-2" />
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2 center">
            <Undo2 :size="20" class="text-foreground-5" />
            <Redo2 :size="20" class="text-foreground-5" />
          </div>

          <!-- prettier-ignore -->
          <button
            class="size-8 rounded-full bg-background-inverted text-foreground-inverted flex-center cursor-pointer pl-[3px]"
          >▶</button>

          <div>
            <Ruler />
          </div>
        </div>
      </div>

      <Timeline />
    </main>
    <SceneEditor />
  </div>
  <SceneLine />

  <Toaster />
</template>
