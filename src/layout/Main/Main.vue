<script setup lang="ts">
import { Redo2, Undo2 } from 'lucide-vue-next'
import { ToggleRuler } from './Ruler'
import Timeline from './Timeline.vue'
import pixi, { pixiOuter } from '@/pixi'
import { ref, onMounted } from 'vue'
import { Assets } from 'pixi.js'
import ISprite from './ISprite'
import SceneLine from '../SceneEditor/SceneLine'

const containerRef = ref<HTMLDivElement>()
const canvasInited = ref<boolean>(false)

/**
 * Resizes the pixi canvas to fit the container.
 * @param {number} containerWidth - The width of the container.
 * @param {number} containerHeight - The height of the container.
 */
const handleResize = (containerWidth: number, containerHeight: number) => {
  const ratio = pixiOuter.canvas.width / pixiOuter.canvas.height
  const pixiOuterWidth = Math.floor(containerHeight * ratio)
  pixiOuter.canvas.style.height = `${containerHeight}px`
  pixiOuter.canvas.style.width = `${pixiOuterWidth}px`
  pixiOuter.canvas.style.left = `${Math.floor((containerWidth - pixiOuterWidth) / 2)}px`
  pixiOuter.canvas.style.top = `0px`
  pixiOuter.canvas.className = 'absolute '

  const pixiWidth = Math.floor(containerHeight * ratio * 0.9)
  const pixiHeight = Math.floor(containerHeight * 0.9)
  pixi.canvas.style.width = `${pixiWidth}px`
  pixi.canvas.style.height = `${pixiHeight}px`
  pixi.canvas.style.left = `${Math.floor((containerWidth - pixiWidth) / 2)}px`
  pixi.canvas.style.top = `${Math.floor((containerHeight - pixiHeight) / 2)}px`
  pixi.canvas.className = 'absolute z-10 rounded'

  if (!canvasInited.value) {
    containerRef.value!.appendChild(pixiOuter.canvas)
    containerRef.value!.appendChild(pixi.canvas)
    canvasInited.value = true
  }
}

onMounted(() => {
  const observer = new ResizeObserver(([entry]) => {
    handleResize(entry.contentRect.width, entry.contentRect.height)
  })
  observer.observe(containerRef.value!)

  window.addEventListener('resize', () => {
    const rect = containerRef.value!.getBoundingClientRect()
    handleResize(rect.width, rect.height)
  })
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
    class="flex flex-col gap-4 bg-surface-1 border border-stroke p-3 rounded-xl overflow-x-hidden"
  >
    <div
      ref="containerRef"
      class="relative grow"
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
          <ToggleRuler />
        </div>
      </div>
    </div>
    <Timeline />
    <SceneLine />
  </main>
</template>
