<script lang="ts">
const MAX_SIZE = 20 * ONE_MB
export const ACCEPT_IMAGE = 'image/jpeg, image/png, image/webp'
// prettier-ignore
export const ACCEPT_OFFICE = 'application/pdf, application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, plain/text'
export const ACCEPT_ALL = `${ACCEPT_IMAGE}, ${ACCEPT_OFFICE}`

export interface UploadResult {
  id: string
  key: string
  metadata: { size: string } & {
    type: 'image/webp'
    width: number
    height: number
    thumbhash: string
  }
  url: string
}
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { encode as encodeWebp } from '@jsquash/webp'
import Image from '../Image'
import { ONE_MB } from '@/lib/constants'
import { getUrl } from '@/lib/request'
import { Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { LoaderCircle } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { rgbaToThumbHash } from 'thumbhash'

interface Props {
  maxSize?: number
  accept?: string
  multiple?: boolean
  maxCount?: number
  className?: string
  placeholder?: string
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  disabled?: boolean
  formDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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
})

interface UploadTarget {
  file: File
  img?: HTMLImageElement
  buffer?: ArrayBuffer
  width?: number
  height?: number
}

const emit = defineEmits<{
  remove: []
  upload: [url: string, result: UploadResult]
}>()

const fileInput = ref<HTMLInputElement>()
const isLoading = ref<boolean>(false)

const model = defineModel<UploadResult | UploadResult[]>()

const results = computed(() => {
  return Array.isArray(model.value) ? model.value : [model.value]
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

// const handleRemove = () => {
//   emit('update:modelValue', undefined)
//   emit('remove')
// }

const readFiles = (files: File[]) => {
  return files.map(
    (file) =>
      new Promise((resolve) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = () => {
            const img = document.createElement('img')
            const onload = () => {
              resolve({
                file,
                img,
                width: img.naturalWidth,
                height: img.naturalHeight,
              })
            }
            img.onload = onload
            img.src = reader.result as string
            if (img.complete) {
              onload()
            }
          }
          reader.readAsDataURL(file)
        } else {
          resolve({ file })
        }
      }),
  ) as Promise<UploadTarget>[]
}

const checkFiles = (targets: UploadTarget[]) => {
  return targets.map(
    (target) =>
      new Promise((resolve, reject) => {
        if (target.img) {
          const messages: string[] = []
          if (target.img.width < props.minWidth) {
            messages.push(
              `The width of ${target.file.name} must be greater than ${props.minWidth} pixels`,
            )
          } else if (target.img.height < props.minHeight) {
            messages.push(
              `The height of ${target.file.name} must be greater than ${props.minHeight} pixels`,
            )
          } else if (target.img.width > props.maxWidth) {
            messages.push(
              `The width of ${target.file.name} must be less than ${props.maxWidth} pixels`,
            )
          } else if (target.img.height > props.maxHeight) {
            messages.push(
              `The height of ${target.file.name} must be less than ${props.maxHeight} pixels`,
            )
          }
          if (messages.length > 0) {
            return reject(messages.join('; '))
          }
        }
        resolve(true)
      }),
  ) as Promise<boolean>[]
}

const compressFiles = (targets: UploadTarget[]) => {
  return targets.map(
    (target) =>
      new Promise((resolve, reject) => {
        if (target.img) {
          const canvas = document.createElement('canvas')
          canvas.width = target.width!
          canvas.height = target.height!
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(target.img, 0, 0)
          const rawImageData = ctx.getImageData(
            0,
            0,
            target.width!,
            target.height!,
          )
          encodeWebp(rawImageData)
            .then((buffer) => {
              if (buffer.byteLength > props.maxSize) {
                return reject('Image compression failed')
              }

              target.buffer = buffer
              resolve(buffer)
            })
            .catch(reject)
        } else {
          resolve(null)
        }
      }),
  )
}

const encodeThumbhash = (target: UploadTarget) => {
  const { img, width, height } = target
  if (!img || !width || !height) {
    return
  }

  const size = Math.max(width, height)
  const w = (img.width = Math.round((100 * width) / size))
  const h = (img.height = Math.round((100 * height) / size))
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = w
  canvas.height = h
  ctx.drawImage(img, 0, 0, w, h)
  const pixels = ctx.getImageData(0, 0, w, h)

  const thumb = rgbaToThumbHash(w, h, pixels.data)
  return btoa(String.fromCharCode(...thumb)).replace(/=+$/, '')
}

const uploadFiles = (targets: UploadTarget[]) => {
  return targets.map(
    (target) =>
      new Promise((resolve, reject) => {
        const formData = new FormData()

        if (target.buffer) {
          const blob = new Blob([target.buffer], { type: 'image/webp' })
          const thumbhash = encodeThumbhash(target)
          console.log(thumbhash)

          formData.append('file', blob)
          if (thumbhash) {
            formData.append('thumbhash', thumbhash)
          }
          formData.append('width', String(target.width))
          formData.append('height', String(target.height))
        } else {
          formData.append('file', target.file)
        }

        fetch(getUrl('v1/files'), {
          method: 'POST',
          body: formData,
        })
          .then(async (response) => {
            const result = (await response.json()) as UploadResult
            const url = URL.createObjectURL(target.file)
            result.url = url
            emit('upload', url, result)
            resolve(result)
          })
          .catch((error) => {
            reject(error.messages)
          })
      }),
  ) as Promise<UploadResult>[]
}

const handleFileChange = async (e: Event) => {
  const { files } = e.target as HTMLInputElement
  if (!files || files.length === 0) {
    return
  }

  if (files.length > props.maxCount) {
    toast.error(`最多上传 ${props.maxCount} 张图片`)
    return
  }

  try {
    isLoading.value = true

    const targets = await Promise.all(readFiles(Array.from(files)))
    await Promise.all(checkFiles(targets))
    await Promise.all(compressFiles(targets))

    const promises = uploadFiles(targets)
    const values: UploadResult[] = []
    promises.forEach((promise) => {
      promise.then((value) => {
        values.push(value)
      })
    })
    await Promise.all(promises)
    model.value = props.multiple ? values : values[0]
  } catch (error: any) {
    toast.error(error.message || error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="cursor-pointer leading-0" @click="handleClick">
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      :accept="accept"
      :disabled="isDisabled"
      :multiple="multiple"
      @change="handleFileChange"
    />

    <LoaderCircle v-if="isLoading" :class="props.className" />
    <template v-else>
      <template v-if="$slots.default">
        <slot></slot>
      </template>
      <template v-else-if="results.length > 0">
        <Image
          v-for="result in results"
          :key="result?.id"
          :src="result?.url"
          :width="width"
          :height="height"
          :class="cn('object-contain', props.className)"
        />
      </template>
      <Button
        v-else
        :class="
          cn(
            'border border-dashed rounded-xl gap-2',
            isDisabled && 'opacity-70 cursor-not-allowed',
            props.className,
          )
        "
        :style="{ width, height }"
      >
        <Plus />
        <span>{{ placeholder }}</span>
      </Button>
    </template>
  </div>
</template>
