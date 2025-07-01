<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ACCEPT_IMAGE,
  processFiles,
  type UploadProps,
  type UploadResult,
} from './utils'
import { ONE_MB } from '@/lib/constants'
import { toast } from 'vue-sonner'
import { cn } from '@/lib/utils'
import { AssetTypeEnum } from '@/endpoints/asset'

const MAX_SIZE = 20 * ONE_MB

const props = withDefaults(defineProps<UploadProps>(), {
  maxSize: MAX_SIZE,
  accept: ACCEPT_IMAGE,
  multiple: false,
  maxCount: 1,
  placeholder: 'Upload',
  minWidth: 0,
  minHeight: 0,
  maxWidth: Infinity,
  maxHeight: Infinity,
  disabled: false,
  formDisabled: false,
  removeable: true,
})

const emit = defineEmits<{
  upload: [url: string, result: UploadResult, file: File]
}>()

const fileInput = ref<HTMLInputElement>()
const isLoading = ref<boolean>(false)

const model = defineModel<UploadResult | UploadResult[]>()

const results = computed(() => {
  return Array.isArray(model.value)
    ? model.value
    : model.value
      ? [model.value]
      : undefined
})

const isDisabled = computed(() => {
  return props.disabled || props.formDisabled
})

const handleClick = () => {
  if (isLoading.value || !fileInput.value) {
    return
  }
  fileInput.value.value = ''
  fileInput.value.click()
}

const handleRemove = () => {
  model.value = undefined
}

const handleFileChange = async (e: Event) => {
  const { files } = e.target as HTMLInputElement
  if (!files || files.length === 0) {
    return
  }

  if (files.length > props.maxCount) {
    toast.error(`最多上传 ${props.maxCount} 个文件`)
    return
  }

  try {
    isLoading.value = true

    const values = await processFiles(Array.from(files), props, emit)
    model.value = props.multiple ? values : values[0]
  } catch (error: any) {
    toast.error(error.message || error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="cursor-pointer leading-0 w-max" @click="handleClick">
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      :accept="accept"
      :disabled="isDisabled"
      :multiple="multiple"
      @change="handleFileChange"
    />

    <div v-if="isLoading" :class="cn('flex-center', props.class)">
      <LoaderCircle class="animate-spin" />
    </div>
    <template v-else-if="$slots.default">
      <slot></slot>
    </template>
    <template v-else-if="results && results.length > 0">
      <div v-for="result in results" :key="result?.id" class="relative">
        <Image
          v-if="result.type === AssetTypeEnum.IMAGE"
          :src="result?.url"
          :width="width"
          :height="height"
          :class="cn('object-contain', props.class)"
          root-class="text-center"
        >
        </Image>
        <video
          v-else-if="result.type === AssetTypeEnum.VIDEO"
          :src="result.url"
          :class="cn('object-contain', props.class)"
          controls
        ></video>
        <audio
          v-else-if="result.type === AssetTypeEnum.AUDIO"
          :src="result.url"
          controls
        ></audio>
        <X
          v-if="removeable"
          class="absolute right-1 top-1 size-5"
          @click.stop="handleRemove"
        />
      </div>
    </template>
    <Button
      v-else
      variant="outline"
      :class="
        cn(
          'border border-dashed rounded-xl gap-2 hover:bg-transparent hover:border-white',
          isDisabled && 'opacity-70 cursor-not-allowed',
          props.class,
        )
      "
      :style="{ width, height }"
    >
      <UploadIcon />
      <span>{{ placeholder }}</span>
    </Button>
  </div>
</template>
