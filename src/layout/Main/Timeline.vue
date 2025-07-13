<script setup lang="ts">
import { computed } from 'vue'
import { useSceneStore } from '@/store'
import clsx from 'clsx'

const sceneStore = useSceneStore()
const scene = computed(() => sceneStore.scene)
</script>

<template>
  <div v-if="scene">
    <span
      v-for="(grid, index) in scene.grids"
      :key="index"
      draggable="true"
      :class="
        clsx(
          'inline-block whitespace-nowrap cursor-pointer p-1 border border-dashed text-base leading-[22px]',
        )
      "
    >
      {{ grid.text }}
    </span>
  </div>
</template>
