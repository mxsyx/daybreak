<script setup lang="ts">
import { AssetTypeEnum } from '@/endpoints/asset'
import { CDN_URL } from '@/lib/constants'
import { useEndpoint } from '@/lib/request'
import { MasonryInfiniteGrid } from '@egjs/vue3-infinitegrid'
import { onMounted, ref } from 'vue'
import { handleDragStart } from '../utils'
import Video from '@/components/Video'

const containerRef = ref<HTMLDivElement>()
const columnSize = ref<number>(0)

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
          <Video
            :src="video.payload.url"
            :poster-src="video.payload.poster"
            :width="columnSize"
          ></Video>
        </div>
      </MasonryInfiniteGrid>
    </div>
  </div>
</template>
