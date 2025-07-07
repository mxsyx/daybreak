<script setup lang="ts">
import { useDark } from '@vueuse/core'

import { Toaster } from '@/components/ui/sonner'
import SceneLine from '@/layout/SceneEditor/SceneLine'
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
    <div
      class="grid grid-cols-[auto_7.5fr_2.5fr] gap-4 overflow-hidden flex-grow"
    >
      <AssetsExplorer />
      <Main></Main>
      <SceneEditor />
    </div>
    <SceneLine />
  </TooltipProvider>

  <Toaster />
</template>
