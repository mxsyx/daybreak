<script setup lang="ts">
import { onMounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement>()

const props = defineProps<{
  data: number[]
}>()

onMounted(() => {
  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#4caf50'
  const middle = canvas.height / 2

  for (let i = 0; i < props.data.length; i++) {
    const x = i * (canvas.width / props.data.length)
    const height = props.data[i] * middle
    ctx.fillRect(x, middle - height, 1, height * 2)
  }
})
</script>
<template>
  <canvas ref="canvasRef" width="1000" height="200"></canvas>
</template>
