<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { Toaster } from '@/components/ui/sonner'
import Timeline from '@/components/Timeline'
import SceneEditor from '@/components/SceneEditor'
import AssetsExplorer from '@/components/AssetsExplorer'
import ObjectEditor from '@/components/ObjectEditor'
import Nav from '@/components/Nav'

import pixi from './pixi'
import { PlayCircle, Redo2, Undo2 } from 'lucide-vue-next'
import Ruler from './components/Ruler'

const container = ref<HTMLDivElement>()
onMounted(() => {
  container.value!.appendChild(pixi.canvas)
})
</script>

<template>
  <main
    class="h-[100vh] bg-[#090911] text-white p-4 grid grid-rows-[1fr_auto] gap-4 dark"
  >
    <Nav></Nav>
    <div class="grid grid-cols-[2fr_6fr_2fr] gap-4 overflow-hidden">
      <AssetsExplorer />
      <div class="w-full grid grid-rows-[auto_1fr] gap-4">
        <div class="bg-[#1E1E29] border-[1px] p-3 rounded-xl">
          <div ref="container"></div>
          <hr class="mt-4 mb-1" />
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2 center">
              <Undo2 :size="20" class="text-foreground-5" />
              <Redo2 :size="20" class="text-foreground-5" />
            </div>
            <PlayCircle :size="20" />
            <div>
              <Ruler />
            </div>
          </div>
        </div>
        <SceneEditor />
      </div>
      <ObjectEditor />
    </div>
    <Timeline />
  </main>

  <Toaster />
</template>
