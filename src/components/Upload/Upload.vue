<script setup lang="ts">
import { ref, shallowRef, type HTMLAttributes } from 'vue'
import { CloudUpload, LoaderIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { encode } from '@jsquash/webp'
import { useVModel } from '@vueuse/core'

// 定义 props
const props = defineProps<{
  defaultValue?: string
  modelValue?: string
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()

// 支持的图片类型
const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']

// 状态
const fileInput = shallowRef<HTMLInputElement | null>(null)
const isLoading = ref(false)

// 处理文件上传
const processFile = async (file: File) => {
  const reader = new FileReader()

  reader.readAsDataURL(file)
  reader.onload = async () => {
    try {
      isLoading.value = true

      if (!supportedTypes.includes(file.type)) {
        toast({ title: 'Unsupported file type' })
        return
      }

      const img = document.createElement('img')
      img.src = reader.result as string
      await new Promise((resolve) => (img.onload = resolve))
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const rawImageData = ctx.getImageData(0, 0, img.width, img.height)

      const webpBuffer = await encode(rawImageData)

      const uint8Array = new Uint8Array(webpBuffer)
      const base64String = btoa(
        String.fromCharCode.apply(null, Array.from(uint8Array))
      )
      console.log(`data:image/webp;base64,${base64String}`)

      emits('update:modelValue', `data:image/webp;base64,${base64String}`)
    } catch (error: any) {
      toast({ title: error.message })
    } finally {
      isLoading.value = false
    }
  }
}

// 触发文件选择
const handleFileClick = () => {
  if (isLoading.value) return
  fileInput.value?.click()
}
</script>

<template>
  <div class="inline-flex items-center gap-6">
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      accept="image/jpeg, image/png, image/webp"
      @change="processFile(($event.target as HTMLInputElement).files![0])"
    />

    <!-- 图片和上传按钮 -->
    <div
      class="relative cursor-pointer w-[100px] h-[100px] flex-shrink-0"
      @click="handleFileClick"
    >
      <img
        v-if="props.modelValue"
        :src="props.modelValue"
        alt=""
        width="100"
        height="100"
        class="rounded-full"
      />
      <Button
        class="absolute right-0 bottom-0 bg-gray-800 text-white size-6 px-5 py-2 hover:bg-gray-700"
      >
        <LoaderIcon v-if="isLoading" :size="14" />
        <CloudUpload v-else :size="14" />
      </Button>
    </div>

    <!-- 支持的文件类型提示 -->
    <p>Support .jpg, .png, .webp</p>
  </div>
</template>
