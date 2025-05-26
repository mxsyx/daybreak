<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ArrowUpFromLine, Menu, Moon, Sun } from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  storageKey: 'color-scheme',
})
const toggleDark = useToggle(isDark)
// const toggleDark = () => {
//   document.documentElement.classList.toggle('dark')
// }

const test = () => {
  import('jieba-wasm').then(({ default: init, cut }) => {
    init().then(() => {
      console.log(
        cut(
          'Universally query points. This endpoint covers all capabilities of search, recommend, discover, filters. But also enables hybrid and multi-stage queries.',
          true
        )
      )
    })
  })
}
</script>

<template>
  <header class="flex justify-between px-4">
    <div class="flex-center">
      <Menu class="ml-2"></Menu>
      <div class="flex items-center gap-2 ml-8">
        <img src="/logo.webp" width="32" height="32" />
        <span class="text-2xl font-bold text-foreground-1">Daybreak</span>
      </div>
    </div>

    <div class="flex-center gap-2">
      <Button class="h-8" @click="test">Run</Button>
      <Button class="size-8" variant="ghost" @click="toggleDark()">
        <Sun v-if="isDark" :size="12" />
        <Moon v-else :size="12" class="text-foreground-1" />
      </Button>
      <Button class="h-8 text-white">
        <ArrowUpFromLine />
        <span class="font-bold">导出</span>
      </Button>
    </div>
  </header>
</template>
