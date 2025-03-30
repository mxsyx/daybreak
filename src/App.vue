<script setup lang="ts">
import { onMounted } from 'vue'
import { Application, Graphics } from 'pixi.js'
import { initDevtools } from '@pixi/devtools'

import { Toaster } from '@/components/ui/sonner'
import Timeline from '@/components/Timeline'
import SceneEditor from '@/components/SceneEditor'
import AssetsExplorer from '@/components/AssetsExplorer'
import ObjectEditor from './components/ObjectEditor/ObjectEditor.vue'

onMounted(async () => {
  const app = new Application()
  await app.init({
    width: 1920,
    height: 1080,
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
  })
  initDevtools({ app })

  function createGridWithAxes(width: number, height: number, cellSize: number) {
    const grid = new Graphics()

    grid.setStrokeStyle({ width: 1, color: 0xffffff })
    for (let x = cellSize; x < width; x += cellSize) {
      grid.moveTo(x, 0).lineTo(x, height).stroke()
    }
    for (let y = cellSize; y < height; y += cellSize) {
      grid.moveTo(0, y).lineTo(width, y).stroke()
    }

    return grid
  }

  const gridWithAxes = createGridWithAxes(
    app.screen.width,
    app.screen.height,
    60
  )
  app.stage.addChild(gridWithAxes)
})
</script>

<template>
  <div
    class="w-[100vw] h-[100vh] text-white bg-[#1e1e29] p-4 dark grid grid-rows-[auto_max-content]"
  >
    <div class="grid grid-cols-[3fr_4fr_3fr] gap-4">
      <AssetsExplorer />
      <div class="w-full grid grid-rows-[auto_1fr]">
        <canvas id="canvas" class="w-full"></canvas>
        <SceneEditor />
      </div>
      <ObjectEditor />
    </div>
    <Timeline />
  </div>
  <Toaster />
</template>
