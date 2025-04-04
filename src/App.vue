<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { Toaster } from '@/components/ui/sonner'
import Timeline from '@/components/Timeline'
import SceneEditor from '@/components/SceneEditor'
import AssetsExplorer from '@/components/AssetsExplorer'
import ObjectEditor from './components/ObjectEditor'
import pixi from './pixi'

const container = ref<HTMLDivElement>()
onMounted(() => {
  container.value!.appendChild(pixi.canvas)
})
</script>

<template>
  <div
    class="w-[100vw] h-[100vh] text-white bg-[#1e1e29] p-4 dark grid grid-rows-[auto_max-content]"
  >
    <div class="grid grid-cols-[3fr_4fr_3fr] gap-4">
      <AssetsExplorer />
      <div class="w-full grid grid-rows-[auto_1fr]">
        <div ref="container"></div>
        <SceneEditor />
      </div>
      <ObjectEditor />
    </div>
    <Timeline />
  </div>
  <Toaster />
</template>
