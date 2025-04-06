<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ArrowUpFromLine } from 'lucide-vue-next'
</script>

<template>
  <div class="flex justify-between">
    <div class="flex items-center gap-2">
      <img src="/logo.webp" width="32" height="32" />
      <span class="text-2xl font-bold">Daybreak</span>
    </div>
    <Button class="h-8 text-white">
      <ArrowUpFromLine />
      <span class="font-bold">ABC</span>

      <span class="font-bold">导出</span>
    </Button>
  </div>
</template>
