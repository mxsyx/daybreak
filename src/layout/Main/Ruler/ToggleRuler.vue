<script setup lang="ts">
import { Toggle } from '@/components/ui/toggle'
import { Grid3X3 } from 'lucide-vue-next'
import pixi from '@/pixi'

import Ruler from './Ruler'
import useRulerStore from '@/store/ruler'

const rulerStore = useRulerStore()

const toggle = () => {
  if (!rulerStore.ruler) {
    const ruler = new Ruler(pixi.screen.width, pixi.screen.height)
    rulerStore.ruler = ruler
    pixi.stage.addChild(ruler.container)
    pixi.stage.setChildIndex(ruler.container, 0)
  } else {
    rulerStore.ruler.visiable = !rulerStore.ruler.visiable
  }
}
</script>

<template>
  <Toggle @click="toggle()">
    <Grid3X3 class="text-foreground-5" />
  </Toggle>
</template>
