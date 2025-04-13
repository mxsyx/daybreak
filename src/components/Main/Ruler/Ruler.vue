<script setup lang="ts">
import { createRuler } from '@/components/Main/Ruler/utils'
import { Toggle } from '../../ui/toggle'
import { Grid3X3 } from 'lucide-vue-next'
import { shallowRef } from 'vue'
import { Container } from 'pixi.js'
import pixi from '@/pixi'

const ruler = shallowRef<Container>()

const toggle = () => {
  if (!ruler.value) {
    ruler.value = createRuler(pixi.screen.width, pixi.screen.height)
    pixi.stage.addChild(ruler.value)
  } else {
    ruler.value.visible = !ruler.value.visible
  }
}
</script>

<template>
  <Toggle @click="toggle()">
    <Grid3X3 class="text-foreground-5" />
  </Toggle>
</template>
