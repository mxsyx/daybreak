<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSceneStore } from '@/store'
import clsx from 'clsx'
import { Dot } from 'lucide-vue-next'

const sceneStore = useSceneStore()
const scene = computed(() => sceneStore.scene)

let duration = 30

const moments = ref<number[]>([])

for (let i = 0; i < 30; i += 0.5) {
  duration += 30
  moments.value.push(i)
}

console.log(scene.value?.grids)
</script>

<template>
  <div v-if="scene">
    <!-- <div class="flex-start gap-3">
      <span
        v-for="(moment, index) in moments"
        :key="index"
        class="text-xs font-medium text-muted-foreground"
      >
        <template v-if="index % 4 === 0">{{ moment }}</template>
        <template v-else><Dot /></template>
      </span>
    </div> -->
    <span
      v-for="(grid, index) in scene.grids"
      :key="index"
      draggable="true"
      :class="
        clsx(
          'inline-block whitespace-nowrap cursor-pointer p-1 text-base leading-[22px]',
        )
      "
    >
      {{ grid.text }}
    </span>
    <div class="relative">
      <div class="size-3 rounded-full bg-white"></div>
      <div class=""></div>
    </div>
  </div>
</template>
