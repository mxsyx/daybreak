<script setup lang="ts">
import { computed } from 'vue'
import { useSceneStore } from '@/store'
import clsx from 'clsx'

const sceneStore = useSceneStore()
const scene = computed(() => sceneStore.scene)
</script>

<template>
  <div v-if="scene" class="mt-2">
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
</template>
