<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEditingStore } from '@/store'
import { cn } from '@/lib/utils'

const SLIDER_TRACKER_SIZE = 12

const editingStore = useEditingStore()
const grids = computed(() => editingStore.scene?.grids ?? [])

const containerRef = ref<HTMLDivElement>()
const sliderRef = ref<HTMLDivElement>()
const isDragging = ref<boolean>(false)

let lIndex = computed(() => editingStore.object?.range[0] ?? -1)
let rIndex = computed(() => editingStore.object?.range[1] ?? -1)

const handlePointerMove = (e: PointerEvent) => {
  if (!isDragging.value) {
    return
  }
  let left =
    e.clientX -
    containerRef.value!.getBoundingClientRect().left +
    containerRef.value!.scrollLeft -
    SLIDER_TRACKER_SIZE / 2
  left = Math.min(
    Math.max(left, 0),
    containerRef.value!.scrollWidth - SLIDER_TRACKER_SIZE,
  )
  sliderRef.value!.style.left = `${left}px`
}

const handlePointerUp = () => {
  isDragging.value = false
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerup', handlePointerUp)
  sliderRef.value!.style.cursor = 'grab'
}

const handlePointerDown = () => {
  isDragging.value = true
  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerup', handlePointerUp)
  sliderRef.value!.style.cursor = 'grabbing'
}

const handleJumpTo = (e: MouseEvent) => {
  let left =
    (e.currentTarget as HTMLDivElement).offsetLeft - SLIDER_TRACKER_SIZE / 2
  left = Math.max(left, 0)
  sliderRef.value!.style.left = `${left}px`
}

let isPlaying = false
let totalFrame = 0
let currentFrame = 0
let now = 0
let stepWidth = 0
let offsetLeft = 0

const play = () => {
  if (!isPlaying) {
    return
  }

  sliderRef.value!.style.left = `${offsetLeft}px`
  offsetLeft += stepWidth
  currentFrame++

  if (currentFrame < totalFrame) {
    requestAnimationFrame(play)
  }
}

onMounted(() => {
  setTimeout(() => {
    const duration = grids.value.at(-1)!.end - grids.value[0].start
    totalFrame = duration * 60
    stepWidth = containerRef.value!.scrollWidth / totalFrame
    isPlaying = true
    now = Date.now()

    requestAnimationFrame(play)
  }, 1500)
})
</script>

<template>
  <div ref="containerRef" class="p-1 overflow-x-auto relative">
    <div
      v-if="grids.length > 0"
      class="border border-[#475569] bg-slate-900 rounded-lg h-20 w-max flex font-medium overflow-x-visible"
    >
      <div
        v-for="(grid, index) in grids"
        :key="index"
        :class="
          cn(
            'cursor-pointer px-3 flex flex-col justify-center relative hover:bg-[#1e293b80] select-none',
            index >= lIndex &&
              index <= rIndex &&
              'border-y-2 my-2 bg-[#1e293b80]',
            index === lIndex && 'border-l-2 rounded-l-lg',
            index === rIndex && 'border-r-2 rounded-r-lg',
          )
        "
        :draggable="!isDragging"
        @click="handleJumpTo($event)"
      >
        <span class="whitespace-nowrap">
          {{ grid.text }}
        </span>
        <span
          v-if="index < lIndex || index > rIndex"
          class="absolute top-[2px] right-1 text-xs text-muted-foreground"
        >
          {{ grid.start }}
        </span>
        <div
          v-if="lIndex === rIndex && index !== grids.length - 1"
          class="absolute w-px h-full right-0 bg-border"
        ></div>
      </div>
    </div>
    <div
      ref="sliderRef"
      class="flex-col-center absolute bottom-1 left-0 cursor-grab"
      @pointerdown="handlePointerDown"
    >
      <div class="w-[2px] h-18 bg-white rounded-xl translate-y-1"></div>
      <div class="triangle-rectangle"></div>
    </div>
  </div>
</template>
