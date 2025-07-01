<script setup lang="ts">
import { AssetTypeEnum } from '@/endpoints/asset'
import { useEndpoint } from '@/lib/request'
import { ref } from 'vue'
import Audio from './Audio.vue'

const containerRef = ref<HTMLDivElement>()

const { data: audios } = useEndpoint('v1/assets', {
  method: 'GET',
  manual: false,
  params: {
    type: AssetTypeEnum.AUDIO,
    page: 1,
  },
})
</script>

<template>
  <div class="px-4 py-2">
    <div ref="containerRef">
      <Audio
        v-for="audio in audios"
        :key="audio.id"
        :src="audio.payload.url"
        :caption="audio.payload.caption"
      >
      </Audio>
    </div>
  </div>
</template>
