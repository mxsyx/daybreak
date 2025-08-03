<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ArrowUpFromLine, Menu, Moon, Sun } from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'
import { exportVideo } from './export'

const isDark = useDark({
  storageKey: 'color-scheme',
})
const toggleDark = useToggle(isDark)
// const toggleDark = () => {
//   document.documentElement.classList.toggle('dark')
// }
</script>

<template>
  <header class="flex justify-between px-4">
    <div class="flex-center">
      <Menu class="ml-2"></Menu>
      <div class="ml-8 flex items-center gap-2">
        <img src="/logo.webp" width="32" height="32" />
        <span class="text-foreground-1 text-2xl font-bold">Daybreak</span>
      </div>
    </div>

    <div class="flex-center gap-2">
      <Button class="size-8" variant="ghost" @click="toggleDark()">
        <Sun v-if="isDark" :size="12" />
        <Moon v-else :size="12" class="text-foreground-1" />
      </Button>
      <Button class="h-8 text-white" @click="exportVideo">
        <ArrowUpFromLine />
        <span class="font-bold">导出</span>
      </Button>
    </div>
  </header>
</template>
