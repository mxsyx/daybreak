<script setup lang="ts">
import BlockEditor from './BlockEditor.vue'

// 定义 props
const props = defineProps<{
  type: 'block' | 'image' | 'layout'
}>()

// 根据 type 渲染对应的编辑器
const renderEditor = () => {
//   switch (props.type) {
//     case 'block':
//       return <BlockEditor />
//     default:
//       return null
//   }
}

console.log(props.type)
</script>

<template>
  <div>
    {{ renderEditor() }}
  </div>
</template>