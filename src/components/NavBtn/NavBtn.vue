<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useElementHover } from '@vueuse/core'
import clsx from 'clsx'
import { type LucideProps } from 'lucide-vue-next'
import { useTemplateRef, type FunctionalComponent } from 'vue'

const props = defineProps<{
  label: string
  icon: FunctionalComponent<LucideProps, {}, any, {}>
  active: boolean
  position?: 'left' | 'right'
}>()

const btnRef = useTemplateRef<HTMLButtonElement>('btnRef')
const isHovering = useElementHover(btnRef)
</script>

<template>
  <Button
    ref="btnRef"
    variant="ghost"
    :class="
      clsx(
        'size-14 text-foreground-2 text-[10px] flex-col-center gap-1 rounded-xl relative border-stroke',
        {
          '!bg-surface-2 !text-foreground-1 border': props.active,
        }
      )
    "
  >
    <component :is="props.icon" class="!size-5" />
    <span>{{ props.label }}</span>
    <i
      v-show="isHovering || props.active"
      :class="
        clsx(
          'bg-primary w-[3px] h-1 rounded absolute  top-[50%] translate-y-[-50%] transition-[height] ',
          {
            '!h-4': props.active,
            '!h-[22px]': props.active && isHovering,
            'right-[calc(100%+2px)]': props.position === 'left',
            'left-[calc(100%+2px)]': props.position === 'right',
          }
        )
      "
    ></i>
  </Button>
</template>
