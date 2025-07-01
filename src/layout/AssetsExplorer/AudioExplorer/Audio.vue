<script setup lang="ts">
import { CDN_URL } from '@/lib/constants'
import { computed, ref } from 'vue'
import { handleDragStart } from '../utils'
import { Play, PlayCircle } from 'lucide-vue-next'
import { Slider } from '@/components/ui/slider'

const props = defineProps<{
  src: string
  caption: string
}>()

const currentTime = ref([33])

const { src, duration } = computed(() => {
  const src = `${CDN_URL}${props.src}`
  const duration = new URL(src).searchParams.get('duration')
  return { src, duration: parseFloat(duration ?? '0') }
}).value
</script>

<template>
  <!-- TODO Spectrum -->
  <div
    class="flex flex-col gap-2 border rounded-lg px-3 py-2 bg-surface-1 cursor-pointer"
    draggable
    @dragstart="handleDragStart($event, 'audio', src)"
  >
    {{ caption }}
    <div class="flex-start">
      <Play class="size-5 hover:fill-white" />
    </div>
  </div>
</template>
