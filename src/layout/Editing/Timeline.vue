<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useEditingStore } from '@/store'
import { IntervalTree } from './IntervalTree'
import { FRAME_DURATION } from '@/lib/constants'

const SLIDER_TRACKER_SIZE = 12

const intervalTree = new IntervalTree()

const containerRef = ref<HTMLDivElement>()
const sliderRef = ref<HTMLDivElement>()
const boundaryIndicatorRef = ref<HTMLDivElement>()

const editingStore = useEditingStore()

const isDragging = ref<boolean>(false)

let pointerX = 0
let isHovering = false
let isShiftKeydown = false
let containerLeft = 0
let containerWidth = 0
let prevLeftClickTime = 0
let prevRightClickTime = 0

const grids = computed(() => {
  const grids = editingStore.scene?.grids ?? []
  return grids.map((grid) => ({
    ...grid,
    frameStart: grid.start / FRAME_DURATION,
    frameEnd: grid.end / FRAME_DURATION,
    elementWidth: 0,
  }))
})

const intervalPosition = computed(() => {
  const interval = editingStore.object?.interval
  if (interval) {
    const { left: startLeft } = getPositionByFrame(interval[0])
    const { left: endLeft } = getPositionByFrame(interval[1])

    return { left: startLeft, width: endLeft - startLeft }
  }

  return null
})

const findIntervalByFrame = (frame: number) => {
  const intervals = intervalTree.findOverlapping(frame).reverse()
  return intervals.find((interval) => interval.data.type === 'grid')
}

const getPositionByGridIndex = (gridIndex: number) => {
  let left = 0

  const element = document.querySelector(`[data-grid-index="${gridIndex}"]`)
  if (element) {
    const rect = element.getBoundingClientRect()
    left = rect.left - containerLeft + containerRef.value!.scrollLeft
  }

  return left
}

const getPositionByFrame = (frame: number) => {
  let left = 0
  let gridIndex = 0

  const interval = findIntervalByFrame(frame)

  if (interval) {
    gridIndex = parseInt(interval.data.id)

    const grid = grids.value[gridIndex]
    const currentTime = frame * FRAME_DURATION
    const timeInCurrentGrid = currentTime - grid.start
    const gridDuration = grid.end - grid.start

    left += getPositionByGridIndex(gridIndex)
    left += (timeInCurrentGrid / gridDuration) * grid.elementWidth
  }

  return { left, gridIndex }
}

const getFrameByMouseEvent = (e: MouseEvent) => {
  const clientLeft = e.clientX - containerLeft + containerRef.value!.scrollLeft
  let left = 0
  let gridIndex = -1

  while (gridIndex < grids.value.length - 1) {
    const grid = grids.value[++gridIndex]
    if (left + grid.elementWidth > clientLeft) {
      break
    }
    left += grid.elementWidth
  }
  left = getPositionByGridIndex(gridIndex)

  const grid = grids.value[gridIndex]
  const percent = (clientLeft - left) / grid.elementWidth
  const framesInCurrentGrid = percent * (grid.frameEnd - grid.frameStart)
  const frame = grid.frameStart + framesInCurrentGrid

  return frame
}

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
  sliderRef.value!.style.left = `${left}px`
  editingStore.currentGridIndex = gridIndex
  editingStore.currentFrame = grids.value[gridIndex].frameStart
}

const setObjectIntervalStart = (e: MouseEvent) => {
  const { object } = editingStore

  if (isShiftKeydown && object) {
    let frame = getFrameByMouseEvent(e)

    if (Date.now() - prevLeftClickTime < 200) {
      const interval = findIntervalByFrame(frame)
      if (interval) {
        frame = interval.start
      }
    }

    if (frame > object.interval[1]) {
      object.interval[1] = Math.min(
        editingStore.totalFrame,
        object.interval[1] - object.interval[0] + frame,
      )
    }

    object.interval[0] = frame
  }

  prevLeftClickTime = Date.now()
}

const setObjectIntervalEnd = (e: MouseEvent) => {
  e.preventDefault()
  const { object } = editingStore

  if (isShiftKeydown && object) {
    let frame = getFrameByMouseEvent(e)

    if (Date.now() - prevRightClickTime < 200) {
      const interval = findIntervalByFrame(frame)
      if (interval) {
        frame = interval.end
      }
    }

    if (frame < object.interval[0]) {
      object.interval[0] = Math.max(
        0,
        frame - (object.interval[1] - object.interval[0]),
      )
    }

    object.interval[1] = frame
  }

  prevRightClickTime = Date.now()
}

const play = () => {
  if (!editingStore.isPlaying) {
    return
  }

  const currentFrame = ++editingStore.currentFrame
  const { left, gridIndex: currentGridIndex } = getPositionByFrame(currentFrame)

  editingStore.currentGridIndex = currentGridIndex

  sliderRef.value!.style.left = `${left}px`

  const percentleft = (left % containerWidth) / containerWidth
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
        const rect = element.getBoundingClientRect()
        grid.elementWidth = rect.width
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
  resetFrameParams()
})

onMounted(() => {
  const container = containerRef.value!

  const handlePointerMove = (e: PointerEvent) => {
    const left = e.clientX - containerLeft + container.scrollLeft
    boundaryIndicatorRef.value!.style.left = `${left}px`
    pointerX = e.clientX
  }

  container.addEventListener('pointerenter', () => {
    isHovering = true
    document.addEventListener('pointermove', handlePointerMove)
  })
  container.addEventListener('pointerleave', () => {
    isHovering = false
    document.removeEventListener('pointermove', handlePointerMove)
  })

  container.addEventListener('contextmenu', (e) => {
    if (isShiftKeydown) {
      e.preventDefault()
    }
  })

  const handleKeyEvent = (e: KeyboardEvent) => {
    if (isHovering && e.key === 'Shift') {
      isShiftKeydown = e.type === 'keydown'
      const boundaryIndicator = boundaryIndicatorRef.value!
      boundaryIndicator.style.display = isShiftKeydown ? 'block' : 'none'
      boundaryIndicator.style.left = `${pointerX - containerLeft + container.scrollLeft}px`
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
      class="flex h-20 w-max overflow-x-visible rounded-lg border border-slate-600 bg-slate-900 font-medium"
    >
      <div
        v-for="(grid, index) in grids"
        :key="index"
        class="hover:bg-slate-8008/50 relative flex cursor-pointer flex-col justify-center px-3"
        :data-grid-index="index"
        @click="jumpTo($event, index)"
      >
        <span class="whitespace-nowrap">
          {{ grid.text }}
        </span>
        <span class="text-muted-foreground absolute top-[2px] right-1 text-xs">
          {{ grid.end / 1000 }}
        </span>
        <div
          v-if="index !== grids.length - 1"
          class="bg-border absolute right-0 h-full w-px"
        ></div>
      </div>
    </div>

    <!-- Object interval overlay -->
    <div
      v-if="intervalPosition"
      class="absolute top-6 bottom-6 rounded-lg border-2 border-slate-500 bg-slate-700/50"
      :style="{
        left: `${intervalPosition.left}px`,
        width: `${intervalPosition.width}px`,
      }"
    ></div>

    <!-- Boundary Indicator -->
    <div
      ref="boundaryIndicatorRef"
      class="bg-primary absolute bottom-1 -left-1 hidden h-20 w-[2px] cursor-pointer rounded-xl"
      @click="setObjectIntervalStart"
      @contextmenu="setObjectIntervalEnd"
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
  </div>
</template>
