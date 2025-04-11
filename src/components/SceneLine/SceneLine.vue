<script setup lang="ts">
import { ref, onMounted } from 'vue'
import clsx from 'clsx'
import data from '@/test/data.json'
import { useSceneStore } from '@/store'

// 定义类型
type TextGrid = {
  type: 'grid'
  start: number
  end: number
  text: string
}

type Scene = {
  type: 'scene'
  text: string
  grids: TextGrid[]
  layout: {
    rows: number
    cols: number
    blocks: Array<{ pl: number; pt: number; pr: number; pb: number }>
  }
}

// 使用 Pinia store
const sceneStore = useSceneStore()

// 状态
const grids = ref<TextGrid[]>(
  data.tiers.words.entries.map((grid) => ({
    type: 'grid',
    start: grid[0] as number,
    end: grid[1] as number,
    text: grid[2] as string,
  }))
)
const startGridIndex = ref<number>()
const boxes = ref<(TextGrid | Scene)[]>(grids.value)
const activeScene = ref<Scene>()

// 初始化数据
onMounted(async () => {
  if (import.meta.env.MODE === 'development') {
    const { default: boxesData } = (await import('@/test/boxes.json')) as {
      default: (TextGrid | Scene)[]
    }
    boxes.value = boxesData
    // @ts-ignore
    sceneStore.scene = boxesData[0] as Scene
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
        text: selectedGrids.map((grid) => grid.text).join(''),
        grids: selectedGrids,
        layout: {
          rows: 1,
          cols: 1,
          blocks: [{ pl: 0, pt: 0, pr: 0, pb: 0 }],
        },
      }
      boxes.value.splice(
        startGridIndex.value,
        index - startGridIndex.value + 1,
        newScene
      )
      startGridIndex.value = undefined
    }
  } else {
    // @ts-ignore
    sceneStore.scene = box
    activeScene.value = box
  }
}
</script>

<template>
  <footer
    class="bg-surface-1 border-[1px] border-stroke p-3 rounded-xl overflow-x-scroll"
  >
    <div class="text-foreground-1 flex flex-nowrap">
      <span
        v-for="(box, index) in boxes"
        :key="index"
        :title="`点击选择${startGridIndex !== undefined ? '结束' : '开始'}位置`"
        :class="
          clsx(
            'inline-block whitespace-nowrap cursor-pointer px-2 py-1 border border-dashed',
            {
              'hover:bg-[#892fff] hover:text-white': box.type === 'grid',
              'bg-[#892fff]': startGridIndex === index,
              'mx-1 rounded-[4px] bg-surface-2 !border-solid text-foreground-1':
                box.type === 'scene',
              '!bg-[#892fff] text-white': box === activeScene,
            }
          )
        "
        @click="handleClick(box, index)"
      >
        {{ box.text }}
      </span>
    </div>
  </footer>
</template>
