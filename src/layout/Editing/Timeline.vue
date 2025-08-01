<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useEditingStore } from '@/store'
import { cn } from '@/lib/utils'
import { IntervalTree } from './IntervalTree'
import { FRAME_DURATION } from '@/lib/constants'

const SLIDER_TRACKER_SIZE = 12

const intervalTree = new IntervalTree()

const editingStore = useEditingStore()
const grids = computed(() => editingStore.scene?.grids ?? [])

const containerRef = ref<HTMLDivElement>()
const sliderRef = ref<HTMLDivElement>()
const boundaryIndicatorRef = ref<HTMLDivElement>()

const isDragging = ref<boolean>(false)

let lIndex = computed(() => editingStore.object?.range[0] ?? -1)
let rIndex = computed(() => editingStore.object?.range[1] ?? -1)

computed(() => {
  if (grids.value.length > 0) {
    return null
  }
  return null
})

let frameWidth = 0
let offsetLeft = 0
let containerLeft = 0
let containerWidth = 0
let now = 0

const handlePointerMove = (e: PointerEvent) => {
  if (!isDragging.value) {
    return
  }
  let left =
    e.clientX -
    containerLeft +
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
  offsetLeft += frameWidth
  editingStore.currentFrame++

  const percentleft = (offsetLeft % containerWidth) / containerWidth
  if (percentleft.toPrecision(2) === '0.80') {
    containerRef.value!.scrollTo({
      left: containerRef.value!.scrollLeft + containerWidth * 0.8,
      behavior: 'smooth',
    })
  }

  const now = editingStore.currentFrame * FRAME_DURATION
  editingStore.now = now

  const intervals = intervalTree.findOverlapping(now)
  const currentGridId = intervals.find(
    (interval) => interval.data.type === 'grid',
  )?.data.id

  if (currentGridId) {
    editingStore.currentGridId = parseInt(currentGridId)
  }

  if (editingStore.currentFrame < editingStore.totalFrame) {
    requestAnimationFrame(play)
  } else {
    editingStore.isPlaying = false
  }
}

watch(
  () => editingStore.isPlaying,
  () => {
    if (editingStore.isPlaying) {
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

let pointerX = 0
let isHovering = false
let isKeydown = false

// Set frame params.
watch(grids, () => {
  if (grids.value.length > 0) {
    const duration = grids.value.at(-1)!.end - grids.value[0].start
    const totalFrame = duration / FRAME_DURATION
    editingStore.totalFrame = totalFrame
    frameWidth = containerRef.value!.scrollWidth / totalFrame
  } else {
    editingStore.totalFrame = 0
    frameWidth = 0
  }
})

onMounted(() => {
  const handlePointerMove = (e: PointerEvent) => {
    boundaryIndicatorRef.value!.style.left = `${e.clientX - containerLeft}px`
    pointerX = e.clientX
  }

  const container = containerRef.value!

  container.addEventListener('pointerenter', () => {
    isHovering = true
    document.addEventListener('pointermove', handlePointerMove)
  })
  container.addEventListener('pointerleave', () => {
    isHovering = false
    document.removeEventListener('pointermove', handlePointerMove)
  })

  container.addEventListener('contextmenu', (e) => {
    if (isKeydown) {
      e.preventDefault()
    }
  })
  container.addEventListener('click', (e) => {
    console.log(e.currentTarget)
  })

  const handleKeyEvent = (e: KeyboardEvent) => {
    if (isHovering && e.key === 'Shift') {
      isKeydown = e.type === 'keydown'
      boundaryIndicatorRef.value!.style.display = isKeydown ? 'block' : 'none'
      boundaryIndicatorRef.value!.style.left = `${pointerX - containerLeft}px`
    }
  }

  document.addEventListener('keydown', handleKeyEvent)
  document.addEventListener('keyup', handleKeyEvent)
})

// Initial container params.
onMounted(() => {
  const clientRect = containerRef.value!.getBoundingClientRect()
  containerLeft = clientRect.left
  containerWidth = clientRect.width
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
            'cursor-pointer px-3 flex flex-col justify-center relative hover:bg-[#1e293b80]',
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

    <!-- Slider -->
    <div
      ref="sliderRef"
      class="flex-col-center absolute bottom-1 left-0 cursor-grab"
      @pointerdown="handlePointerDown"
    >
      <div class="w-[2px] h-18 bg-white rounded-xl translate-y-1"></div>
      <div class="triangle-rectangle"></div>
    </div>

    <!-- Boundary Indicator -->
    <div
      ref="boundaryIndicatorRef"
      class="absolute bottom-1 -left-1 w-[2px] h-20 bg-primary rounded-xl hidden"
      @pointerdown="handlePointerDown"
    ></div>
  </div>
</template>
