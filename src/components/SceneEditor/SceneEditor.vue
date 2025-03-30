<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Grid3X3, Plus } from 'lucide-vue-next'
import { useSceneStore } from '@/store'
import { Switch } from '../ui/switch'
import Toggle from '../ui/toggle/Toggle.vue'
import { Tooltip } from '../ui/tooltip'

const sceneStore = useSceneStore()

const scene = computed(() => sceneStore.scene)

if (!scene.value) {
}
</script>

<template>
  <div v-if="scene">
    <!-- 时间显示 -->
    <div class="flex">
      <Clock class="mr-2" />
      <span>
        {{ scene.grids[scene.grids.length - 1].end - scene.grids[0].start }} s
      </span>
    </div>

    <!-- 背景设置 -->
    <div class="flex mt-5">
      <span class="mr-2">背景: </span>
      <div class="px-12 border border-dashed rounded-xs">
        <Plus />
      </div>

      <Toggle>
        <Grid3X3 />
      </Toggle>
    </div>
  </div>
</template>
