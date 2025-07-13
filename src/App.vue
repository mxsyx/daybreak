<script setup lang="ts">
import { useDark } from '@vueuse/core'

import { Toaster } from '@/components/ui/sonner'
import AssetsExplorer from '@/layout/AssetsExplorer'
import SceneEditor from '@/layout/SceneEditor'
import Menu from '@/layout/Menu'
import Main from '@/layout/Main'
import TooltipProvider from './components/ui/tooltip/TooltipProvider.vue'

useDark({
  storageKey: 'color-scheme',
})
</script>

<template>
  <TooltipProvider>
    <Menu></Menu>
    <div class="flex gap-4 overflow-hidden grow mt-4">
      <AssetsExplorer />
      <Main></Main>
      <SceneEditor />
    </div>
  </TooltipProvider>

  <Toaster />
</template>
