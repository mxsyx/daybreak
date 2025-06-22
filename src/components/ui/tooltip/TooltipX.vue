<script setup lang="ts">
import Tooltip from './Tooltip.vue'
import TooltipContent from './TooltipContent.vue'
import TooltipTrigger from './TooltipTrigger.vue'
</script>

<template>
  <Tooltip>
    <TooltipTrigger>
      <slot></slot>
    </TooltipTrigger>
    <TooltipContent>
      <slot name="content"></slot>
    </TooltipContent>
  </Tooltip>
</template>
