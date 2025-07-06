<script setup lang="ts">
import { CDN_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { computed, onMounted, ref } from 'vue'
import type { AudioRef } from './types'

const audioRef = ref<HTMLAudioElement>()
const canvasRef = ref<HTMLCanvasElement>()
const isPlaying = ref<boolean>(false)

const props = defineProps<{
  src: string
  waveform: number[]
  class?: string
}>()

const emit = defineEmits<{
  play: []
  pause: []
}>()

const { src, duration } = computed(() => {
  let src = props.src

  if (src.startsWith('/')) {
    src = `${CDN_URL}${src}`
  }

  const url = new URL(src)
  const duration = url.searchParams.get('duration')
  url.search = ''

  return { src: url.href, duration: parseFloat(duration ?? '1') }
}).value

const draw = () => {
  if (!audioRef.value || !canvasRef.value) {
    return
  }

  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const middle = canvas.height / 2

  const percent = audioRef.value.currentTime / duration
  const percentX = canvas.width * percent

  for (let i = 0; i < props.waveform.length; i++) {
    if (isPlaying.value && i < percentX) {
      ctx.fillStyle = 'white'
    } else {
      ctx.fillStyle = '#4b4b54'
    }
    const height = props.waveform[i] * middle
    ctx.fillRect(i, middle - height, 1, height * 2)
  }

  if (isPlaying.value) {
    requestAnimationFrame(draw)
  }
}

const play = () => {
  audioRef.value?.play().then(() => {
    requestAnimationFrame(draw)
    isPlaying.value = true
    emit('play')
  })
}

const pause = () => {
  audioRef.value?.pause()
  isPlaying.value = false
  emit('pause')
}

const reset = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = 0
    pause()
  }
}

defineExpose<AudioRef>({
  play,
  pause,
  reset,
})

const changeCurrentTime = (e: MouseEvent) => {
  if (!audioRef.value || !canvasRef.value) {
    return
  }

  const percent = e.offsetX / canvasRef.value.getBoundingClientRect().width
  audioRef.value.currentTime = percent * duration

  if (!isPlaying.value) {
    play()
  }
}

onMounted(draw)
</script>

<template>
  <audio ref="audioRef" :src="src" class="hidden" @ended="reset"></audio>
  <canvas
    ref="canvasRef"
    :width="waveform.length"
    :class="cn('w-0', props.class)"
    @click.stop="changeCurrentTime"
  ></canvas>
</template>
