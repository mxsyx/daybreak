<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useEditingStore } from '@/store'
import { IntervalTree } from './IntervalTree'
import { FRAME_DURATION } from '@/lib/constants'

const SLIDER_TRACKER_SIZE = 12

const intervalTree = new IntervalTree()

const editingStore = useEditingStore()
const grids = computed(() => {
  const grids = editingStore.scene?.grids ?? []
  return grids.map((grid) => ({
    ...grid,
    frameStart: grid.start / FRAME_DURATION,
    frameEnd: grid.end / FRAME_DURATION,
    elementWidth: 0,
  }))
})

const containerRef = ref<HTMLDivElement>()
const sliderRef = ref<HTMLDivElement>()
const boundaryIndicatorRef = ref<HTMLDivElement>()

const isDragging = ref<boolean>(false)

let lFrame = computed(() => editingStore.object?.interval[0] ?? -1)
let rFrame = computed(() => editingStore.object?.interval[1] ?? -1)

let pointerX = 0
let isHovering = false
let isKeydown = false

computed(() => {
  if (grids.value.length > 0) {
    return null
  }
  return null
})

let offsetLeft = 0
let containerLeft = 0
let containerWidth = 0
let currentGridIndex = 0

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

const jumpTo = (e: MouseEvent, gridIndex: number) => {
  // prettier-ignore
  let left = (e.currentTarget as HTMLDivElement).offsetLeft - SLIDER_TRACKER_SIZE / 2
  left = Math.max(left, 0)
  offsetLeft = left
  sliderRef.value!.style.left = `${left}px`
  editingStore.currentGridIndex = gridIndex
  editingStore.currentFrame = grids.value[gridIndex].frameStart
}

const setObjectIntervalStart = (
  e: MouseEvent,
  grid: (typeof grids.value)[0],
) => {
  const { object } = editingStore
  // if (isKeydown && object) {
  //   const frame = (e.clientX - containerLeft) / frameWidth
  //   editingStore.object.interval[0] = frame
  //   if (frame > object.interval[1]) {
  //     object.interval[1] = Math.min(
  //       editingStore.totalFrame,
  //       object.interval[1] + frame,
  //     )
  //   } else {
  //   }
  // }
}

const setObjectIntervalEnd = (e: MouseEvent) => {
  // e.preventDefault()
  // const frame = (e.clientX - containerLeft) / frameWidth
  // if (isKeydown && editingStore.object) {
  //   if (frame > editingStore.object.interval[0]) {
  //     editingStore.object.interval[1] = frame
  //   }
  // }
}

let pre = 0
const play = () => {
  if (!editingStore.isPlaying) {
    return
  }

  const currentFrame = ++editingStore.currentFrame
  const currentTime = currentFrame * FRAME_DURATION

  let offsetLeft = 0

  const intervals = intervalTree.findOverlapping(currentFrame)
  const currentGridId = intervals.find(
    (interval) => interval.data.type === 'grid',
  )?.data.id
  if (currentGridId) {
    currentGridIndex = parseInt(currentGridId)
  }

  const currentGrid = grids.value[currentGridIndex]

  for (let i = 0; i < currentGridIndex; i++) {
    offsetLeft += grids.value[i].elementWidth
  }

  const timeInCurrentGrid = currentTime - currentGrid.start
  const gridDuration = currentGrid.end - currentGrid.start
  const relativePosition = timeInCurrentGrid / gridDuration
  offsetLeft += relativePosition * currentGrid.elementWidth

  editingStore.currentGridIndex = currentGridIndex

  sliderRef.value!.style.left = `${offsetLeft}px`

  const percentleft = (offsetLeft % containerWidth) / containerWidth
  if (percentleft.toPrecision(2) === '0.80') {
    containerRef.value!.scrollTo({
      left: containerRef.value!.scrollLeft + containerWidth * 0.8,
      behavior: 'smooth',
    })
  }

  if (currentFrame < editingStore.totalFrame) {
    requestAnimationFrame(play)
  } else {
    editingStore.isPlaying = false
  }
}

// Set frame params.
const resetFrameParams = () => {
  const clientRect = containerRef.value!.getBoundingClientRect()
  containerLeft = clientRect.left
  containerWidth = clientRect.width

  if (grids.value.length > 0) {
    const duration = grids.value.at(-1)!.end - grids.value[0].start
    const totalFrame = duration / FRAME_DURATION
    editingStore.totalFrame = totalFrame

    grids.value.forEach((grid, index) => {
      const element = document.querySelector(`[data-grid-index="${index}"]`)
      if (element) {
        grid.elementWidth = element.clientWidth
      }
    })
  } else {
    editingStore.totalFrame = 0
  }
}

watch(
  () => editingStore.isPlaying,
  () => {
    if (editingStore.isPlaying) {
      pre = Date.now()
      resetFrameParams()
      requestAnimationFrame(play)
    }
  },
)

watch(grids, () => {
  intervalTree.clear()
  grids.value.forEach((grid, index) => {
    intervalTree.insert(grid.frameStart, grid.frameEnd, {
      type: 'grid',
      id: index.toString(),
    })
  })
})

watch(grids, resetFrameParams)

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
  const observer = new ResizeObserver(resetFrameParams)
  observer.observe(containerRef.value!)
})
</script>

<template>
  <div ref="containerRef" class="relative overflow-x-auto p-1">
    <div
      v-if="grids.length > 0"
      class="flex h-20 w-max overflow-x-visible rounded-lg border border-[#475569] bg-slate-900 font-medium"
    >
      <div
        v-for="(grid, index) in grids"
        :key="index"
        class="relative flex cursor-pointer flex-col justify-center px-3 hover:bg-[#1e293b80]"
        :data-grid-index="index"
        :draggable="!isDragging && !editingStore.isPlaying"
        @click="jumpTo($event, index)"
      >
        <span class="whitespace-nowrap">
          {{ grid.text }}
        </span>
        <span
          v-if="grid.frameStart < lFrame || grid.frameEnd > rFrame"
          class="text-muted-foreground absolute top-[2px] right-1 text-xs"
        >
          {{ grid.end / 1000 }}
        </span>
        <div
          v-if="lFrame === rFrame && index !== grids.length - 1"
          class="bg-border absolute right-0 h-full w-px"
        ></div>
      </div>
    </div>

    <!-- Object interval overlay -->
    <div
      v-if="lFrame !== -1 && rFrame !== -1"
      class="absolute top-4 bottom-4 rounded-lg border-2 bg-[#1e293b80]"
      :style="{
        // left: `${lFrame * frameWidth}px`,
        // width: `${(rFrame - lFrame) * frameWidth}px`,
      }"
    ></div>

    <!-- Slider -->
    <div
      ref="sliderRef"
      class="flex-col-center absolute bottom-1 left-0 cursor-grab"
      @pointerdown="handlePointerDown"
    >
      <div class="h-18 w-[2px] translate-y-1 rounded-xl bg-white"></div>
      <div class="triangle-rectangle"></div>
    </div>

    <!-- Boundary Indicator -->
    <div
      ref="boundaryIndicatorRef"
      class="bg-primary absolute bottom-1 -left-1 hidden h-20 w-[2px] rounded-xl"
      @click="setObjectIntervalStart"
      @contextmenu="setObjectIntervalEnd"
    ></div>
  </div>
</template>
