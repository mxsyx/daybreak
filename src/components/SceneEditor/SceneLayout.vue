<script setup lang="ts">
import { computed } from "vue";
import { useSceneStore, useSelectedObjectStore, useSizeStore } from "@/store";
// import Plus from 'lucide-vue-next'
// import SceneLayout from './SceneLayout.vue'

// 定义 props
const props = defineProps<{
  layout: Layout;
  isRoot?: boolean;
}>();

const sizeStore = useSizeStore();
const size = computed(() => sizeStore.size);

// 渲染对象
const renderObject = (object?: { type: "layout" | "image" | "block"; src?: string }) => {
  //   if (!object) {
  //     return <Plus />
  //   }
  //   if (object.type === 'layout') {
  //     return <SceneLayout layout={object} />
  //   } else if (object.type === 'image') {
  //     return <img src={object.src} />
  //   } else {
  //     throw new Error('Unknown object type')
  //   }
};

const handleDrop = (block: any, e: DragEvent) => {
  block.object = JSON.parse(e.dataTransfer!.getData("application/json"));
  // setScene({ ...sceneStore.scene });
};
</script>

<template>
  <div
    class="grid"
    :style="{
      gridTemplateRows: `repeat(${props.layout.rows}, 1fr)`,
      gridTemplateColumns: `repeat(${props.layout.cols}, 1fr)`,
      width: props.isRoot ? '500px' : '100%',
      height: props.isRoot ? `${500 / size.ratio}px` : '100%',
    }"
  >
    <div
      v-for="(block, index) in props.layout.blocks"
      :key="index"
      class="border cursor-pointer center"
      :style="{
        paddingLeft: `${block.pl}%`,
        paddingRight: `${block.pr}%`,
        paddingTop: `${block.pt}%`,
        paddingBottom: `${block.pb}%`,
      }"

      @dragover.prevent
      @drop.stop="handleDrop(block, $event)"
    >
      <component :is="renderObject(block.object)" />
    </div>
  </div>
</template>
