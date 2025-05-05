<script setup lang="ts">
import { useDark } from '@vueuse/core'

import { Toaster } from '@/components/ui/sonner'
import SceneLine from '@/components/SceneEditor/SceneLine'
import AssetsExplorer from '@/components/AssetsExplorer'
import SceneEditor from '@/components/SceneEditor'
import Menu from '@/components/Menu'
import Main from '@/components/Main'

useDark({
  storageKey: 'color-scheme',
})
</script>

<template>
  <Menu></Menu>
  <div class="grid grid-cols-[2.2fr_6fr_2.2fr] gap-4 overflow-hidden flex-grow">
    <AssetsExplorer />
    <Main></Main>
    <SceneEditor />
  </div>
  <SceneLine />

  <Toaster />
</template>
