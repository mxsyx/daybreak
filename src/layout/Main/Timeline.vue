<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSceneStore } from '@/store'
import { cn } from '@/lib/utils'

const sceneStore = useSceneStore()
const scene = computed(() => sceneStore.scene)

let duration = 30

const moments = ref<number[]>([])

for (let i = 0; i < 30; i += 0.5) {
  duration += 30
  moments.value.push(i)
}

let lIndex = -1
let rIndex = -1
</script>

<template>
  <div
    v-if="scene"
    class="relative border border-[#475569] bg-slate-900 rounded-lg h-20 max-w-max flex font-medium overflow-hidden"
  >
    <div
      v-for="(grid, index) in scene.grids"
      :key="index"
      :class="
        cn(
          ' cursor-pointer px-3 flex flex-col justify-center relative hover:bg-[#1e293b80]',
          index >= lIndex &&
            index <= rIndex &&
            'border-y-2 my-2 bg-[#1e293b80]',
          index === lIndex && 'border-l-2 rounded-l-lg',
          index === rIndex && 'border-r-2 rounded-r-lg',
        )
      "
      draggable="true"
    >
      <span class="whitespace-nowrap">
        {{ grid.text }}
      </span>
      <span
        v-if="index < lIndex || index > rIndex"
        class="absolute top-[2px] right-1 text-xs text-muted-foreground"
      >
        {{ grid.start }}
      </span>
      <div
        v-if="lIndex === rIndex"
        class="absolute w-px h-full right-0 bg-border"
      ></div>
    </div>
  </div>
</template>
