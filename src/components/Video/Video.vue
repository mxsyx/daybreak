<script setup lang="ts">
import { CDN_URL } from '@/lib/constants'
import { computed, shallowRef } from 'vue'

const videoRef = shallowRef<HTMLVideoElement>()

const props = defineProps<{
  src: string
  poster?: string
  width?: number
  class?: string
  controls?: boolean
}>()

const play = () => {
  videoRef.value!.play()
}
const reset = () => {
  videoRef.value!.pause()
  videoRef.value!.currentTime = 0
}

const { src } = computed(() => {
  let { src } = props
  if (src.startsWith('/')) {
    src = `${CDN_URL}${props.src}`
  }

  const url = new URL(src)
  url.search = ''

  return { src: url.href }
}).value

const { poster } = computed(() => {
  let { poster } = props
  if (poster && poster.startsWith('/')) {
    poster = `${CDN_URL}${props.src}`
  }
  if (!poster) {
    return {}
  }

  const url = new URL(poster)
  url.search = ''

  return { poster: url.href }
}).value
</script>

<template>
  <video
    ref="videoRef"
    :src="src"
    :width="width"
    :controls="controls"
    :class="props.class"
  ></video>
  <img
    v-if="poster"
    :src="poster"
    :width="width"
    class="mask m-1 hover:opacity-0"
    @mouseover="play"
    @mouseleave="reset"
  />
</template>
