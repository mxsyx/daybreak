<script setup lang="ts">
import { createGridWithAxes } from '@/lib/grid'
import { useAppStore } from '@/store'
import { Toggle } from '../ui/toggle'
import { Grid3X3 } from 'lucide-vue-next'
import { ref } from 'vue'
import type { Graphics } from 'pixi.js'

const grid = ref<Graphics>()

const toggle = async () => {
  if (!grid.value) {
    const app = await useAppStore().getApp()
    const gridWithAxes = createGridWithAxes(
      app.screen.width,
      app.screen.height,
      60
    )

    app.stage.addChild(gridWithAxes.grid)
    grid.value = gridWithAxes.grid
  } else {
    grid.value.visible = !grid.value.visible
  }
}
</script>

<template>
  <Toggle @click="toggle()">
    <Grid3X3 />
  </Toggle>
</template>
