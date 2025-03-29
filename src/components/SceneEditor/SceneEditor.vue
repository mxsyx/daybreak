<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Plus } from 'lucide-vue-next'
import clsx from 'clsx'
import SceneLayout from './SceneLayout.vue'
import ObjectEditor from './ObjectEditor.vue'
import { useSceneStore, useSelectedObjectStore } from '@/store'

const sceneStore = useSceneStore()
const selectedObjectStore = useSelectedObjectStore()

const scene = computed(() => sceneStore.scene)
const selectedObject = computed(() => selectedObjectStore.selectedObject)

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
      <img />
    </div>

    <!-- 网格显示 -->
    <div class="mt-5">
      <span
        v-for="(grid, index) in scene.grids"
        :key="index"
        :class="clsx('inline-block whitespace-nowrap cursor-pointer p-1 border border-dashed')"
      >
        {{ grid.text }}
      </span>
    </div>

    <!-- 布局和对象编辑器 -->
    <div class="mt-4 flex gap-4">
      <SceneLayout :layout="scene.layout" :is-root="true" />
      <ObjectEditor v-if="selectedObject" :type="selectedObject.type" />
    </div>
  </div>
</template>
