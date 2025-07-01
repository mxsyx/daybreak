<script setup lang="ts">
import { AssetTypeEnum } from '@/endpoints/asset'
import { CDN_URL } from '@/lib/constants'
import { useEndpoint } from '@/lib/request'
import { MasonryInfiniteGrid } from '@egjs/vue3-infinitegrid'
import { onMounted, ref, shallowRef } from 'vue'
import { handleDragStart } from '../utils'

const videoRef = shallowRef<HTMLVideoElement>()
const containerRef = ref<HTMLDivElement>()
const columnSize = ref<number>(0)

const play = () => {
  videoRef.value!.play()
}
const reset = () => {
  videoRef.value!.pause()
  videoRef.value!.currentTime = 0
}

const { data: videos } = useEndpoint('v1/assets', {
  method: 'GET',
  manual: false,
  params: {
    type: AssetTypeEnum.VIDEO,
    page: 1,
  },
})

onMounted(() => {
  const { width } = containerRef.value!.getBoundingClientRect()
  columnSize.value = Math.floor((width - 16) / 2)
})
</script>

<template>
  <div class="px-4 py-2">
    <div ref="containerRef">
      <MasonryInfiniteGrid v-if="columnSize" class="container" :column="2">
        <div
          v-for="video in videos"
          :key="video.id"
          class="p-1 rounded-xs border border-dashed border-transparent hover:border-white cursor-pointer relative"
          draggable
          @dragstart="
            handleDragStart($event, 'video', `${CDN_URL}${video.payload.url}`)
          "
        >
          <video
            ref="videoRef"
            :src="`${CDN_URL}${video.payload.url}`"
            :width="columnSize"
          ></video>
          <img
            :src="`${CDN_URL}${video.payload.poster}`"
            :width="columnSize"
            class="mask m-1 hover:opacity-0"
            @mouseover="play"
            @mouseleave="reset"
          />
        </div>
      </MasonryInfiniteGrid>
    </div>
  </div>
</template>
