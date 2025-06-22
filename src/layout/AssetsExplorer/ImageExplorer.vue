<script setup lang="ts">
import Image from '@/components/Image'
import { AssetTypeEnum, type Asset } from '@/endpoints/asset'
import { CDN_URL } from '@/lib/constants'
import { useEndpoint } from '@/lib/request'
import { MasonryInfiniteGrid } from '@egjs/vue3-infinitegrid'
import { onMounted, ref } from 'vue'

const containerRef = ref<HTMLDivElement>()
const columnSize = ref<number>(0)

const handleDragStart = (e: DragEvent, image: Asset) => {
  e.dataTransfer!.setData(
    'application/json',
    JSON.stringify({
      type: 'image',
      src: `${CDN_URL}${image.payload.url}`,
    }),
  )
}

const { data: images } = useEndpoint('v1/assets', {
  method: 'GET',
  manual: false,
  params: {
    type: AssetTypeEnum.IMAGE,
    page: 1,
  },
})

onMounted(() => {
  const { width } = containerRef.value!.getBoundingClientRect()
  columnSize.value = Math.floor((width - 16) / 2)
})
</script>

<template>
  <div ref="containerRef">
    <MasonryInfiniteGrid v-if="columnSize" class="container" :column="2">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        :data-grid-groupkey="index % 40"
        draggable
        @dragstart="handleDragStart($event, image)"
      >
        <Image :src="image.payload.url" :width="columnSize" />
      </div>
    </MasonryInfiniteGrid>
  </div>
</template>
