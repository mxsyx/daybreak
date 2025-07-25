<script setup lang="ts">
import Image from '@/components/Image'
import { AssetTypeEnum } from '@/endpoints/asset'
import { useEndpoint } from '@/lib/request'
import useRefreshKeysStore from '@/store/refreshKeys'
import { MasonryInfiniteGrid } from '@egjs/vue3-infinitegrid'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { handleDragStart } from './utils'

const containerRef = ref<HTMLDivElement>()
const columnSize = ref<number>(0)

const refreshKeysStore = useRefreshKeysStore()

const { data: images } = useEndpoint('v1/assets', {
  method: 'GET',
  manual: false,
  params: {
    type: AssetTypeEnum.IMAGE,
    page: 1,
  },
  refreshDeps: [storeToRefs(refreshKeysStore).images],
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
          v-for="(image, index) in images"
          :key="image.id"
          :data-grid-groupkey="index % 40"
          draggable
          @dragstart="
            handleDragStart($event, AssetTypeEnum.IMAGE, image.payload.url)
          "
        >
          <Image :src="image.payload.url" :width="columnSize" />
        </div>
      </MasonryInfiniteGrid>
    </div>
  </div>
</template>
