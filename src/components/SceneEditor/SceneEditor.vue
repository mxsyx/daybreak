<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Plus } from 'lucide-vue-next'
import { useSceneStore } from '@/store'
import Ruler from '../Ruler'
import clsx from 'clsx'

const sceneStore = useSceneStore()

const scene = computed(() => sceneStore.scene)

if (!scene.value) {
}
</script>

<template>
  <div v-if="scene" class="bg-[#1E1E29] border-[1px] p-4 rounded-xl">
    <div class="flex gap-8">
      <div class="center">
        <Clock class="mr-2" :size="16" />
        <span>
          {{ scene.grids[scene.grids.length - 1].end - scene.grids[0].start }} s
        </span>
      </div>
    </div>

    <div v-if="scene">
      <div>
        <span
          v-for="(grid, index) in scene.grids"
          :key="index"
          :class="
            clsx(
              'inline-block whitespace-nowrap cursor-pointer p-1 border border-dashed'
            )
          "
        >
          {{ grid.text }}
        </span>
      </div>
    </div>
  </div>
</template>
