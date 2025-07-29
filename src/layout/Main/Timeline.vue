<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEditingStore } from '@/store'
import { cn } from '@/lib/utils'
import { IntervalTree } from './IntervalTree'

const SLIDER_TRACKER_SIZE = 12
const FRAME_DURATION = 1000 / 60

const intervalTree = new IntervalTree()

const editingStore = useEditingStore()
const grids = computed(() => editingStore.scene?.grids ?? [])

const containerRef = ref<HTMLDivElement>()
const sliderRef = ref<HTMLDivElement>()
const isDragging = ref<boolean>(false)

let lIndex = computed(() => editingStore.object?.range[0] ?? -1)
let rIndex = computed(() => editingStore.object?.range[1] ?? -1)

let totalFrame = 0
let currentFrame = 0
let now = 0
let stepWidth = 0
let offsetLeft = 0
let containerWidth = 0

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
  if (editingStore.isPlaying) {
    return
  }
  isDragging.value = true
  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerup', handlePointerUp)
  sliderRef.value!.style.cursor = 'grabbing'
}

const handleJumpTo = (e: MouseEvent, gridIndex: number) => {
  let left =
    (e.currentTarget as HTMLDivElement).offsetLeft - SLIDER_TRACKER_SIZE / 2
  left = Math.max(left, 0)
  offsetLeft = left
  sliderRef.value!.style.left = `${left}px`
  editingStore.currentGridId = gridIndex
}

const play = () => {
  if (!editingStore.isPlaying) {
    return
  }

  sliderRef.value!.style.left = `${offsetLeft}px`
  offsetLeft += stepWidth
  currentFrame++

  const percentleft = (offsetLeft % containerWidth) / containerWidth
  if (percentleft.toPrecision(2) === '0.80') {
    containerRef.value!.scrollTo({
      left: containerRef.value!.scrollLeft + containerWidth * 0.8,
      behavior: 'smooth',
    })
  }

  const now = currentFrame * FRAME_DURATION
  console.log(now)

  const intervals = intervalTree.findOverlapping(now)
  const currentGridId = intervals.find(
    (interval) => interval.data.type === 'grid',
  )?.data.id

  if (currentGridId) {
    editingStore.currentGridId = parseInt(currentGridId)
  }

  if (currentFrame < totalFrame) {
    requestAnimationFrame(play)
  } else {
    editingStore.isPlaying = false
  }
}

watch(
  () => editingStore.isPlaying,
  () => {
    if (editingStore.isPlaying) {
      const duration = grids.value.at(-1)!.end - grids.value[0].start

      totalFrame = duration / FRAME_DURATION
      console.log(totalFrame)

      stepWidth = containerRef.value!.scrollWidth / totalFrame
      containerWidth = containerRef.value!.clientWidth
      if (!now) {
        now = Date.now()
      }
      requestAnimationFrame(play)
    }
  },
)

watch(grids, () => {
  intervalTree.clear()
  grids.value.forEach((grid, index) => {
    intervalTree.insert(grid.start, grid.end, {
      type: 'grid',
      id: index.toString(),
    })
  })
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
        :draggable="!isDragging && !editingStore.isPlaying"
        @click="handleJumpTo($event, index)"
      >
        <span class="whitespace-nowrap">
          {{ grid.text }}
        </span>
        <span
          v-if="index < lIndex || index > rIndex"
          class="absolute top-[2px] right-1 text-xs text-muted-foreground"
        >
          {{ grid.start / 1000 }}
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
