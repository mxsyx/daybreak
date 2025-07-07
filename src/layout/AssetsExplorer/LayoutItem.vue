<script setup lang="ts">
const props = defineProps<{
  rows: number
  cols: number
}>()

const handleDragStart = (e: DragEvent) => {
  e.dataTransfer?.setData('application/json', JSON.stringify(props))
}
</script>

<template>
  <div
    class="p-1 rounded-xs border border-dashed border-transparent hover:border-white cursor-pointer"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <div
      class="grid w-24 h-24"
      :style="{
        gridTemplateRows: `repeat(${props.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${props.cols}, 1fr)`,
      }"
    >
      <div
        v-for="index in props.rows * props.cols"
        :key="index"
        class="border"
      ></div>
    </div>
    <div class="text-center mt-2">{{ `${props.rows} x ${props.cols}` }}</div>
  </div>
</template>
