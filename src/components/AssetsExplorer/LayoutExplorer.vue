<script setup lang="ts">
import { ref } from 'vue'
import LayoutItem from './LayoutItem.vue'

type Block = {
  type: string
  pl: number
  pt: number
  pr: number
  pb: number
}

type Layout = {
  type: string
  rows: number
  cols: number
  blocks: Block[]
}

// 初始化 layouts 数据
const layouts = ref<Layout[]>([])

// 生成 layouts 数据
const initLayouts = () => {
  const block: Block = {
    type: 'block',
    pl: 0,
    pt: 0,
    pr: 0,
    pb: 0,
  }
  for (let rows = 1; rows < 4; rows++) {
    for (let cols = 1; cols < 5; cols++) {
      layouts.value.push({
        type: 'layout',
        rows,
        cols,
        blocks: Array(rows * cols).fill(block),
      })
    }
  }
}

initLayouts()
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <LayoutItem
      v-for="layout in layouts"
      :key="`${layout.rows}-${layout.cols}`"
      :type="layout.type"
      :rows="layout.rows"
      :cols="layout.cols"
      :blocks="layout.blocks"
    />
  </div>
</template>
