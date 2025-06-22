<script lang="ts">
const MAX_SIZE = 20 * ONE_MB
// TODO support more file types
export const ACCEPT_IMAGE = 'image/jpeg, image/png, image/webp'
export const ACCEPT_VIDEO = 'video/mp4, video/ogg, video/webm'
export const ACCEPT_AUDIO = 'audio/mpeg, audio/ogg, audio/aac'

// prettier-ignore
export const ACCEPT_OFFICE = 'application/pdf, application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, plain/text'
export const ACCEPT_MEDIA = `${ACCEPT_IMAGE}, ${ACCEPT_VIDEO}, ${ACCEPT_AUDIO}`
export const ACCEPT_ALL = `${ACCEPT_IMAGE},  ${ACCEPT_VIDEO}, ${ACCEPT_OFFICE}`

export interface UploadResult {
  id: string
  key: string
  type: AssetType
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
import { LoaderCircle, X, UploadIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { rgbaToThumbHash } from 'thumbhash'
// import { ffmpeg } from '@/lib/ffmpeg'
import { AssetTypeEnum, type AssetType } from '@/endpoints/asset'

interface Props {
  maxSize?: number
  accept?: string
  multiple?: boolean
  maxCount?: number
  class?: string
  placeholder?: string
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  disabled?: boolean
  formDisabled?: boolean
  removeable?: boolean
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
  removeable: true,
})

interface UploadTarget {
  file: File
  type: AssetType
  img?: HTMLImageElement
  buffer?: ArrayBuffer
  width?: number
  height?: number
  duration?: number
}

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

const readFiles = (files: File[]) => {
  return files.map(
    (file) =>
      new Promise((resolve, reject) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = () => {
            const img = document.createElement('img')
            const onload = () => {
              resolve({
                file,
                type: AssetTypeEnum.IMAGE,
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
        } else if (file.type.startsWith('video/')) {
          file
            .arrayBuffer()
            .then((buffer) => {
              const video = document.createElement('video')
              video.preload = 'metadata'
              video.src = URL.createObjectURL(file)
              video.addEventListener('loadedmetadata', () => {
                resolve({
                  file,
                  type: AssetTypeEnum.VIDEO,
                  buffer,
                  width: video.videoWidth,
                  height: video.videoHeight,
                  duration: video.duration,
                })
              })
            })
            .catch(reject)
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

const compressImages = (targets: UploadTarget[]) => {
  return targets.map(
    (target) =>
      new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        canvas.width = target.width!
        canvas.height = target.height!
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(target.img!, 0, 0)
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

// const encodeVideos = (targets: UploadTarget[]) => {
//   return targets.map(
//     (target) =>
//       new Promise((resolve, reject) => {
//         ffmpeg
//           .load()
//           .catch(reject)
//           .then(() => {
//             ffmpeg
//               .writeFile(target.file.name, new Uint8Array(target.buffer!))
//               .catch(reject)
//               .then(() => {
//                 ffmpeg
//                   .exec([
//                     '-i',
//                     target.file.name,
//                     '-c:v',
//                     'libx264',
//                     '-c:a',
//                     'aac',
//                     'output.mp4',
//                   ])
//                   .catch((error) => {
//                     console.log(error)
//                   })
//                   .then(() => {
//                     ffmpeg
//                       .readFile('output.mp4')
//                       .catch(reject)
//                       .then((bytes) => {
//                         target.buffer = (bytes as Uint8Array).buffer
//                         resolve(target.buffer)
//                       })
//                   })
//               })
//           })
//       }),
//   )
// }

const uploadFiles = (targets: UploadTarget[]) => {
  return targets.map(
    (target) =>
      new Promise((resolve, reject) => {
        const formData = new FormData()

        if (target.type === AssetTypeEnum.IMAGE) {
          const blob = new Blob([target.buffer!], { type: 'image/webp' })
          formData.append('file', blob)

          const thumbhash = encodeThumbhash(target)
          if (thumbhash) {
            formData.append('thumbhash', thumbhash)
          }
          formData.append('width', String(target.width))
          formData.append('height', String(target.height))
        } else if (target.type === AssetTypeEnum.VIDEO) {
          const blob = new Blob([target.buffer!], { type: 'video/mp4' })
          formData.append('file', blob)

          formData.append('width', '1920')
          formData.append('height', '1080')
          formData.append('duration', '200')
        } else if (target.type === AssetTypeEnum.AUDIO) {
          const blob = new Blob([target.buffer!], { type: 'audio/mpeg' })
          formData.append('file', blob)

          formData.append('duration', '200')
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
            emit('upload', url, result, target.file)
            resolve(result)
          })
          .catch((error) => {
            reject(error.messages)
          })
      }),
  ) as Promise<UploadResult>[]
}

const processFiles = async (files: File[]) => {
  try {
    isLoading.value = true

    const targets = await Promise.all(readFiles(Array.from(files)))
    await Promise.all(checkFiles(targets))
    await Promise.all(
      compressImages(
        targets.filter((target) => target.type === AssetTypeEnum.IMAGE),
      ),
    )
    // await Promise.all(
    //   encodeVideos(
    //     targets.filter((target) => target.type === AssetTypeEnum.VIDEO),
    //   ),
    // )

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
defineExpose({
  processFiles,
})

const handleFileChange = async (e: Event) => {
  const { files } = e.target as HTMLInputElement
  if (!files || files.length === 0) {
    return
  }

  if (files.length > props.maxCount) {
    toast.error(`最多上传 ${props.maxCount} 个文件`)
    return
  }

  processFiles(Array.from(files))
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
