<script setup lang="ts">
import { Redo2, Undo2 } from 'lucide-vue-next'
import { ToggleRuler } from './Ruler'
import Timeline from './Timeline.vue'
import pixi, { eventEmitter, pixiOuter } from '@/pixi'
import { ref, onMounted, computed, watchEffect, watch } from 'vue'
import { Assets, Texture } from 'pixi.js'
import ISprite from './ISprite'
import SceneLine from '../SceneEditor/SceneLine'
import { useSceneStore, useSizeStore } from '@/store'
import { onClickOutside } from '@vueuse/core'
import type { TransferData } from '../AssetsExplorer/utils'

const containerRef = ref<HTMLDivElement>()
const canvasInited = ref<boolean>(false)

const { size } = useSizeStore()
const sceneStore = useSceneStore()
const scene = computed(() => sceneStore.scene).value

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

    const deselectAll = () => {
      eventEmitter.emit('deselect')
    }

    pixi.stage.eventMode = 'static'
    pixi.stage.hitArea = pixi.screen
    pixi.stage.on('pointerdown', deselectAll)
    onClickOutside(pixi.canvas, deselectAll)
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
  const data = JSON.parse(
    e.dataTransfer!.getData('application/json'),
  ) as TransferData

  const url = new URL(data.src)
  url.searchParams.append('t', Date.now().toString())
  const texture = await Assets.load<Texture>(url.href)
  const origRatio = texture.orig.width / texture.orig.height

  const sprite = new ISprite(texture)
  if (texture.orig.width > size.width) {
    sprite.width = size.width
    sprite.height = sprite.width / origRatio
  }
  if (texture.orig.height > size.height) {
    sprite.height = size.height
    sprite.width = sprite.height * origRatio
  }

  const { left, top, width } = pixi.canvas.getBoundingClientRect()
  const styleRatio = size.width / width
  sprite.x = (e.clientX - left) * styleRatio
  sprite.y = (e.clientY - top) * styleRatio
  sprite.x = sprite.x - sprite.width * data.pointerPercentX
  sprite.y = sprite.y - sprite.height * data.pointerPercentY

  if (scene) {
    // sceneStore.addObject({
    //   x: sprite.x,
    //   y: sprite.y,
    //   width: sprite.width,
    //   height: sprite.height,
    //   range: [0, scene.grids.length],
    //   type: AssetTypeEnum.IMAGE,
    //   src: data.src,
    // })
    console.log(1)
  }

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
    <Timeline />

    <div>
      <div class="flex-between pt-4 border-t">
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
    <SceneLine />
  </main>
</template>
