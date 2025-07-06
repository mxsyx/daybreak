<script setup lang="ts">
import { CDN_URL } from '@/lib/constants'
import { onMounted, ref } from 'vue'
import { handleDragStart } from '../utils'
import { Pause, Play } from 'lucide-vue-next'
import type { AudioRef } from '@/components/Audio'
import Audio from '@/components/Audio'

const props = defineProps<{
  src: string
  caption: string
  waveformUrl?: string
}>()

const waveform = ref<number[]>()
const AudioRef = ref<AudioRef>()
const isPlaying = ref<boolean>(false)

onMounted(() => {
  if (props.waveformUrl) {
    fetch(`${CDN_URL}${props.waveformUrl}`)
      .then((res) => res.json())
      .then((data) => {
        waveform.value = data
      })
  }
})
</script>

<template>
  <div
    class="flex flex-col gap-2 border rounded-lg px-3 py-2 bg-surface-1 cursor-pointer"
    draggable
    @dragstart="handleDragStart($event, 'audio', src)"
  >
    {{ caption }}
    <div class="flex-start gap-2">
      <Play
        v-if="!isPlaying"
        class="size-5 hover:fill-white"
        @click="AudioRef?.play"
      />
      <Pause v-else class="size-5 hover:fill-white" @click="AudioRef?.reset" />

      <Audio
        v-if="waveform"
        ref="AudioRef"
        :src="src"
        :waveform="waveform"
        class="grow h-10"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      ></Audio>
    </div>
  </div>
</template>
