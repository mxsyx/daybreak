<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSceneStore } from '@/store'

const sceneStore = useSceneStore()
const scene = computed(() => sceneStore.scene)

let duration = 30

const moments = ref<number[]>([])

for (let i = 0; i < 30; i += 0.5) {
  duration += 30
  moments.value.push(i)
}
</script>

<template>
  <div
    v-if="scene"
    class="relative border-2 border-[#475569] rounded-lg h-20 max-w-max flex font-medium overflow-hidden"
  >
    <div
      v-for="(grid, index) in scene.grids"
      :key="index"
      class="bg-[#1e293b80] cursor-pointer px-3 flex flex-col justify-center relative"
      draggable="true"
    >
      <span class="whitespace-nowrap">
        {{ grid.text }}
      </span>
      <span class="absolute top-[2px] right-1 text-xs text-muted-foreground">
        {{ grid.start }}
      </span>
      <div class="absolute w-px h-full right-0 bg-border"></div>
    </div>
  </div>
</template>
