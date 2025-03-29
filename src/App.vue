<script setup lang="ts">
import { onMounted } from 'vue'
import { Application } from 'pixi.js'

import { Toaster } from '@/components/ui/sonner'
import Timeline from '@/components/Timeline'
import SceneEditor from '@/components/SceneEditor'
import AssetsExplorer from '@/components/AssetsExplorer'

onMounted(async () => {
  const app = new Application()
  await app.init({
    width: 960,
    height: 540,
    canvas: document.getElementById('canvas') as HTMLCanvasElement
  })
})
</script>

<template>
  <div class="w-[100vw] h-[100vh] text-white dark">
    <div class="bg-[#1e1e29] p-4">
      <div class="grid grid-cols-3 gap-10">
        <AssetsExplorer />
        <canvas id="canvas"></canvas>
        <div class="grow"></div>
      </div>
      <Timeline />
      <SceneEditor />
    </div>
  </div>
  <Toaster />
</template>
