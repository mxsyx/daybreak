<script setup lang="ts">
import { shallowRef } from 'vue'
import { handleDragStart } from '../utils'

const videoRef = shallowRef<HTMLVideoElement>()

const play = () => {
  videoRef.value!.play()
}
const reset = () => {
  videoRef.value!.pause()
  videoRef.value!.currentTime = 0
}
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div
      class="p-1 rounded-xs border border-dashed border-transparent hover:border-white cursor-pointer relative"
      draggable
      @dragstart="
        handleDragStart(
          $event,
          'video',
          'http://127.0.0.1:5500/resources/%E7%9F%AD%E8%A7%86%E9%A2%91/%E8%AE%B8%E5%B7%8D%E3%80%8A%E6%95%85%E4%B9%A1%E3%80%8B%E9%9C%87%E6%92%BC%E7%8E%B0%E5%9C%BA%EF%BC%8C%E7%9B%B8%E4%BF%A1%E6%88%91%EF%BC%8C%E8%BF%99%E6%98%AF%E4%BD%A0%E4%B8%80%E7%9B%B4%E5%9C%A8%E6%89%BE%E7%9A%84%E7%89%88%E6%9C%AC.mp4'
        )
      "
    >
      <video
        src="http://127.0.0.1:5500/resources/%E7%9F%AD%E8%A7%86%E9%A2%91/%E8%AE%B8%E5%B7%8D%E3%80%8A%E6%95%85%E4%B9%A1%E3%80%8B%E9%9C%87%E6%92%BC%E7%8E%B0%E5%9C%BA%EF%BC%8C%E7%9B%B8%E4%BF%A1%E6%88%91%EF%BC%8C%E8%BF%99%E6%98%AF%E4%BD%A0%E4%B8%80%E7%9B%B4%E5%9C%A8%E6%89%BE%E7%9A%84%E7%89%88%E6%9C%AC.mp4"
        width="200"
        ref="videoRef"
      ></video>
      <img
        src="http://127.0.0.1:5500/resources/%E7%9F%AD%E8%A7%86%E9%A2%91/first_frame.png"
        width="200"
        @mouseover="play"
        @mouseleave="reset"
        class="mask m-1 hover:opacity-0"
      />
    </div>
  </div>
</template>
