<script setup lang="ts">
import { ref, onMounted } from 'vue'
import clsx from 'clsx'
import data from '@/test/data.json'
import { useEditingStore } from '@/store'

const editingStore = useEditingStore()

const grids = ref<TextGrid[]>(
  data.tiers.words.entries.map((grid) => ({
    type: 'grid',
    start: grid[0] as number,
    end: grid[1] as number,
    text: grid[2] as string,
  })),
)

const startGridIndex = ref<number>()
const boxes = ref<(TextGrid | Scene)[]>(grids.value)
const activeScene = ref<Scene>()

// 初始化数据
onMounted(async () => {
  if (import.meta.env.MODE === 'development') {
    const { default: boxesData } = await import('@/test/boxes.json')
    boxesData.forEach((box) => {
      const { grids } = box
      grids.forEach((grid) => {
        grid.start = grid.start * 1000
        grid.end = grid.end * 1000
      })

      grids[0].start = 0
      for (let i = 0; i < grids.length - 1; i++) {
        const grid = grids[i]
        const nextGrid = grids[i + 1]
        if (nextGrid) {
          grid.end = nextGrid.start
        }
      }
    })

    boxes.value = boxesData as Scene[]
    editingStore.scenes = boxesData as Scene[]
    editingStore.scene = boxesData[0] as Scene
    activeScene.value = boxesData[0] as Scene
  }
})

// 处理点击事件
const handleClick = (box: TextGrid | Scene, index: number) => {
  if (box.type === 'grid') {
    if (startGridIndex.value === undefined) {
      startGridIndex.value = index
    } else {
      // 跨场景选择
      const selectedGrids = boxes.value
        .slice(startGridIndex.value, index + 1)
        .map((box) => (box.type === 'grid' ? box : box.grids))
        .flat()
      const newScene: Scene = {
        type: 'scene',
        grids: selectedGrids,
        objects: [],
      }
      boxes.value.splice(
        startGridIndex.value,
        index - startGridIndex.value + 1,
        newScene,
      )
      startGridIndex.value = undefined
    }
  } else {
    // @ts-ignore
    editingStore.scene = box
    activeScene.value = box
  }
}
</script>

<template>
  <div
    class="bg-surface-1 text-foreground-1 flex flex-nowrap overflow-x-auto rounded-xl pb-2"
  >
    <div
      v-for="(box, index) in boxes"
      :key="index"
      :title="`点击选择${startGridIndex !== undefined ? '结束' : '开始'}位置`"
      :class="
        clsx(
          'h-12 w-18 shrink-0 cursor-pointer border border-dashed px-2 py-1 text-base',
          {
            'hover:bg-[#892fff] hover:text-white': box.type === 'grid',
            'bg-[#892fff]': startGridIndex === index,
            'bg-surface-2 text-foreground-1 mx-1 rounded-[4px] !border-solid':
              box.type === 'scene',
            '!bg-[#892fff] text-white': box === activeScene,
          },
        )
      "
    ></div>
  </div>
</template>
