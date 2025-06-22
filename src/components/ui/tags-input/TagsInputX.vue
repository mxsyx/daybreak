<script setup lang="ts">
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input'

const modelValue = defineModel<string[]>()
</script>

<template>
  <TagsInput
    v-model="modelValue"
    :add-on-tab="true"
    :add-on-blur="true"
    :add-on-paste="true"
  >
    <TagsInputItem v-for="item in modelValue" :key="item" :value="item">
      <TagsInputItemText />
      <TagsInputItemDelete />
    </TagsInputItem>
    <TagsInputInput placeholder="按下回车添加" />
  </TagsInput>
</template>
