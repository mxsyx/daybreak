<script setup lang="ts">
import { computed } from 'vue'
import clsx from 'clsx'
import { useSceneStore } from '@/store'

const sceneStore = useSceneStore()

const scene = computed(() => sceneStore.scene)

if (!scene.value) {
}
</script>

<template>
  <div v-if="scene">
    <!-- 网格显示 -->
    <div class="mt-5">
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
