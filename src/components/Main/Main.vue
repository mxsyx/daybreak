<script setup lang="ts">
import { Redo2, Undo2 } from 'lucide-vue-next'
import Ruler from './Ruler'
import Timeline from './Timeline.vue'
import pixi from '@/pixi'
import { ref, onMounted } from 'vue'
import { Assets } from 'pixi.js'
import { ISprite } from './ISprite'

const container = ref<HTMLDivElement>()
onMounted(() => {
  container.value!.appendChild(pixi.canvas)
})

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  const data = JSON.parse(e.dataTransfer!.getData('application/json'))
  const texture = await Assets.load(`${data.src}?v=1`)

  const sprite = new ISprite(texture)
  sprite.width = 360
  sprite.height = 360
  sprite.x = 960
  sprite.y = 120

  pixi.stage.addChild(sprite)
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}
</script>

<template>
  <main
    class="grid grid-rows-[auto_1fr] gap-4 bg-surface-1 border-[1px] border-stroke p-3 rounded-xl"
  >
    <div
      ref="container"
      @dragover="handleDragOver($event)"
      @drop="handleDrop($event)"
    ></div>
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
</template>
