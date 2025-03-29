<script setup lang="ts">
import { ref, watch } from 'vue'
import { Cross, FoldHorizontal, FoldVertical } from 'lucide-vue-next' // 假设 lucide-vue-next 是 lucide-react 的 Vue 版本
import Slider from '../ui/Slider.vue'
import Input from '../ui/Input.vue'
import Label from '../ui/Label.vue'
import ToggleGroup from '../ui/ToggleGroup.vue'
import ToggleGroupItem from '../ui/ToggleGroupItem.vue'
import { useSelectedObjectStore, useSceneStore } from '@/store'

// 定义 padding 方向
type PaddingDirection = 'pl' | 'pt' | 'pr' | 'pb'
const PADDING_DIRECTIONS: { name: PaddingDirection; label: string }[] = [
  { name: 'pl', label: '左边距' },
  { name: 'pt', label: '上边距' },
  { name: 'pr', label: '右边距' },
  { name: 'pb', label: '下边距' },
]

// 使用 Pinia store
const selectedObjectStore = useSelectedObjectStore()
const sceneStore = useSceneStore()
// 获取当前选中的 block
const block = ref(selectedObjectStore.selectedObject as Block)

// 表单值
const formValues = ref({
  pl: block.value?.pl || 0,
  pt: block.value?.pt || 0,
  pr: block.value?.pr || 0,
  pb: block.value?.pb || 0,
})

// 锁定状态
const isLockedCross = ref(
  block.value?.pl === block.value?.pt &&
    block.value?.pr === block.value?.pb &&
    block.value?.pl === block.value?.pt
)
const isLockedHorizontal = ref(
  !isLockedCross.value && block.value?.pl === block.value?.pr
)
const isLockedVertical = ref(
  !isLockedCross.value && block.value?.pt === block.value?.pb
)

// 处理 padding 值变化
const handleChange = (name: PaddingDirection, value: number) => {
  if (isNaN(value) || value < 0) value = 0
  if (value > 100) value = 100

  if (isLockedCross.value) {
    formValues.value.pl = value
    formValues.value.pr = value
    formValues.value.pt = value
    formValues.value.pb = value
  } else if (isLockedHorizontal.value && (name === 'pl' || name === 'pr')) {
    formValues.value.pl = value
    formValues.value.pr = value
  } else if (isLockedVertical.value && (name === 'pt' || name === 'pb')) {
    formValues.value.pt = value
    formValues.value.pb = value
  } else {
    formValues.value[name] = value
  }

  // 更新 block 和 scene
  Object.assign(block.value, formValues.value)
}

// 监听 block 变化
watch(
  () => selectedObjectStore.selectedObject as Block,
  (newBlock: Block) => {
    block.value = newBlock
    formValues.value = {
      pl: newBlock?.pl || 0,
      pt: newBlock?.pt || 0,
      pr: newBlock?.pr || 0,
      pb: newBlock?.pb || 0,
    }
  }
)
</script>

<template>
  <div>
    <!-- ToggleGroup -->
    <ToggleGroup
      type="multiple"
      variant="outline"
      :default-value="[
        isLockedCross ? 'cross' : '',
        isLockedHorizontal ? 'horizontal' : '',
        isLockedVertical ? 'vertical' : '',
      ]"
    >
      <ToggleGroupItem value="cross" @click="isLockedCross = !isLockedCross">
        <Cross />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="horizontal"
        @click="isLockedHorizontal = !isLockedHorizontal"
      >
        <FoldHorizontal />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="vertical"
        @click="isLockedVertical = !isLockedVertical"
      >
        <FoldVertical />
      </ToggleGroupItem>
    </ToggleGroup>

    <!-- Padding 输入和滑块 -->
    <div class="flex items-center gap-8 mt-6">
      <div v-for="dir in PADDING_DIRECTIONS" :key="dir.name">
        <div class="flex justify-between">
          <Label class="font-bold text-lg">{{ dir.label }}</Label>
          <Input
            class="w-16 h-7"
            :value="formValues[dir.name]"
          />
        </div>
        <div class="mt-2">
          <Slider
            :max="100"
            :step="1"
            class="w-40"
            :value="formValues[dir.name]"
          />
        </div>
      </div>
    </div>
  </div>
</template>
