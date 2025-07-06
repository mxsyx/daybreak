<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { CDN_URL } from '@/lib/constants'
import { thumbHashToDataURL } from 'thumbhash'
import { cn } from '@/lib/utils'

interface Props {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  class?: string
  rootClass?: string
  onClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {})

const isLoading = ref(true)
const showBlur = ref(true)

const { src, thumbSrc, width, height } = computed(() => {
  const srcInfo: {
    src?: string
    thumbSrc?: string
    width?: string | number
    height?: string | number
  } = {}

  let src = props.src
  if (src && src.startsWith('/')) {
    src = `${CDN_URL}${src}`
  }
  if (!src) {
    return srcInfo
  }

  const url = new URL(src)
  const thumbhash = url.searchParams.get('thumbhash')
  // const w = searchParams.get('w') ?? undefined
  // const h = searchParams.get('h') ?? undefined
  url.search = ''

  if (thumbhash) {
    const hash = Uint8Array.from(atob(thumbhash), (c) => c.charCodeAt(0))
    const thumbSrc = thumbHashToDataURL(hash)
    srcInfo.thumbSrc = thumbSrc
  }
  if (props.width) {
    srcInfo.width = props.width
  }
  if (props.height) {
    srcInfo.height = props.height
  }
  srcInfo.src = url.href

  return srcInfo
}).value

onMounted(() => {
  if (!src) {
    return
  }

  const image = new Image()
  image.src = src
  isLoading.value = !image.complete
  showBlur.value = !image.complete
})
</script>

<template>
  <div
    :class="
      cn('inline-block relative overflow-hidden cursor-pointer', rootClass)
    "
    @click="onClick"
  >
    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :class="props.class"
      @load="isLoading = false"
    />
    <img
      v-if="showBlur && thumbSrc"
      :src="thumbSrc"
      :width="width"
      :height="height"
      :class="
        cn(
          'absolute top-0 left-0 transition-opacity duration-500',
          isLoading ? 'opacity-100' : 'opacity-0',
          props.class,
        )
      "
      @transitionend="showBlur = false"
    />
    <slot></slot>
  </div>
</template>
